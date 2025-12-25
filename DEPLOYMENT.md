# GitHub Pages 部署指南

本文档说明如何将项目部署到 GitHub Pages，以及如何配置 API 密钥。

## 📋 前置条件

1. 项目已推送到 GitHub 仓库
2. 仓库已启用 GitHub Pages（Settings → Pages）
3. 已获取 Xiaomi MiMo API 密钥

## 🚀 部署步骤

### 1. 配置 GitHub Secrets

由于 GitHub Pages 是静态网站，环境变量需要在构建时注入。我们需要使用 GitHub Secrets 来安全地存储敏感信息。

#### 设置步骤：

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 添加以下密钥：
   - **`VITE_MIMO_KEY`**: 你的 Xiaomi MiMo API 密钥
   - **`VITE_MIMO_BASE_URL`** (可选): API 基础地址，默认为 `https://api.xiaomimimo.com/v1`
   - **`VITE_MIMO_MODEL`** (可选): 模型名称，默认为 `mimo-v2-flash`

#### 必需配置：

```
VITE_MIMO_KEY = "your_xiaomi_mimo_api_key_here"
```

#### 可选配置：

```
VITE_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
VITE_MIMO_MODEL = "mimo-v2-flash"
```

### 2. 启用 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. 在 **Source** 部分，选择：
   - **Source**: `GitHub Actions`
3. 保存设置

### 3. 触发部署

部署会在以下情况自动触发：

- 推送到 `main` 分支
- 手动触发（Actions → Deploy to GitHub Pages → Run workflow）

### 4. 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看最新的工作流运行状态
3. 部署成功后，访问你的 GitHub Pages 地址：
   ```
   https://[你的用户名].github.io/our-hackthon/
   ```

## 🔐 密钥管理说明

### 为什么需要 GitHub Secrets？

GitHub Pages 是静态网站托管服务，无法在运行时读取环境变量。因此：

1. **构建时注入**：环境变量在构建时通过 GitHub Actions 注入到代码中
2. **安全存储**：使用 GitHub Secrets 可以安全地存储敏感信息，不会暴露在代码中
3. **自动部署**：每次推送代码时，GitHub Actions 会自动使用 Secrets 中的值进行构建

### 密钥安全提示

⚠️ **重要**：

- 不要将 API 密钥提交到代码仓库
- 不要将 `.env` 文件提交到 Git（已在 `.gitignore` 中排除）
- 使用 GitHub Secrets 存储所有敏感信息
- 定期轮换 API 密钥

### 如何更新密钥

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 找到要更新的密钥，点击编辑
3. 更新值后保存
4. 重新触发部署（或等待下次自动部署）

## 🔧 本地开发 vs 生产环境

### 本地开发

- 使用 `.env` 文件存储环境变量
- 使用 Vite 代理（`/api`）转发请求，避免跨域问题
- 运行 `pnpm dev` 启动开发服务器

### 生产环境（GitHub Pages）

- 使用 GitHub Secrets 存储环境变量
- 直接调用 API（不使用代理）
- 自动构建和部署

## 📝 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库的 **Settings** → **Pages** 中配置自定义域名
2. 修改 `vite.config.ts` 中的 `base` 配置为 `/`
3. 更新 DNS 记录指向 GitHub Pages

## 🐛 故障排查

### 部署失败

1. 检查 GitHub Actions 日志
2. 确认所有必需的 Secrets 已设置
3. 检查构建错误信息

### API 调用失败

1. 确认 `VITE_MIMO_KEY` 已正确设置
2. 检查 API 密钥是否有效
3. 查看浏览器控制台的错误信息

### 跨域错误（CORS）

如果遇到跨域错误，需要配置代理服务。查看 [PROXY_SETUP.md](./PROXY_SETUP.md) 获取详细解决方案。

**快速解决**：

1. 部署代理服务到 Vercel（项目已包含 `api/proxy.ts`）
2. 在 GitHub Secrets 中添加 `VITE_PROXY_URL`，值为你的 Vercel 应用 URL + `/api`
3. 重新部署

### 页面无法访问

1. 确认 GitHub Pages 已启用
2. 检查仓库的 Pages 设置
3. 确认部署工作流已成功完成

### 刷新页面出现 404 错误

这是单页应用（SPA）在 GitHub Pages 上的常见问题。项目已包含 `public/404.html` 文件来自动处理此问题。

**解决方案**：

- 项目已配置 `404.html` 文件，构建时会自动复制到 `dist` 目录
- GitHub Pages 会自动使用 `404.html` 处理所有找不到的页面
- `404.html` 会自动重定向到 `index.html`，让 Vue Router 处理路由

如果仍然遇到问题：

1. 确认 `public/404.html` 文件存在
2. 检查构建输出中是否包含 `dist/404.html`
3. 清除浏览器缓存后重试

## 📚 相关资源

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
