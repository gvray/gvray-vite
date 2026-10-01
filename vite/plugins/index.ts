import type { PluginOption } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import createMock from './mock.ts'
import createVisualizer from './visualizer.ts'

export default function createVitePlugins(mockEnabled: boolean, mode = ''): PluginOption[] {
  const plugins: PluginOption[] = [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    createMock(mockEnabled),
  ]

  if (mode === 'analyze') {
    plugins.push(createVisualizer())
  }

  return plugins
}
