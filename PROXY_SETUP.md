# 跨域问题解决方案

## 问题说明

GitHub Pages 是纯静态网站托管，无法运行服务器端代码。当直接调用 API 时，如果 API 服务器没有配置 CORS（跨域资源共享），浏览器会阻止跨域请求。

## 解决方案

### 方案 1：使用 Vercel 代理服务（推荐）

Vercel 提供免费的 Serverless Functions，可以轻松创建代理服务。

#### 步骤 1：部署代理服务到 Vercel

1. 在 Vercel 创建新项目：https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 在项目设置中添加环境变量：
   - `VITE_MIMO_KEY`: 你的 API 密钥
   - `VITE_MIMO_BASE_URL`: `https://api.xiaomimimo.com/v1`
   - `VITE_MIMO_MODEL`: `mimo-v2-flash`
4. 部署后，Vercel 会提供一个 URL，例如：`https://your-project.vercel.app`

#### 步骤 2：配置 GitHub Pages 使用代理

在 GitHub Secrets 中添加：

```
VITE_PROXY_URL = https://your-project.vercel.app/api
```

#### 步骤 3：重新部署

推送代码或手动触发 GitHub Actions 部署。

### 方案 2：使用 Cloudflare Workers（推荐）

Cloudflare Workers 提供免费的边缘计算服务。

#### 步骤 1：创建 Cloudflare Worker

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages → Create application → Create Worker
3. 使用以下代码：

```javascript
export default {
  async fetch(request, env) {
    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const apiKey = env.VITE_MIMO_KEY
    const baseUrl = env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1'

    if (!apiKey) {
      return new Response('API key not configured', { status: 500 })
    }

    try {
      // 获取请求体
      const body = await request.json()

      // 转发请求
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      // 创建响应并添加 CORS 头
      const responseData = await response.text()

      return new Response(responseData, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      return new Response(error.message, { status: 500 })
    }
  },
}
```

4. 在 Worker 设置中添加环境变量（Secrets）：
   - `VITE_MIMO_KEY`: 你的 API 密钥
   - `VITE_MIMO_BASE_URL`: `https://api.xiaomimimo.com/v1`

5. 部署 Worker，获得 URL，例如：`https://your-worker.your-subdomain.workers.dev`

#### 步骤 2：配置 GitHub Pages

在 GitHub Secrets 中添加：

```
VITE_PROXY_URL = https://your-worker.your-subdomain.workers.dev
```

### 方案 3：使用 Netlify Functions

1. 在 Netlify 创建新站点
2. 创建 `netlify/functions/proxy.ts` 文件（使用与 Vercel 类似的代码）
3. 配置环境变量并部署
4. 在 GitHub Secrets 中设置 `VITE_PROXY_URL`

### 方案 4：使用公共 CORS 代理（不推荐，仅用于测试）

⚠️ **警告**：此方案会暴露你的 API 密钥，仅用于测试！

可以使用公共 CORS 代理服务，但存在安全风险。

## 推荐配置

### 使用 Vercel（最简单）

1. **部署代理服务**：
   - 项目已包含 `api/proxy.ts` 和 `vercel.json`
   - 在 Vercel 导入仓库并部署
   - 配置环境变量

2. **配置 GitHub Secrets**：

   ```
   VITE_PROXY_URL = https://your-vercel-app.vercel.app/api
   VITE_MIMO_KEY = your_api_key
   VITE_MIMO_BASE_URL = https://api.xiaomimimo.com/v1
   VITE_MIMO_MODEL = mimo-v2-flash
   ```

3. **重新部署 GitHub Pages**

## 验证

部署后，打开浏览器开发者工具（F12），查看 Network 标签：

- 如果请求成功，说明代理配置正确
- 如果看到 CORS 错误，检查代理服务的 CORS 头设置

## 故障排查

### 问题：仍然出现跨域错误

1. 检查 `VITE_PROXY_URL` 是否正确设置
2. 检查代理服务是否正常运行
3. 检查代理服务的 CORS 头是否正确设置

### 问题：代理服务返回 500 错误

1. 检查代理服务的环境变量是否正确配置
2. 查看代理服务的日志（Vercel/Cloudflare Dashboard）

### 问题：API 密钥泄露

如果使用公共代理服务，API 密钥可能被泄露。建议：

- 使用自己部署的代理服务
- 定期轮换 API 密钥
- 在 API 提供商处设置 IP 白名单（如果支持）
