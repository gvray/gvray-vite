import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { lazyProgress, PageLoading } from '@/components';
import { routes as appRoutes, type AppRouteObject } from './routes';

/**
 * 组件路径映射表。
 */
const componentMap: Record<string, React.ComponentType<Record<string, never>>> = {
  'layouts/BasicLayout': lazyProgress(() => import('@/layouts/BasicLayout')),
  'layouts/Layout': lazyProgress(() => import('@/layouts/Layout')),
  'pages/Login': lazyProgress(() => import('@/pages/Login')),
  'pages/Register': lazyProgress(() => import('@/pages/Register')),
  'pages/Dashboard': lazyProgress(() => import('@/pages/Dashboard')),
  'pages/Docs': lazyProgress(() => import('@/pages/Docs')),
  'pages/Profile': lazyProgress(() => import('@/pages/Profile')),
  'pages/Error/403': lazyProgress(() => import('@/pages/Error/403')),
  'pages/Error/404': lazyProgress(() => import('@/pages/Error/404')),
  'pages/System/User': lazyProgress(() => import('@/pages/System/User')),
  'pages/System/Role': lazyProgress(() => import('@/pages/System/Role')),
  'pages/System/Permission': lazyProgress(() => import('@/pages/System/Permission')),
  'pages/System/Menu': lazyProgress(() => import('@/pages/System/Menu')),
  'pages/System/Department': lazyProgress(() => import('@/pages/System/Department')),
  'pages/System/Position': lazyProgress(() => import('@/pages/System/Position')),
  'pages/System/Dictionary': lazyProgress(() => import('@/pages/System/Dictionary')),
  'pages/System/Dictionary/Items': lazyProgress(
    () => import('@/pages/System/Dictionary/Items'),
  ),
  'pages/System/Config': lazyProgress(() => import('@/pages/System/Config')),
  'pages/System/Notice': lazyProgress(() => import('@/pages/System/Notice')),
  'pages/System/Log/Login': lazyProgress(() => import('@/pages/System/Log/Login')),
  'pages/System/Log/Operation': lazyProgress(
    () => import('@/pages/System/Log/Operation'),
  ),
  'pages/System/User/AuthRole': lazyProgress(
    () => import('@/pages/System/User/AuthRole'),
  ),
  'pages/System/Role/AuthPermission': lazyProgress(
    () => import('@/pages/System/Role/AuthPermission'),
  ),
  'pages/System/Role/AuthUser': lazyProgress(
    () => import('@/pages/System/Role/AuthUser'),
  ),
  'pages/Monitor/Server': lazyProgress(() => import('@/pages/Monitor/Server')),
  'pages/Monitor/OnlineUser': lazyProgress(() => import('@/pages/Monitor/OnlineUser')),
  'pages/Monitor/CacheMonitor': lazyProgress(
    () => import('@/pages/Monitor/CacheMonitor'),
  ),
};

const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fullScreen?: boolean;
}> = ({ children, fullScreen }) => (
  <Suspense fallback={<PageLoading fullScreen={fullScreen} />}>
    {children}
  </Suspense>
);

// Layout 内容区（.page-transition-root 是 flex 容器）内的页面走 flex:1 撑满，
// 不撑出整屏滚动条；其余路由（BasicLayout / Layout 本身 / Login / Register / 404）
// 的父级不是 flex，需整屏居中（100vh，不依赖父级高度）。
function normalizeRoutes(
  routes: AppRouteObject[],
  parentIsLayout = false,
): RouteObject[] {
  return routes.map((route) => {
    const { component, meta, children, ...rest } = route;

    let element: React.ReactNode | undefined;
    if (component) {
      const Component = componentMap[component];
      if (!Component) {
        console.warn(`[Router] Unknown component: ${component}`);
      }
      element = (
        <LazyWrapper fullScreen={!parentIsLayout}>
          {Component ? <Component /> : null}
        </LazyWrapper>
      );
    }

    return {
      ...rest,
      element,
      meta,
      children: children
        ? normalizeRoutes(children, component === 'layouts/Layout')
        : undefined,
    } as RouteObject;
  });
}

export const router = createBrowserRouter(normalizeRoutes(appRoutes));
