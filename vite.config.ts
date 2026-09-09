import { defineConfig } from 'vite'
import path from 'node:path'
import { createAppDefines } from './vite/plugins/env.ts'
import createVitePlugins from './vite/plugins/index.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载 .env.{mode} 基底，再用 .env 本地覆盖（override，最高优先级），生成 __APP_*__ 全局常量
  const define = createAppDefines(mode)
  const mockEnabled = define.__APP_MOCK_ENABLED__ as boolean

  return {
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/styles/variables.scss" as *;
            @use "@/styles/mixins.scss" as *;
          `,
        },
      },
    },
    define,
    plugins: createVitePlugins(mockEnabled),
  }
})
