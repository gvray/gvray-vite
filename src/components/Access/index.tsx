import { useAccess, type UseAccessOptions } from '@/hooks';
import React from 'react';

export interface AccessProps extends UseAccessOptions {
  /** 需要的权限码 */
  perms: string[];
  /** 无权限时渲染的兜底内容，默认不渲染 */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 通用权限包裹：有权限渲染 children，无权限渲染 fallback（默认 null）。
 *
 * 按钮场景用 `AuthButton`（支持 disabled + Tooltip 提示），
 * 其他任意需要权限可见性的元素用本组件。
 */
const Access: React.FC<AccessProps> = ({
  perms,
  anyOf,
  fallback = null,
  children,
}) => {
  const ok = useAccess(perms, { anyOf });
  return <>{ok ? children : fallback}</>;
};

export default Access;
