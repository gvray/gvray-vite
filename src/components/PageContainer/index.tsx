import { useSettingStore } from '@/stores';
import { type PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import AppBreadcrumb from '../AppBreadcrumb';

type PageContainerWrapperProps = {
  $hasBreadcrumb?: boolean;
};

const PageContainerWrapper = styled.div`
  flex: 1;
  background: transparent;
  margin: 0;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  margin-bottom: 12px;
`;

const PageTitle = styled.div<PageContainerWrapperProps>`
  font-size: 20px;
  font-weight: 500;
  margin-top: ${({ $hasBreadcrumb }) => ($hasBreadcrumb ? '8px' : '0')};
`;

const PageContent = styled.div`
  flex: 1;
  padding: 24px;
  background: var(--gvray-color-bg-container);
  border-radius: var(--gvray-border-radius-lg);
`;

interface PageContainerProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}

const PageContainer: React.FC<PropsWithChildren<PageContainerProps>> = ({
  children,
  title,
  ...rest
}) => {
  const { showBreadcrumb } = useSettingStore();

  const hasHeader = Boolean(title || showBreadcrumb);

  return (
    <PageContainerWrapper {...rest}>
      {title && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}

      {hasHeader && (
        <PageHeader>
          {showBreadcrumb && <AppBreadcrumb />}

          {title && (
            <PageTitle $hasBreadcrumb={showBreadcrumb}>{title}</PageTitle>
          )}
        </PageHeader>
      )}

      <PageContent>{children}</PageContent>
    </PageContainerWrapper>
  );
};

export default PageContainer;
