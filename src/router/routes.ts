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
 *
 * 分层：
 * - BasicLayout(path: /)：所有页面入口的公共根，仅 <Outlet/>，无视觉布局。
 * - 其下 Layout：后台视觉壳（Sider/Header/Content）+ 认证/权限守卫，包裹所有业务页面。
 * - 登录/注册直接挂在 BasicLayout 下，各自渲染自己的壳（LoginBg + 亮色 ConfigProvider）。
 *
 * 全局 Provider（主题/国际化）在 src/app/App.tsx 的 AppProviders 中，覆盖所有路由。
 * 未迁移的业务页面统一指向 PlaceholderPage，避免白屏。
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
    ],
  },
];

export default routes;
