import { hasPermissions } from '@gvray/adminkit';
import useAuth from '@/hooks/useAuth';
import { useMemo } from 'react';

export interface UseAccessOptions {
  /** 任一权限即可（默认需全部满足） */
  anyOf?: boolean;
}

/**
 * 声明式权限判断：给定权限码返回是否拥有。
 *
 * 固定权限场景用本 hook；需要在运行时按不同权限码判断的变参场景
 * 直接用 `@gvray/adminkit` 的 `hasPermissions`。
 */
const useAccess = (
  perms: string[],
  { anyOf = false }: UseAccessOptions = {},
): boolean => {
  const { permissions } = useAuth();

  return useMemo(
    () =>
      hasPermissions(permissions, perms, {
        matchMode: anyOf ? 'some' : 'every',
      }),
    [permissions, perms, anyOf],
  );
};

export default useAccess;
