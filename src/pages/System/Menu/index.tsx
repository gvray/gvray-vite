import {
  AuthButton,
  Icon,
  PageContainer,
  TablePro,
} from '@/components';
import { type TableProRef } from '@/components';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import { callRef, confirmAction, logger } from '@/utils';
import { Space } from 'antd';
import { useCallback, useRef, useState } from 'react';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getMenuColumns, type MenuDict } from './columns';
import { useMenuModel } from './model';

const MenuPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<MenuDict>(['common_status']);
  const { message } = useFeedback();
  const { fetchMenuTree, removeMenu } = useMenuModel();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleRequest = useCallback(
    async (params?: any) => {
      const result = await fetchMenuTree(params);
      const data = result.data as any;
      const items = data?.items ?? data;
      if (Array.isArray(items)) {
        const firstLevelKeys = items
          .filter(
            (item: API.MenuTreeNodeDto) =>
              item.children && item.children.length > 0,
          )
          .map((item: API.MenuTreeNodeDto) => item.menuId);
        setExpandedRowKeys(firstLevelKeys);
      }
      return result;
    },
    [fetchMenuTree],
  );

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加菜单'));
  };

  const handleDelete = (record: API.MenuTreeNodeDto) => {
    confirmAction({
      content: `是否确认删除菜单"${record.name}"？`,
      async onOk() {
        try {
          await removeMenu(record.menuId);
          tableReload();
          message.success('删除成功');
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.MenuTreeNodeDto) => {
    callRef(updateFormRef, (t) => t.show('修改菜单', record.menuId));
  };

  const handleOk = () => {
    tableReload();
  };

  const columns = [
    ...getMenuColumns(dict),
    {
      title: '操作',
      key: 'action',
      render: (record: API.MenuTreeNodeDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<Icon name="EditOutlined" />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.MENU_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<Icon name="DeleteOutlined" />}
              onClick={() => handleDelete(record)}
              perms={[PERM.MENU_DELETE]}
            >
              删除
            </AuthButton>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <TablePro
        tree
        ref={tableProRef}
        rowKey="menuId"
        columns={columns as any}
        request={handleRequest}
        expandable={{
          rowExpandable: (record) =>
            Boolean(record.children && record.children.length > 0),
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
        }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<Icon name="PlusOutlined" />}
            onClick={handleAdd}
            perms={[PERM.MENU_CREATE]}
          >
            新增菜单
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} onOk={handleOk} dict={dict} />
    </PageContainer>
  );
};

export default MenuPage;
