import { viteMockServe } from 'vite-plugin-mock'

export default function createMock(enabled: boolean) {
  return viteMockServe({
    mockPath: 'mock',
    enable: enabled,
    logger: enabled,
  })
}
