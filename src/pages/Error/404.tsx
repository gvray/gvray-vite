import { useAppNavigate } from '@/hooks';
import { Button, Result } from 'antd';

const NoFoundPage = () => {
  const navigate = useAppNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      }
    />
  );
};

export default NoFoundPage;
