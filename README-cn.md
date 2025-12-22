# Xiaomi MiMo Chat (Mock ChatGPT)

这是一个基于 Vue 3 + Vite 的前端聊天应用，模仿了 ChatGPT 的界面风格，并对接了 **Xiaomi MiMo** 大模型 API。

项目特点：

- **纯前端架构**：无需 Node.js 后端服务，直接通过浏览器调用 API。
- **流式响应**：支持打字机效果的实时流式对话（Streaming）。
- **开发代理**：配置了 Vite Proxy 解决本地开发时的跨域（CORS）问题。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建或修改 `.env` 文件，填入你的 Xiaomi MiMo API Key 和 Base URL：

```env
# API 密钥
VITE_MIMO_KEY="your_xiaomi_mimo_api_key"

# API 基础地址 (例如：https://api.xiaomimimo.com/v1)
VITE_MIMO_BASE_URL="https://api.xiaomimimo.com/v1"

# 模型名称
VITE_MIMO_MODEL="mimo-v2-flash"
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问本地地址（通常是 `http://localhost:5173`）。

## 关于跨域 (CORS)

由于浏览器安全限制，直接从前端请求第三方 API 通常会遇到 CORS 错误。本项目在 `vite.config.ts` 中配置了开发服务器代理：

- 前端请求地址：`/api/chat/completions`
- 实际转发地址：`${VITE_MIMO_BASE_URL}/chat/completions`

**注意**：修改 `.env` 或 `vite.config.ts` 后，**必须重启** `npm run dev` 才能生效。

## 技术栈

- **Vue 3** (Script Setup)
- **TypeScript**
- **Vite**
- **Vanilla CSS** (手写样式，未使用 Tailwind)

## 目录结构

- `src/views/ChatView.vue` - 核心聊天界面逻辑
- `vite.config.ts` - Vite 配置（包含 Proxy 设置）
- `.env` - 环境变量配置
