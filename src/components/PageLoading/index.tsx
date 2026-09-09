import { Spin, theme } from 'antd';
import React from 'react';

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

const PageLoading: React.FC<PageLoadingProps> = ({
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
        ...(fullScreen ? { minHeight: '100vh' } : { flex: 1 }),
        ...style,
      }}
    >
      <Spin size={size} />
      {tip ? (
        <span
          style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}
        >
          {tip}
        </span>
      ) : null}
    </div>
  );
};

export default PageLoading;
