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
import { Button, Card, Space, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getDictionaryItemColumns, type DictionaryDict } from './columns';
import './index.scss';
import { useDictionaryItems } from './model';

const { Text } = Typography;

const DictionaryItemsPage = () => {
  const { typeId } = useParams();
  const {
    typeDetail,
    fetchDictionaryTypeDetail,
    fetchDictionaryItemList,
    removeDictionaryItem,
  } = useDictionaryItems();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);

  const dict = useDict<DictionaryDict>(['common_status']);
  const { message } = useFeedback();

  useEffect(() => {
    if (typeId) {
      fetchDictionaryTypeDetail(typeId).catch(() => {
        // 全局 errorHandler 已提示
      });
    }
  }, [typeId, fetchDictionaryTypeDetail]);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加字典项'));
  };

  const handleDelete = async (record: API.DictionaryItemResponseDto) => {
    confirmAction({
      title: '删除确认',
      content: (
        <div>
          <p>
            确定要删除字典项 <strong>&quot;{record.label}&quot;</strong> 吗？
          </p>
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await removeDictionaryItem(record.itemId);
          tableReload();
          message.success(`字典项"${record.label}"删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.DictionaryItemResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改字典项', record.itemId));
  };

  const handleOk = () => {
    tableReload();
  };

  const columns = [
    ...getDictionaryItemColumns(dict),
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (record: API.DictionaryItemResponseDto) => {
        return (
          <Space size="small">
            <AuthButton
              type="link"
              size="small"
              icon={<Icon name="EditOutlined" />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.DICTIONARY_UPDATE]}
            >
              编辑
            </AuthButton>
            <AuthButton
              danger
              type="link"
              size="small"
              icon={<Icon name="DeleteOutlined" />}
              onClick={() => handleDelete(record)}
              perms={[PERM.DICTIONARY_DELETE]}
            >
              删除
            </AuthButton>
          </Space>
        );
      },
    },
  ];

  if (!typeId) {
    return (
      <PageContainer>
        <Card>
          <div
            style={{
              textAlign: 'center',
              color: 'var(--gvray-color-text-placeholder)',
              padding: '40px 0',
            }}
          >
            请提供字典类型ID
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="dict-items-header">
        <Button
          type="text"
          icon={<Icon name="ArrowLeftOutlined" />}
          onClick={() => window.history.back()}
          className="dict-items-back"
        />
        <div className="dict-items-title">
          <span>{typeDetail?.name || '字典项管理'}</span>
        </div>
        <Text type="secondary" className="dict-items-desc">
          编码：{typeDetail?.code} · 描述：
          {typeDetail?.description || '暂无描述'}
        </Text>
      </div>

      <Card>
        {typeDetail?.code && (
          <TablePro
            toolbarRender={() => {
              return (
                <AuthButton
                  type="primary"
                  icon={<Icon name="PlusOutlined" />}
                  onClick={handleAdd}
                  perms={[PERM.DICTIONARY_CREATE]}
                >
                  新增字典项
                </AuthButton>
              );
            }}
            rowKey={'itemId'}
            ref={tableProRef}
            columns={columns as any}
            request={(params) =>
              fetchDictionaryItemList(typeDetail?.code, params)
            }
          />
        )}
      </Card>

      {/* 字典项新增修改弹出层 */}
      <UpdateForm
        ref={updateFormRef}
        onOk={handleOk}
        typeCode={typeDetail?.code}
        dict={dict}
      />
    </PageContainer>
  );
};

export default DictionaryItemsPage;
