import NavigationProgress from '@/components/NavigationProgress';
import { useAuth, useRouteMeta } from '@/hooks';
import { RouteMetaProvider } from '@/providers';
import { useSettingStore } from '@/stores';
import { redirectToLogin } from '@/utils';
import { runtimeConfig } from '@/utils/runtime-config';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { Navigate, Outlet } from 'react-router';

/**
 * 路由根布局：所有页面入口的公共根。
 *
 * 负责非视觉、需路由上下文的全局职责：
 * - 路由级认证 / 权限守卫
 * - 文档标题（Helmet）
 * - 当前路由元信息注入（RouteMetaProvider，供下层视觉 Layout 及子组件消费）
 * - 页面切换进度（NavigationProgress）
 * - 全局视觉态类名（color-weak / gray-mode）
 *
 * 不含视觉布局壳（Sider/Header/Content 在子级 Layout），
 * 也不含全局 Provider（主题/国际化在 src/app/App.tsx，覆盖所有路由）。
 */
const BasicLayout: React.FC = () => {
  const { system } = runtimeConfig.get();
  const meta = useRouteMeta();
  const { isLogin, permissions } = useAuth();
  const colorWeak = useSettingStore((s) => s.colorWeak);

  const routeTitle = meta.title ?? '';
  const documentTitle = routeTitle
    ? `${routeTitle} - ${system.name}`
    : system.name;

  const layoutClassName = clsx({
    'color-weak': colorWeak,
    'gray-mode': runtimeConfig.get().ui.grayMode,
  });

  if (meta.auth !== false && !isLogin) {
    redirectToLogin();
    return null;
  }

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
      <div className={layoutClassName}>
        <NavigationProgress />
        <Outlet />
      </div>
    </RouteMetaProvider>
  );
};

export default BasicLayout;
