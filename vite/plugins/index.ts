import type { PluginOption } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import createMock from './mock.ts'

export default function createVitePlugins(mockEnabled: boolean): PluginOption[] {
  return [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    createMock(mockEnabled),
  ]
}
