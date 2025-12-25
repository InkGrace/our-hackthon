import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // GitHub Pages 部署需要设置 base 路径
  // 如果设置了 GITHUB_REPOSITORY 环境变量，使用仓库名作为 base
  // 否则默认使用 '/'（适用于自定义域名或根路径部署）
  const base = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/'

  return {
    base,
    plugins: [vue(), vueDevTools()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
