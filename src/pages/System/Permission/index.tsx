import {
  AuthButton,
  Icon,
  PageContainer,
  TablePro,
} from '@/components';
import { type TableProRef } from '@/components';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import { callRef, logger } from '@/utils';
import { Space } from 'antd';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getPermissionColumns } from './columns';
import './index.scss';
import {
  getDefaultExpandedKeys,
  type PermissionTreeNode,
  usePermissionModel,
} from './model';

const PermissionPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { message } = useFeedback();
  const intl = useIntl();
  const { scanning, fetchPermissionList, syncPermissions } =
    usePermissionModel();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSync = async () => {
    try {
      await syncPermissions();
      message.success(
        intl.formatMessage({ id: 'permission.message.scanSuccess' }),
      );
      tableReload();
    } catch (error) {
      logger.error(error);
    }
  };

  const handleUpdate = (record: PermissionTreeNode) => {
    if (record.isVirtual) return;
    callRef(
      updateFormRef,
      (t) => t.show('修改权限描述', record as unknown as Record<string, unknown>),
    );
  };

  const handleOk = () => {
    tableReload();
  };

  const columns = getPermissionColumns(intl.formatMessage);

  const actionColumn = {
    title: intl.formatMessage({ id: 'permission.column.action' }),
    key: 'action',
    width: 100,
    render: (record: PermissionTreeNode) => {
      if (record.isVirtual) return null;
      return (
        <Space size={0}>
          <AuthButton
            type="link"
            icon={<Icon name="EditOutlined" />}
            onClick={() => handleUpdate(record)}
            perms={[PERM.PERMISSION_UPDATE]}
          >
            {intl.formatMessage({ id: 'permission.action.edit' })}
          </AuthButton>
        </Space>
      );
    },
  };

  return (
    <PageContainer>
      <TablePro
        tree
        ref={tableProRef}
        rowKey="permissionId"
        columns={[...columns, actionColumn] as any}
        request={async () => {
          const result = await fetchPermissionList();
          setExpandedKeys(getDefaultExpandedKeys(result.data));
          return result;
        }}
        expandable={{
          rowExpandable: (record) =>
            Boolean(record.children && record.children.length > 0),
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
        }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<Icon name="SyncOutlined" spin={scanning} />}
            onClick={handleSync}
            loading={scanning}
            perms={[PERM.PERMISSION_SCAN]}
          >
            {intl.formatMessage({ id: 'permission.action.scan' })}
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} onOk={handleOk} />
    </PageContainer>
  );
};

export default PermissionPage;
