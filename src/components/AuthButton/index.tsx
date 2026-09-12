import { hasPermissions } from '@gvray/adminkit';
import { useAuth } from '@/hooks';
import { Button, type ButtonProps, Tooltip } from 'antd';
import React from 'react';

export interface AuthButtonProps extends ButtonProps {
  /** 简写：推荐使用 */
  perms: string[];
  anyOf?: boolean; // 任一权限即可
  mode?: 'hidden' | 'disabled'; // 无权限时处理方式
  denyMessage?: React.ReactNode; // 无权限提示
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  perms,
  anyOf = false,
  mode = 'hidden',
  denyMessage = '无操作权限',
  ...buttonProps
}) => {
  const { permissions } = useAuth();

  const hasPermission = React.useMemo(
    () =>
      hasPermissions(permissions, perms, {
        matchMode: anyOf ? 'some' : 'every',
      }),
    [permissions, perms, anyOf],
  );

  if (hasPermission) {
    return <Button {...buttonProps}>{children}</Button>;
  }

  if (mode === 'disabled') {
    const disabledProps: ButtonProps = { ...buttonProps, disabled: true };
    return (
      <Tooltip title={denyMessage}>
        <Button {...disabledProps}>{children}</Button>
      </Tooltip>
    );
  }

  return null;
};

export default AuthButton;
