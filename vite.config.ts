import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 让 Vite 也读取 .env.{mode}，保证 import.meta.env 可用（虽然项目主要用 define 注入）
  loadEnv(mode, process.cwd(), 'APP_')

  const appEnv = process.env.APP_ENV ?? ''
  const appApiUrl = process.env.APP_API_URL ?? ''
  const appApiOrigin = process.env.APP_API_ORIGIN ?? ''
  const appApiTokenKey = process.env.APP_API_TOKEN_KEY ?? ''
  const appApiTimeout = Number(process.env.APP_API_TIMEOUT ?? 10000)
  const appCdnUrl = process.env.APP_CDN_URL ?? ''
  const appVersion = process.env.APP_VERSION ?? ''
  const appBuildTime = process.env.APP_BUILD_TIME ?? ''
  const appSentryDsn = process.env.APP_SENTRY_DSN ?? ''
  const appTrackingId = process.env.APP_TRACKING_ID ?? ''
  const appMockEnabled = process.env.APP_MOCK_ENABLED === 'true'
  const appLoggingEnabled = process.env.APP_LOGGING_ENABLED === 'true'
  const appDefaultLanguage = process.env.APP_DEFAULT_LANGUAGE ?? 'zh-CN'
  const appDefaultAvatarUrl = process.env.APP_DEFAULT_AVATAR_URL ?? ''

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
    define: {
      __APP_ENV__: JSON.stringify(appEnv),
      __APP_API_URL__: JSON.stringify(appApiUrl),
      __APP_API_ORIGIN__: JSON.stringify(appApiOrigin),
      __APP_API_TOKEN_KEY__: JSON.stringify(appApiTokenKey),
      __APP_API_TIMEOUT__: appApiTimeout,
      __APP_CDN_URL__: JSON.stringify(appCdnUrl),
      __APP_VERSION__: JSON.stringify(appVersion),
      __APP_BUILD_TIME__: JSON.stringify(appBuildTime),
      __APP_SENTRY_DSN__: JSON.stringify(appSentryDsn),
      __APP_TRACKING_ID__: JSON.stringify(appTrackingId),
      __APP_MOCK_ENABLED__: appMockEnabled,
      __APP_LOGGING_ENABLED__: appLoggingEnabled,
      __APP_DEFAULT_LANGUAGE__: JSON.stringify(appDefaultLanguage),
      __APP_DEFAULT_AVATAR_URL__: JSON.stringify(appDefaultAvatarUrl),
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      viteMockServe({
        mockPath: 'mock',
        enable: appMockEnabled,
        logger: appMockEnabled,
      }),
    ],
  }
})
