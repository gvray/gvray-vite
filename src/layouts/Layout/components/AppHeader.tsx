import UserMenu from '@/components/UserMenu';
import { Layout, Space } from 'antd';
import styled from 'styled-components';

import NoticeBell from './NoticeBell';
import SelectLang from './SelectLang';
import ThemeModeSwitch from './ThemeModeSwitch';
import ThemeSetting from './ThemeSetting';

const { Header } = Layout;

const HeaderWrapper = styled(Header)<{
  $fixed: boolean;
}>`
  padding: 0;
  background: var(--gvray-color-bg-container);
  /* 用分割线色做底部边框：亮色极淡灰线，暗色微亮线，始终柔和不突兀 */
  border-bottom: 1px solid var(--gvray-color-split);
  position: ${({ $fixed }) => ($fixed ? 'sticky' : 'relative')};
  top: 0;
  z-index: 100;
`;

const HeaderActions = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline: 24px;
`;

interface AppHeaderProps {
  headerFixed: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ headerFixed }) => {
  return (
    <HeaderWrapper $fixed={headerFixed}>
      <HeaderActions>
        <Space size={4}>
          <ThemeModeSwitch />
          <ThemeSetting />
          <SelectLang />
          <NoticeBell />
          <UserMenu />
        </Space>
      </HeaderActions>
    </HeaderWrapper>
  );
};

export default AppHeader;
