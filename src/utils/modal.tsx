import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import type { ReactNode } from 'react';

export interface ConfirmActionOptions {
  title?: ReactNode;
  content: ReactNode;
  okText?: string;
  cancelText?: string;
  okButtonProps?: { danger?: boolean };
  onOk: () => Promise<void> | void;
}

/**
 * 通用二次确认弹窗封装。
 * 默认标题 "系统提示"、图标 ExclamationCircleOutlined、okText "确认"。
 */
export const confirmAction = (options: ConfirmActionOptions): void => {
  Modal.confirm({
    title: options.title ?? '系统提示',
    icon: <ExclamationCircleOutlined />,
    content: options.content,
    okText: options.okText ?? '确认',
    cancelText: options.cancelText ?? '取消',
    okButtonProps: options.okButtonProps,
    async onOk() {
      await options.onOk();
    },
  });
};
