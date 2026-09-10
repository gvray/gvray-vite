import { useSettingStore } from '@/stores';
import { startSystemThemeWatcher, stopSystemThemeWatcher } from '@/utils/theme';
import { theme as antdTheme } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const useAppTheme = () => {
  const { theme } = useSettingStore();
  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const themeAlgorithm = useMemo(() => {
    if (theme === 'dark') {
      return antdTheme.darkAlgorithm;
    } else if (theme === 'system') {
      if (systemTheme === 'dark') {
        return antdTheme.darkAlgorithm;
      }
    }
    return antdTheme.defaultAlgorithm;
  }, [theme, systemTheme]);

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
    const resolved =
      theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    document.documentElement.dataset.theme = resolved ? 'dark' : 'light';
  }, [theme, systemTheme]);

  return { themeAlgorithm };
};

export default useAppTheme;
