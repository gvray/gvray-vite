import { useSettingStore } from '@/stores';
import {
  getSystemTheme,
  resolveThemeMode,
  startSystemThemeWatcher,
  stopSystemThemeWatcher,
} from '@/utils/theme';
import { theme as antdTheme } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const useAppTheme = () => {
  const { theme } = useSettingStore();
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedMode = resolveThemeMode(theme, systemTheme);

  const themeAlgorithm = useMemo(() => {
    return resolvedMode === 'dark'
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm;
  }, [resolvedMode]);

  useEffect(() => {
    if (theme === 'system') {
      startSystemThemeWatcher(setSystemTheme);
    }
    return () => {
      stopSystemThemeWatcher();
    };
  }, [theme]);

  // 把解析后的主题写到 <html data-theme>，供自定义 CSS 变量（如 --gvray-shadow-card）
  // 按亮/暗分桶。antd cssVar 不暴露此属性，这里自有作用域。
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  return { themeAlgorithm };
};

export default useAppTheme;
