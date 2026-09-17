import {
  AuthButton,
  Icon,
  PageContainer,
  TablePro,
} from '@/components';
import { type TableProRef } from '@/components';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import { callRef, confirmAction, logger } from '@/utils';
import { Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import { getNoticeColumns } from './columns';
import NoticeDetailModal from './components/NoticeDetailModal';
import { useNoticeModel } from './model';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';

const NoticePage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const {
    fetchNoticeList,
    fetchNoticeDetail,
    removeNotice,
    batchRemoveNotices,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useNoticeModel();
  const { message } = useFeedback();

  const [detailVisible, setDetailVisible] = useState(false);
  const [currentNotice, setCurrentNotice] =
    useState<API.NoticeResponseDto | null>(null);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (f) => f.show('添加通知公告'));
  };

  const handleDelete = (record: API.NoticeResponseDto) => {
    confirmAction({
      content: `是否确认删除通知公告"${record.title}"？`,
      async onOk() {
        try {
          await removeNotice(record.noticeId);
          tableReload();
          message.success(`删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.NoticeResponseDto) => {
    callRef(updateFormRef, (f) => f.show('修改通知公告', record.noticeId));
  };

  const handleView = async (record: API.NoticeResponseDto) => {
    setDetailVisible(true);
    try {
      const data = await fetchNoticeDetail(record.noticeId);
      setCurrentNotice(data);
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) {
      Modal.warning({
        title: '提示',
        content: '请先选择要删除的记录',
      });
      return;
    }
    confirmAction({
      title: '批量删除确认',
      content: `确认删除选中的 ${selectedRowKeys.length} 条记录？`,
      okText: '删除',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          const ids = selectedRowKeys.map((k) => String(k));
          await batchRemoveNotices(ids);
          setSelectedRowKeys([]);
          message.success('选中的通知公告已删除');
          tableReload();
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const columns = [
    ...getNoticeColumns(),
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (record: API.NoticeResponseDto) => (
        <Space size={0}>
          <AuthButton
            type="link"
            icon={<Icon name="EyeOutlined" />}
            onClick={() => handleView(record)}
            perms={[PERM.NOTICE_VIEW]}
          >
            查看
          </AuthButton>
          <AuthButton
            type="link"
            icon={<Icon name="EditOutlined" />}
            onClick={() => handleUpdate(record)}
            perms={[PERM.NOTICE_UPDATE]}
          >
            修改
          </AuthButton>
          <AuthButton
            danger
            type="link"
            icon={<Icon name="DeleteOutlined" />}
            onClick={() => handleDelete(record)}
            perms={[PERM.NOTICE_DELETE]}
          >
            删除
          </AuthButton>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <TablePro
        rowKey="noticeId"
        ref={tableProRef}
        columns={columns}
        request={fetchNoticeList}
        onSelectionChange={handleSelectionChange}
        toolbarRender={() => (
          <>
            <AuthButton
              type="primary"
              onClick={handleAdd}
              perms={[PERM.NOTICE_CREATE]}
            >
              新增通知公告
            </AuthButton>
            <AuthButton
              danger
              disabled={!selectedRowKeys.length}
              onClick={handleBatchDelete}
              perms={[PERM.NOTICE_DELETE]}
            >
              批量删除
            </AuthButton>
          </>
        )}
      />
      <UpdateForm ref={updateFormRef} onOk={handleOk} />
      <NoticeDetailModal
        notice={currentNotice}
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setCurrentNotice(null);
        }}
      />
    </PageContainer>
  );
};

export default NoticePage;
