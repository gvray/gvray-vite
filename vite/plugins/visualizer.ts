import { visualizer } from 'rollup-plugin-visualizer'

const TEMPLATES = ['treemap', 'list'] as const

export default function createVisualizer() {
  return TEMPLATES.map((template, index) =>
    visualizer({
      open: index === 0,
      filename: `dist/bundle-${template}.html`,
      gzipSize: true,
      brotliSize: true,
      sourcemap: false,
      template,
      title: `Bundle — ${template}`,
      projectRoot: process.cwd(),
    }),
  )
}
