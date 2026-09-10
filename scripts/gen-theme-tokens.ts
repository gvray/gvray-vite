/**
 * 生成 antd CSS 变量参考表（--gvray-*）。
 *
 * 原理：在 jsdom 里真渲染 <ConfigProvider theme={{ cssVar }}>，
 * 读取 antd cssinjs 注入到 :root 的真实样式表 —— 名字与值都来自 antd 运行时，
 * 不靠手抄、不靠正则猜 camelCase→kebab 规则（borderRadiusLG 是 lg 还是 l-g 由 antd 说了算）。
 *
 * 产出：src/styles/_theme-tokens.scss（纯注释参考表，不参与编译）。
 * 更新：pnpm gen:theme-tokens（antd 升级 / 主色调整后重跑）。
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button, ConfigProvider, theme } from 'antd';

// 与 src/providers/AppProviders.tsx 的 ConfigProvider 配置一致；主色改了这里同步改。
const COLOR_PRIMARY = '#1890ff';

function setupJsdom() {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
  });
  const { window } = dom;
  // Node 21+ 自带只读 navigator 等全局，需容错：已存在且不可写则跳过。
  const defs: Record<string, unknown> = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    Node: window.Node,
    MutationObserver: window.MutationObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    CSSStyleDeclaration: window.CSSStyleDeclaration,
    requestAnimationFrame: (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number,
    cancelAnimationFrame: (id: number) => clearTimeout(id),
  };
  for (const [k, v] of Object.entries(defs)) {
    try {
      Object.defineProperty(globalThis, k, { value: v, writable: true, configurable: true });
    } catch {
      /* 已存在且不可配置，使用 Node 内置值 */
    }
  }
  return window;
}

function collectCssVarDecls(window: Window): Map<string, string> {
  const css = Array.from(window.document.querySelectorAll('head style'))
    .map((s) => s.textContent ?? '')
    .join('\n');
  const decls = new Map<string, string>();
  const re = /(--gvray-[\w-]+)\s*:\s*([^;}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1];
    const value = m[2].trim();
    if (!decls.has(name)) decls.set(name, value);
  }
  return decls;
}

// 分组顺序 + 标题；匹配按前缀，首个命中归属。
const GROUPS: { title: string; match: (k: string) => boolean }[] = [
  { title: '主色系', match: (k) => k.startsWith('--gvray-color-primary') },
  { title: '功能色（success / warning / error / info）', match: (k) =>
    /^--gvray-color-(success|warning|error|info)/.test(k) },
  { title: '文本色', match: (k) => k.startsWith('--gvray-color-text') },
  { title: '背景色', match: (k) => k.startsWith('--gvray-color-bg') },
  { title: '边框 / 分割线', match: (k) => k.startsWith('--gvray-color-border') || k === '--gvray-color-split' },
  { title: '填充色', match: (k) => k.startsWith('--gvray-color-fill') },
  { title: '链接色', match: (k) => k.startsWith('--gvray-color-link') },
  { title: '图标色', match: (k) => k.startsWith('--gvray-color-icon') },
  { title: '其他颜色', match: (k) => k.startsWith('--gvray-color-') },
  { title: '圆角', match: (k) => k.startsWith('--gvray-border-radius') },
  { title: '阴影', match: (k) => k.startsWith('--gvray-box-shadow') },
  { title: '字体', match: (k) => k.startsWith('--gvray-font-') },
  { title: '行高', match: (k) => k.startsWith('--gvray-line-height') },
  { title: '控件高度', match: (k) => k.startsWith('--gvray-control-') },
  { title: '间距（margin / padding）', match: (k) => /^--gvray-(margin|padding)/.test(k) },
  { title: '动效', match: (k) => k.startsWith('--gvray-motion') },
  { title: '屏幕断点', match: (k) => k.startsWith('--gvray-screen') },
  { title: '层级', match: (k) => k.startsWith('--gvray-z-index') },
  { title: '透明度', match: (k) => k.startsWith('--gvray-opacity') },
];

function formatOutput(decls: Map<string, string>): string {
  const lines: string[] = [];
  lines.push('// ============================================================');
  lines.push('// antd CSS 变量参考表（--gvray-*）');
  lines.push('// ------------------------------------------------------------');
  lines.push('// ⚠️ 由 scripts/gen-theme-tokens.ts 自动生成，请勿手改。');
  lines.push('//    更新命令：pnpm gen:theme-tokens');
  lines.push('//    数据来源：antd ConfigProvider cssVar 运行时注入（非手抄）');
  lines.push('//    配置：colorPrimary / colorInfo = ' + COLOR_PRIMARY + '（见 AppProviders.tsx）');
  lines.push('//    生成时间：' + new Date().toISOString());
  lines.push('//    直接在样式中使用 var(--gvray-color-xxx)，不要用 SCSS 变量二次包装。');
  lines.push('// ============================================================');
  lines.push('');

  // 多行值（含换行的 boxShadow / fontFamily）的续行补 // 前缀，
  // 否则续行成为裸代码行，SCSS 解析报错。
  const renderValue = (v: string): string[] =>
    v.split('\n').map((line, i) => (i === 0 ? line : '// ' + ' '.repeat(0) + line));

  const renderEntry = (k: string, v: string, width: number): string[] => {
    const [first, ...rest] = renderValue(v);
    const out = [`// ${k.padEnd(width)}  ${first}`];
    for (const r of rest) out.push(`// ${' '.repeat(width + 4)}${r.replace(/^\/\/ /, '')}`);
    return out;
  };

  const used = new Set<string>();
  for (const group of GROUPS) {
    const items = Array.from(decls.entries())
      .filter(([k]) => group.match(k) && !used.has(k))
      .sort(([a], [b]) => a.localeCompare(b));
    if (!items.length) continue;
    items.forEach(([k]) => used.add(k));
    lines.push('// ============ ' + group.title + ' ============');
    const width = Math.max(...items.map(([k]) => k.length));
    for (const [k, v] of items) {
      lines.push(...renderEntry(k, v, width));
    }
    lines.push('');
  }

  const rest = Array.from(decls.entries())
    .filter(([k]) => !used.has(k))
    .sort(([a], [b]) => a.localeCompare(b));
  if (rest.length) {
    lines.push('// ============ 其他 ============');
    const width = Math.max(...rest.map(([k]) => k.length));
    for (const [k, v] of rest) {
      lines.push(...renderEntry(k, v, width));
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const window = setupJsdom();
  const container = window.document.getElementById('root')!;
  const root = createRoot(container);
  // 渲染 ConfigProvider + Button：Button 触发 cssinjs 注入全局 :root token 样式。
  flushSync(() => {
    root.render(
      React.createElement(
        ConfigProvider,
        {
          theme: {
            algorithm: theme.defaultAlgorithm,
            cssVar: { prefix: 'gvray', key: 'gvray' },
            token: { colorPrimary: COLOR_PRIMARY, colorInfo: COLOR_PRIMARY },
          },
        },
        React.createElement(Button, null, 'probe'),
      ),
    );
  });

  const decls = collectCssVarDecls(window);
  root.unmount();

  if (!decls.size) {
    console.error('✗ 未采集到任何 --gvray-* 变量，渲染可能未触发注入。');
    process.exit(1);
  }

  const out = formatOutput(decls);
  const dest = resolve(process.cwd(), 'src/styles/_theme-tokens.scss');
  writeFileSync(dest, out, 'utf8');
  console.log(`✓ 生成 ${decls.size} 个变量 → ${dest}`);

  // 诊断：钉死 borderRadiusLG 的命名（连续大写是否合并）
  const lg = ['--gvray-border-radius-lg', '--gvray-border-radius-l-g']
    .map((k) => [k, decls.has(k)])
    .filter(([, v]) => v);
  console.log('  borderRadiusLG 命名:', lg.length ? lg[0][0] : '（未命中，检查渲染）');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
