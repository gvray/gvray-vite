import { Spin } from 'antd';
import React from 'react';
import styles from './index.module.scss';

export interface FormLoadingProps {
  loading?: boolean;
  description?: string;
  children: React.ReactNode;
}

/**
 * 表单加载容器
 * - 半透明遮罩 + 居中旋转图标
 * - 延迟 150ms 显示，避免快速请求闪烁
 */
const FormLoading: React.FC<FormLoadingProps> = ({
  loading,
  description,
  children,
}) => {
  return (
    <Spin
      spinning={loading}
      description={description}
      delay={150}
      classNames={{ root: styles.formLoading }}
    >
      {children}
    </Spin>
  );
};

export default FormLoading;
