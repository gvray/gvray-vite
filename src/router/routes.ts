import type { RouteObject } from 'react-router';
import type { RouteMeta } from '@/types/route';

export interface AppRouteObject extends Omit<RouteObject, 'children' | 'element'> {
  /** 组件路径标识，由 {@link normalizeRoutes} 解析为真实组件 */
  component?: string;
  meta?: RouteMeta & { auth?: boolean };
  children?: AppRouteObject[];
}

/**
 * 应用路由配置（React Router 格式）。
 * 保留原 Umi 路由中的 `meta` 字段，供 useRouteMeta、BaseLayout、权限守卫使用。
 *
 * 未迁移的业务页面统一指向 `pages/PlaceholderPage`，避免菜单点击后白屏。
 */
export const routes: AppRouteObject[] = [
  {
    path: '/login',
    component: 'pages/Login',
    meta: { auth: false },
  },
  {
    path: '/register',
    component: 'pages/Register',
    meta: { auth: false },
  },
  {
    path: '/',
    component: 'layouts/index',
    meta: { auth: true },
    children: [
      {
        path: '/',
        component: 'pages/Docs',
        meta: {
          title: '文档',
          permissions: [],
        },
      },
      {
        path: '/profile',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '个人资料',
          permissions: [],
        },
      },
      {
        path: '/docs',
        component: 'pages/Docs',
        meta: {
          title: '文档',
          permissions: [],
        },
      },
      {
        path: '/403',
        component: 'pages/Error/403',
      },
    ],
  },
  {
    path: '/system',
    component: 'layouts/index',
    meta: { auth: true },
    children: [
      {
        path: '/system/user',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '用户管理',
          permissions: ['system:user:list'],
        },
      },
      {
        path: '/system/role',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '角色管理',
          permissions: ['system:role:list'],
        },
      },
      {
        path: '/system/permission',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '权限管理',
          permissions: ['system:permission:list'],
        },
      },
      {
        path: '/system/menu',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '菜单管理',
          permissions: ['system:menu:list'],
        },
      },
      {
        path: '/system/department',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '部门管理',
          permissions: ['system:department:list'],
        },
      },
      {
        path: '/system/position',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '职位管理',
          permissions: ['system:position:list'],
        },
      },
      {
        path: '/system/dictionary',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '字典管理',
          permissions: ['system:dictionary:list'],
        },
      },
      {
        path: '/system/dictionary/items/:typeId',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '字典项管理',
          permissions: ['system:dictionary:list'],
        },
      },
      {
        path: '/system/config',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '系统配置',
          permissions: ['system:config:list'],
        },
      },
      {
        path: '/system/notice',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '通知公告',
          permissions: ['system:notice:list'],
        },
      },
      {
        path: '/system/log',
        meta: {
          title: '日志管理',
        },
        children: [
          {
            path: '/system/log/login',
            component: 'pages/PlaceholderPage',
            meta: {
              title: '登录日志',
              permissions: ['system:log-login:list'],
            },
          },
          {
            path: '/system/log/operation',
            component: 'pages/PlaceholderPage',
            meta: {
              title: '操作日志',
              permissions: ['system:log-operation:list'],
            },
          },
        ],
      },
      {
        path: '/system/user-auth/role/:userId',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '用户分配角色',
          permissions: ['system:user:update-roles'],
        },
      },
      {
        path: '/system/role-auth/permission/:roleId',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '角色分配权限',
          permissions: ['system:role:update-permissions'],
        },
      },
      {
        path: '/system/role-auth/user/:roleId',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '角色分配用户',
          permissions: ['system:role:update-users'],
        },
      },
    ],
  },
  {
    path: '/monitor',
    component: 'layouts/index',
    meta: { auth: true },
    children: [
      {
        path: '/monitor/server',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '服务监控',
          permissions: ['monitor:server:list'],
        },
      },
      {
        path: '/monitor/online-user',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '在线用户',
          permissions: ['monitor:online-user:list'],
        },
      },
      {
        path: '/monitor/cache',
        component: 'pages/PlaceholderPage',
        meta: {
          title: '缓存监控',
          permissions: ['monitor:cache:list'],
        },
      },
    ],
  },
  {
    path: '*',
    component: 'pages/Error/404',
    meta: { auth: false },
  },
];

export default routes;
