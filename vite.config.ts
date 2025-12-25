import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import { resolve } from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 插件：在构建后复制 index.html 到 404.html（用于 GitHub Pages）
const copy404Plugin = () => {
  return {
    name: 'copy-404',
    writeBundle() {
      const outDir = resolve(process.cwd(), 'dist')
      const indexPath = resolve(outDir, 'index.html')
      const targetPath = resolve(outDir, '404.html')

      try {
        // 读取构建后的 index.html
        const indexContent = readFileSync(indexPath, 'utf-8')
        // 写入 404.html
        writeFileSync(targetPath, indexContent, 'utf-8')
        console.log('✓ Copied index.html to 404.html for GitHub Pages')
      } catch (error) {
        console.warn('Failed to copy index.html to 404.html:', error)
      }
    },
  }
}

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
    plugins: [vue(), vueDevTools(), copy404Plugin()],
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
