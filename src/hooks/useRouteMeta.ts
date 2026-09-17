import { matchRoutePath } from '@gvray/adminkit';
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
      // 优先递归子路由：让更具体的叶子路由先于父级布局路由命中。
      // 例如根路径 "/"，根布局路由与 Dashboard 路由的 path 同为 "/"，
      // 需返回叶子 Dashboard 的 meta（auth 缺省=需登录）而非根布局的
      // { auth: false }，否则 BasicLayout 守卫不触发，页面先渲染再跳转。
      if (route.children) {
        const found = findRouteByPath(route.children, pathname);
        if (found) return found;
      }

      // 无 path 的 layout 路由不能直接匹配
      if (route.path) {
        // 精确匹配
        if (route.path === pathname) {
          return route;
        }

        // 动态路由匹配（如 /system/user-auth/role/:userId）
        if (matchRoutePath(route.path, pathname)) {
          return route;
        }
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
