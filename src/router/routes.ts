import type { RouteObject } from 'react-router';
import type { RouteMeta } from '@/types/route';
import { PERM } from '@/constants/permission';

export interface AppRouteObject extends Omit<RouteObject, 'children' | 'element'> {
  /** 组件路径标识，由 {@link normalizeRoutes} 解析为真实组件 */
  component?: string;
  meta?: RouteMeta & { auth?: boolean };
  children?: AppRouteObject[];
}

/**
 * 应用路由配置（React Router 格式）。
 *
 * 分层：
 * - BasicLayout(path: /)：所有页面入口的公共根，仅 <Outlet/>，无视觉布局。
 * - 其下 Layout：后台视觉壳（Sider/Header/Content）+ 认证/权限守卫，包裹所有业务页面。
 * - 登录/注册直接挂在 BasicLayout 下，各自渲染自己的壳（LoginBg + 亮色 ConfigProvider）。
 *
 * 全局 Provider（主题/国际化）在 src/app/App.tsx 的 AppProviders 中，覆盖所有路由。
 */
export const routes: AppRouteObject[] = [
  {
    path: '/',
    component: 'layouts/BasicLayout',
    meta: { auth: false },
    children: [
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
        component: 'layouts/Layout',
        meta: { auth: true },
        children: [
          {
            path: '/',
            component: 'pages/Dashboard',
            meta: {
              title: '仪表板',
              permissions: [],
            },
          },
          {
            path: '/profile',
            component: 'pages/Profile',
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
          {
            path: '/system/user',
            component: 'pages/System/User',
            meta: {
              title: '用户管理',
              permissions: [PERM.USER_LIST],
            },
          },
          {
            path: '/system/role',
            component: 'pages/System/Role',
            meta: {
              title: '角色管理',
              permissions: [PERM.ROLE_LIST],
            },
          },
          {
            path: '/system/permission',
            component: 'pages/System/Permission',
            meta: {
              title: '权限管理',
              permissions: [PERM.PERMISSION_LIST],
            },
          },
          {
            path: '/system/menu',
            component: 'pages/System/Menu',
            meta: {
              title: '菜单管理',
              permissions: [PERM.MENU_LIST],
            },
          },
          {
            path: '/system/department',
            component: 'pages/System/Department',
            meta: {
              title: '部门管理',
              permissions: [PERM.DEPARTMENT_LIST],
            },
          },
          {
            path: '/system/position',
            component: 'pages/System/Position',
            meta: {
              title: '职位管理',
              permissions: [PERM.POSITION_LIST],
            },
          },
          {
            path: '/system/dictionary',
            component: 'pages/System/Dictionary',
            meta: {
              title: '字典管理',
              permissions: [PERM.DICTIONARY_LIST],
            },
          },
          {
            path: '/system/dictionary/items/:typeId',
            component: 'pages/System/Dictionary/Items',
            meta: {
              title: '字典项管理',
              permissions: [PERM.DICTIONARY_LIST],
            },
          },
          {
            path: '/system/config',
            component: 'pages/System/Config',
            meta: {
              title: '系统配置',
              permissions: [PERM.CONFIG_LIST],
            },
          },
          {
            path: '/system/notice',
            component: 'pages/System/Notice',
            meta: {
              title: '通知公告',
              permissions: [PERM.NOTICE_LIST],
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
                component: 'pages/System/Log/Login',
                meta: {
                  title: '登录日志',
                  permissions: [PERM.LOG_LOGIN_LIST],
                },
              },
              {
                path: '/system/log/operation',
                component: 'pages/System/Log/Operation',
                meta: {
                  title: '操作日志',
                  permissions: [PERM.LOG_OPERATION_LIST],
                },
              },
            ],
          },
          {
            path: '/system/user-auth/role/:userId',
            component: 'pages/System/User/AuthRole',
            meta: {
              title: '用户分配角色',
              permissions: [PERM.USER_UPDATE_ROLES],
            },
          },
          {
            path: '/system/role-auth/permission/:roleId',
            component: 'pages/System/Role/AuthPermission',
            meta: {
              title: '角色分配权限',
              permissions: [PERM.ROLE_UPDATE_PERMISSIONS],
            },
          },
          {
            path: '/system/role-auth/user/:roleId',
            component: 'pages/System/Role/AuthUser',
            meta: {
              title: '角色分配用户',
              permissions: [PERM.ROLE_UPDATE_USERS],
            },
          },
          {
            path: '/monitor/server',
            component: 'pages/Monitor/Server',
            meta: {
              title: '服务监控',
              permissions: [PERM.MONITOR_SERVER_LIST],
            },
          },
          {
            path: '/monitor/online-user',
            component: 'pages/Monitor/OnlineUser',
            meta: {
              title: '在线用户',
              permissions: [PERM.MONITOR_ONLINE_USER_LIST],
            },
          },
          {
            path: '/monitor/cache',
            component: 'pages/Monitor/CacheMonitor',
            meta: {
              title: '缓存监控',
              permissions: [PERM.MONITOR_CACHE_LIST],
            },
          },
        ],
      },
      {
        path: '*',
        component: 'pages/Error/404',
        meta: { auth: false },
      },
    ],
  },
];

export default routes;
