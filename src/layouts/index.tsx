import AppWatermark from '@/components/AppWatermark';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/components/Icon/init';
import NavigationProgress from '@/components/NavigationProgress';
import { useAuth, useRouteMeta } from '@/hooks';
import { RouteMetaProvider } from '@/providers';
import { useSettingStore } from '@/stores';
import { redirectToLogin } from '@/utils';
import { runtimeConfig } from '@/utils/runtime-config';
import { Layout } from 'antd';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { Navigate, Outlet } from 'react-router';
import styled from 'styled-components';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import AppViewport from './components/AppViewport';
import SideNav from './components/SideNav';

const AppLayout = styled(Layout)`
  height: 100%;
`;

/**
 * 后台布局：负责 UI 壳子（SideNav + Header + Content + Footer）
 * 以及路由级认证/权限守卫。
 *
 * 全局 Provider（Theme、Config、Intl、Helmet、App 上下文等）已全部上提到
 * src/providers/AppProviders.tsx，通过 Router 注入，覆盖所有页面。
 */
export default function BaseLayout() {
  const { system } = runtimeConfig.get();
  const {
    sidebarCollapsed,
    sidebarTheme,
    showLogo,
    fixedHeader,
    showFooter,
    colorWeak,
  } = useSettingStore();
  const grayMode = runtimeConfig.get().ui.grayMode;
  const meta = useRouteMeta();
  const { isLogin, permissions } = useAuth();

  const routeTitle = meta.title ?? '';

  const documentTitle = routeTitle
    ? `${routeTitle} - ${system.name}`
    : system.name;

  const layoutClassName = clsx({
    'color-weak': colorWeak,
    'gray-mode': grayMode,
  });

  // 路由级认证守卫：需要登录且未登录时跳转登录页
  if (meta.auth !== false && !isLogin) {
    redirectToLogin();
    return null;
  }

  // 路由级权限守卫：已登录且路由配置了权限时校验
  if (isLogin && meta.permissions && meta.permissions.length > 0) {
    const hasPermission =
      permissions?.includes('*:*:*') ||
      meta.permissions.every((permission) => permissions?.includes(permission));
    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  return (
    <RouteMetaProvider meta={meta}>
      <Helmet>
        <title>{documentTitle}</title>
      </Helmet>
      <AppLayout className={layoutClassName}>
        <SideNav
          collapsed={sidebarCollapsed}
          sidebarTheme={sidebarTheme}
          showLogo={showLogo}
        />
        <AppViewport>
          <NavigationProgress />
          <AppHeader headerFixed={fixedHeader} />

          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <AppFooter
            visible={showFooter}
            text={system.footerText}
            copyright={system.copyright}
            icp={system.icp}
          />
          <AppWatermark />
        </AppViewport>
      </AppLayout>
    </RouteMetaProvider>
  );
}
