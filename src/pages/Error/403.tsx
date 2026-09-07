import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router';

const NoAuthPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面。"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      }
    />
  );
};

export default NoAuthPage;
