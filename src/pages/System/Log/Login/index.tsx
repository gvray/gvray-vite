import {
  AuthButton,
  CopyId,
  DateTimeFormat,
  Icon,
  PageContainer,
  StatusTag,
  TablePro,
} from '@/components';
import { type TableProRef } from '@/components/TablePro';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import type { DictOption } from '@/types/dict';
import { callRef, confirmAction, logger } from '@/utils';
import { Space } from 'antd';
import React, { useRef } from 'react';
import { getLoginLogColumns } from './columns';
import { useLoginLog } from './model';

const LoginLog: React.FC = () => {
  const tableProRef = useRef<TableProRef>(null);
  const {
    fetchLoginLogList,
    batchRemoveLoginLogs,
    clearLoginLogs,
    selectedRows,
    setSelectedRows,
  } = useLoginLog();
  const [deleting, setDeleting] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const dict = useDict<{
    common_status: DictOption[];
  }>(['common_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRows(keys);
  };

  // 获取表格列配置并添加渲染函数
  const columns = getLoginLogColumns().map((column) => {
    if ('dataIndex' in column && column.dataIndex === 'userId') {
      return {
        ...column,
        render: (userId: string) => <CopyId id={userId} />,
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'status') {
      return {
        ...column,
        advancedSearch: {
          type: 'SELECT' as const,
          value: dict.common_status,
        },
        render: (status: string | number) => (
          <StatusTag value={status} options={dict.common_status} />
        ),
      };
    }
    if ('dataIndex' in column && column.dataIndex === 'createdAt') {
      return {
        ...column,
        render: (time: string) => {
          return <DateTimeFormat value={time} />;
        },
      };
    }
    return column;
  });

  const handleDelete = async () => {
    confirmAction({
      content: '是否确认删除选中的登录日志？此操作不可恢复！',
      async onOk() {
        setDeleting(true);
        try {
          await batchRemoveLoginLogs(selectedRows as number[]);
          setSelectedRows([]);
          message.success('删除成功');
          tableReload();
        } catch (error) {
          logger.error(error);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleClear = async () => {
    confirmAction({
      content: '是否确认清理所有登录日志？此操作不可恢复！',
      async onOk() {
        setClearing(true);
        try {
          await clearLoginLogs();
          message.success('清理成功');
          tableReload();
        } catch (error) {
          logger.error(error);
        } finally {
          setClearing(false);
        }
      },
    });
  };

  return (
    <PageContainer>
      <TablePro
        rowKey="id"
        toolbarRender={() => (
          <Space>
            <AuthButton
              danger
              icon={<Icon name="DeleteOutlined" />}
              onClick={handleDelete}
              loading={deleting}
              disabled={selectedRows.length === 0}
              perms={[PERM.LOG_LOGIN_DELETE]}
            >
              删除
            </AuthButton>
            <AuthButton
              danger
              icon={<Icon name="DeleteOutlined" />}
              onClick={handleClear}
              loading={clearing}
              perms={[PERM.LOG_LOGIN_CLEAR]}
            >
              清空
            </AuthButton>
          </Space>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchLoginLogList}
        onSelectionChange={
          handleSelectionChange as (
            keys: React.Key[],
            rows?: API.LoginLogResponseDto[],
          ) => void
        }
      />
    </PageContainer>
  );
};

export default LoginLog;
