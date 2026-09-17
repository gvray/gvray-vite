import {
  AuthButton,
  Icon,
  PageContainer,
  TablePro,
} from '@/components';
import { type TableProRef } from '@/components';
import { PERM } from '@/constants';
import { useAppNavigate, useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import { callRef, confirmAction, logger } from '@/utils';
import { Space } from 'antd';
import { useRef } from 'react';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getDictionaryColumns, type DictionaryDict } from './columns';
import './index.scss';
import { useDictionary } from './model';

const DictionaryPage = () => {
  const navigate = useAppNavigate();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { fetchDictionaryTypeList, removeDictionaryType } = useDictionary();

  const dict = useDict<DictionaryDict>(['common_status']);
  const { message } = useFeedback();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = async () => {
    callRef(updateFormRef, (t) => t.show('添加字典类型'));
  };

  const handleDelete = async (record: API.DictionaryTypeResponseDto) => {
    confirmAction({
      title: '删除确认',
      content: (
        <div>
          <p>
            确定要删除字典类型 <strong>&quot;{record.name}&quot;</strong> 吗？
          </p>
          <p
            style={{
              color: 'var(--gvray-color-error)',
              fontSize: '12px',
              marginTop: '8px',
            }}
          >
            删除后将无法恢复，且会同时删除该类型下的所有字典项！
          </p>
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await removeDictionaryType(record.typeId);
          tableReload();
          message.success(`字典类型"${record.name}"删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.DictionaryTypeResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改字典类型', record.typeId));
  };

  const handleManageItems = (record: API.DictionaryTypeResponseDto) => {
    navigate(`/system/dictionary/items/${record.typeId}`);
  };

  const handleOk = () => {
    tableReload();
  };

  const columns = [
    ...getDictionaryColumns(dict),
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (record: API.DictionaryTypeResponseDto) => {
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
              type="link"
              size="small"
              icon={<Icon name="SettingOutlined" />}
              onClick={() => handleManageItems(record)}
              perms={[PERM.DICTIONARY_UPDATE]}
            >
              管理字典项
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

  return (
    <PageContainer>
      <TablePro
        rowKey={'typeId'}
        ref={tableProRef}
        columns={columns as any}
        request={fetchDictionaryTypeList}
        scroll={{ x: 1200 }}
        toolbarRender={() => {
          return (
            <AuthButton
              type="primary"
              icon={<Icon name="PlusOutlined" />}
              onClick={handleAdd}
              perms={[PERM.DICTIONARY_CREATE]}
            >
              新增字典类型
            </AuthButton>
          );
        }}
      />
      {/* 字典类型新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};

export default DictionaryPage;
