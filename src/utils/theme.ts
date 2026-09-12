// --- 系统主题监听器封装 ---

import type { ThemeMode, ThemeModeWithoutSystem } from '@/constants';

let mediaQuery: MediaQueryList | null = null;
let listener: ((e: MediaQueryListEvent) => void) | null = null;

export function getSystemTheme(): ThemeModeWithoutSystem {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const startSystemThemeWatcher = (
  setSystemTheme: (v: ThemeModeWithoutSystem) => void,
) => {
  if (mediaQuery) return; // 防止重复监听

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  listener = (e: MediaQueryListEvent) => {
    const mode: ThemeModeWithoutSystem = e.matches ? 'dark' : 'light';
    setSystemTheme(mode);
  };
  mediaQuery.addEventListener('change', listener);
  // 立即同步一次当前值
  setSystemTheme(getSystemTheme());
};

export const stopSystemThemeWatcher = () => {
  if (mediaQuery && listener) {
    mediaQuery.removeEventListener('change', listener);
    mediaQuery = null;
    listener = null;
  }
};

/**
 * 把存储的 theme 模式（含 system）解析为确定的 light/dark。
 * @param mode - 当前模式
 * @param systemTheme - 已知的系统主题；未提供时会实时读取 matchMedia
 */
export const resolveThemeMode = (
  mode: ThemeMode,
  systemTheme?: ThemeModeWithoutSystem,
): ThemeModeWithoutSystem => {
  if (mode === 'system') return systemTheme ?? getSystemTheme();
  return mode;
};
