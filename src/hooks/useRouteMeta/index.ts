import { routes } from '@/router/routes';
import type { RouteMeta } from '@/types/route';
import { useLocation } from 'react-router';

// 扩展路由类型定义
interface RouteWithMeta {
  path?: string;
  component?: string;
  children?: RouteWithMeta[];
  meta?: RouteMeta & { auth?: boolean };
  [key: string]: any;
}

/**
 * 获取当前路由的meta信息
 */
export const useRouteMeta = (): RouteMeta & { auth?: boolean } => {
  const location = useLocation();

  // 递归查找匹配的路由
  const findRouteByPath = (
    routeList: RouteWithMeta[],
    pathname: string,
  ): RouteWithMeta | null => {
    for (const route of routeList) {
      // 无 path 的 layout 路由不能直接匹配，但仍需遍历其 children
      if (route.path) {
        // 精确匹配
        if (route.path === pathname) {
          return route;
        }

        // 动态路由匹配（如 /system/user-auth/role/:userId）
        if (route.path.includes(':')) {
          const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
          const regex = new RegExp(`^${routePattern}$`);
          if (regex.test(pathname)) {
            return route;
          }
        }
      }

      // 递归查找子路由
      if (route.children) {
        const found = findRouteByPath(route.children, pathname);
        if (found) return found;
      }
    }
    return null;
  };

  const matchedRoute = findRouteByPath(
    routes as RouteWithMeta[],
    location.pathname,
  );

  return matchedRoute?.meta || {};
};

export default useRouteMeta;
