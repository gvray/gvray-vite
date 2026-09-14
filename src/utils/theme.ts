import type { ThemeMode, ThemeModeWithoutSystem } from '@/constants';
import { getPrefersColorScheme } from '@gvray/domkit';

/**
 * 把存储的 theme 模式（含 system）解析为确定的 light/dark。
 * @param mode - 当前模式
 * @param systemTheme - 已知的系统主题；未提供时实时读取 prefers-color-scheme
 */
export const resolveThemeMode = (
  mode: ThemeMode,
  systemTheme?: ThemeModeWithoutSystem,
): ThemeModeWithoutSystem => {
  if (mode === 'system') return systemTheme ?? getPrefersColorScheme();
  return mode;
};
