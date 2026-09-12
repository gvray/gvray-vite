import PageLoading from '@/components/PageLoading';
import React from 'react';

/**
 * 应用启动加载占位。
 *
 * 与 PageLoading 的区别：
 * - PageLoading 用于页面 / 路由级加载，业务可自由控制 tip、尺寸与是否全屏；
 * - AppLoading 专用于应用根节点 bootstrap 阶段，固定全屏、大 Spin，无业务提示。
 */
const AppLoading: React.FC = () => {
  return <PageLoading fullScreen size="large" />;
};

export default AppLoading;
