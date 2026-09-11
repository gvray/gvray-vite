import { ConfigProvider, Spin, theme } from 'antd';
import React, { useMemo } from 'react';
import { useSettingStore } from '@/stores';

export type PageLoadingProps = {
  /**
   * 占满视口并在屏幕内垂直居中（默认 true），适用于首屏 / 应用启动加载。
   * 路由级 Suspense 兜底等嵌入布局内容区的场景应传 false，
   * 组件将改为撑满父级 flex 容器的剩余空间。
   */
  fullScreen?: boolean;
  tip?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
  style?: React.CSSProperties;
};

// 内层：在自带的 ConfigProvider 上下文内读取主题 token，
// 保证 boot 阶段（外层 ConfigProvider 尚未挂载）也能拿到正确的主题色 / 昼夜色。
const PageLoadingInner: React.FC<PageLoadingProps> = ({
  fullScreen = true,
  tip = '加载中…',
  size = 'large',
  className,
  style,
}) => {
  const { token } = theme.useToken();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        color: token.colorTextSecondary,
        ...(fullScreen
          ? { minHeight: '100vh', background: token.colorBgContainer }
          : { flex: 1 }),
        ...style,
      }}
    >
      <Spin size={size} />
      {tip ? (
        <span style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}>
          {tip}
        </span>
      ) : null}
    </div>
  );
};

const PageLoading: React.FC<PageLoadingProps> = (props) => {
  const colorPrimary = useSettingStore((s) => s.colorPrimary);
  const themeMode = useSettingStore((s) => s.theme);

  // 与 useAppTheme 的解析逻辑一致：system 回退到系统偏好。
  const dark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [themeMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary, colorInfo: colorPrimary },
      }}
    >
      <PageLoadingInner {...props} />
    </ConfigProvider>
  );
};

export default PageLoading;
