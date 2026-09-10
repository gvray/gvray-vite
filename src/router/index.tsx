import React, { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import PageLoading from '@/components/PageLoading';
import { routes as appRoutes, type AppRouteObject } from './routes';

/**
 * 组件路径映射表。
 * 未迁移的业务页面统一指向 PlaceholderPage，避免白屏。
 */
const componentMap: Record<string, React.ComponentType<Record<string, never>>> = {
  'layouts/BasicLayout': lazy(() => import('@/layouts/BasicLayout')),
  'layouts/Layout': lazy(() => import('@/layouts/Layout')),
  'pages/Login': lazy(() => import('@/pages/Login')),
  'pages/Register': lazy(() => import('@/pages/PlaceholderPage')),
  'pages/Dashboard': lazy(() => import('@/pages/Dashboard')),
  'pages/Docs': lazy(() => import('@/pages/Docs')),
  'pages/Profile': lazy(() => import('@/pages/Profile')),
  'pages/Error/403': lazy(() => import('@/pages/Error/403')),
  'pages/Error/404': lazy(() => import('@/pages/Error/404')),
  'pages/PlaceholderPage': lazy(() => import('@/pages/PlaceholderPage')),
};

const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

function normalizeRoutes(routes: AppRouteObject[]): RouteObject[] {
  return routes.map((route) => {
    const { component, meta, children, ...rest } = route;

    let element: React.ReactNode | undefined;
    if (component) {
      const Component = componentMap[component];
      if (!Component) {
        console.warn(`[Router] Unknown component: ${component}`);
      }
      element = (
        <LazyWrapper>
          {Component ? <Component /> : null}
        </LazyWrapper>
      );
    }

    return {
      ...rest,
      element,
      meta,
      children: children ? normalizeRoutes(children) : undefined,
    } as RouteObject;
  });
}

export const router = createBrowserRouter(normalizeRoutes(appRoutes));
