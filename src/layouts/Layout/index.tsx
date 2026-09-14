import { AppWatermark, ErrorBoundary } from '@/components';
import '@/components/Icon/init';
import { useSettingStore } from '@/stores';
import { runtimeConfig } from '@/utils/runtime-config';
import { Layout as AntdLayout } from 'antd';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import AppViewport from './components/AppViewport';
import SideNav from './components/SideNav';

const AppLayout = styled(AntdLayout)`
  height: 100%;
`;

/**
 * 后台视觉壳：纯 UI（SideNav + Header + Content + Footer + Watermark）。
 *
 * 路由级守卫、文档标题、路由元信息注入、页面切换进度等非视觉职责
 * 已上提到 src/layouts/BasicLayout。全局 Provider 在 src/app/App.tsx。
 */
export default function Layout() {
  const { system } = runtimeConfig.get();
  const {
    sidebarCollapsed,
    sidebarTheme,
    showLogo,
    fixedHeader,
    showFooter,
  } = useSettingStore();

  return (
    <AppLayout>
      <SideNav
        collapsed={sidebarCollapsed}
        sidebarTheme={sidebarTheme}
        showLogo={showLogo}
      />
      <AppViewport>
        <AppHeader headerFixed={fixedHeader} />
        <ErrorBoundary>
          <div className="page-transition-root">
            <Outlet />
          </div>
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
  );
}
