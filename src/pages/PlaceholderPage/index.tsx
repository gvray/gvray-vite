import { PageContainer } from '@/components';
import React from 'react';

const PlaceholderPage: React.FC = () => {
  return (
    <PageContainer title="功能开发中">
      <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--gvray-color-text-secondary)' }}>
        该页面尚未迁移，敬请期待。
      </div>
    </PageContainer>
  );
};

export default PlaceholderPage;
