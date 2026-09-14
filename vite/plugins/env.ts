import { loadEnvFiles } from '../../scripts/load-env.ts'

// 默认值是「未在 .env.* 中设置时的回退」的单一来源；
// 其 JS 类型同时决定环境变量的强制转换方式（number / boolean / string）。
const APP_DEFAULTS = {
  APP_ENV: '',
  APP_API_URL: '',
  APP_API_ORIGIN: '',
  APP_API_TOKEN_KEY: '',
  APP_API_TIMEOUT: 10000,
  APP_CDN_URL: '',
  APP_VERSION: '',
  APP_BUILD_TIME: '',
  APP_SENTRY_DSN: '',
  APP_TRACKING_ID: '',
  APP_MOCK_ENABLED: false,
  APP_LOGGING_ENABLED: false,
  APP_DEFAULT_LANGUAGE: 'zh-CN',
  APP_DEFAULT_AVATAR_URL: '',
  APP_AES_KEY: '',
  APP_AES_IV: '',
} as const

export function createAppDefines(mode: string): Record<string, string | number | boolean> {
  loadEnvFiles(mode)

  const defines: Record<string, string | number | boolean> = {}
  for (const [key, fallback] of Object.entries(APP_DEFAULTS)) {
    const raw = process.env[key]
    const globalKey = `__APP_${key.replace(/^APP_/, '')}__`

    if (typeof fallback === 'number') {
      defines[globalKey] = Number(raw ?? fallback)
    } else if (typeof fallback === 'boolean') {
      defines[globalKey] = raw === 'true'
    } else {
      defines[globalKey] = JSON.stringify(raw ?? fallback)
    }
  }
  return defines
}
