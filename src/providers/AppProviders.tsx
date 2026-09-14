import { bootstrap } from '@/app/bootstrap';
import { AppLoading } from '@/components';
import { useAppTheme } from '@/hooks';
import { toggleClass } from '@gvray/domkit';
import { useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import { App, ConfigProvider } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppIntlProvider, {
  ANTD_LOCALE_MAP,
  DEFAULT_LOCALE,
} from './IntlProvider';
import StyledThemeProvider from './StyledThemeProvider';

/**
 * 全局根级 Provider 组合。
 *
 * 设计原则：
 * 1. 只放「所有页面共享」的 Provider（包括无布局的登录/注册/404 等）。
 * 2. 不放「仅后台布局需要」的 Provider（如 RouteMetaProvider、SideNav UI 壳子），那些留在 Layout。
 * 3. 在 Router 渲染前先执行 bootstrap，完成后再渲染子应用。
 * 4. 只有一个 ConfigProvider，theme + locale + App 统一配置，避免嵌套。
 */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    bootstrap().finally(() => setReady(true));
  }, []);

  const { system } = runtimeConfig.get();
  const colorPrimary = useSettingStore((s) => s.colorPrimary);
  const colorWeak = useSettingStore((s) => s.colorWeak);
  const language = useSettingStore((s) => s.language);
  const { themeAlgorithm } = useAppTheme();
  const grayMode = runtimeConfig.get().ui.grayMode;

  const antdLocale = useMemo(() => {
    return ANTD_LOCALE_MAP[language] || ANTD_LOCALE_MAP[DEFAULT_LOCALE];
  }, [language]);

  // 全局样式类（色弱 / 灰度）挂到 body，比 Layout 级作用更早
  useEffect(() => {
    toggleClass(document.body, 'color-weak', !!colorWeak);
    toggleClass(document.body, 'gray-mode', !!grayMode);
  }, [colorWeak, grayMode]);

  if (!ready) {
    return <AppLoading />;
  }

  return (
    <HelmetProvider>
      <AppIntlProvider>
        <Helmet>
          <title>{system.name}</title>
        </Helmet>
        <ConfigProvider
          locale={antdLocale}
          theme={{
            algorithm: themeAlgorithm,
            cssVar: { prefix: 'gvray', key: 'gvray' },
            token: { colorPrimary, colorInfo: colorPrimary },
            components: {
              Menu: {
                darkItemSelectedBg: colorPrimary,
              },
            },
          }}
        >
          <App>
            <StyledThemeProvider>{children}</StyledThemeProvider>
          </App>
        </ConfigProvider>
      </AppIntlProvider>
    </HelmetProvider>
  );
};

export default AppProviders;
