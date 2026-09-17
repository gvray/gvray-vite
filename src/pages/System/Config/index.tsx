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
import { useRef, useState } from 'react';
import { getConfigColumns, type ConfigDict } from './columns';
import ConfigValueViewer from './components/ConfigValueViewer';
import './index.scss';
import { useConfigModel } from './model';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';

const ConfigPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const { fetchConfigList, fetchConfigDetail, removeConfig } = useConfigModel();
  const dict = useDict<ConfigDict>(
    ['config_group', 'common_status', 'config_type'],
  );
  const { message } = useFeedback();

  const [viewVisible, setViewVisible] = useState(false);
  const [currentConfig, setCurrentConfig] =
    useState<API.ConfigResponseDto | null>(null);

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (f) => f.show('添加配置'));
  };

  const handleDelete = (record: API.ConfigResponseDto) => {
    confirmAction({
      content: `是否确认删除配置"${record.name}"的数据项？`,
      async onOk() {
        try {
          await removeConfig(record.configId);
          tableReload();
          message.success(`删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.ConfigResponseDto) => {
    callRef(updateFormRef, (f) => f.show('修改配置', record.configId));
  };

  const handleView = async (record: API.ConfigResponseDto) => {
    setViewVisible(true);
    try {
      const data = await fetchConfigDetail(record.configId);
      setCurrentConfig(data);
    } catch (error) {
      logger.error(error);
    }
  };

  const handleOk = () => {
    tableReload();
  };

  // 构建列定义
  const columns = [
    ...getConfigColumns(dict),
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (record: API.ConfigResponseDto) => (
        <Space size={0}>
          <AuthButton
            type="link"
            icon={<Icon name="EyeOutlined" />}
            onClick={() => handleView(record)}
            perms={[PERM.CONFIG_VIEW]}
          >
            查看
          </AuthButton>
          <AuthButton
            type="link"
            icon={<Icon name="EditOutlined" />}
            onClick={() => handleUpdate(record)}
            perms={[PERM.CONFIG_UPDATE]}
          >
            修改
          </AuthButton>
          <AuthButton
            danger
            type="link"
            icon={<Icon name="DeleteOutlined" />}
            onClick={() => handleDelete(record)}
            perms={[PERM.CONFIG_DELETE]}
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
        rowKey="configId"
        ref={tableProRef}
        columns={columns}
        request={fetchConfigList}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            onClick={handleAdd}
            perms={[PERM.CONFIG_CREATE]}
          >
            新增配置
          </AuthButton>
        )}
      />
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
      {currentConfig && (
        <ConfigValueViewer
          config={currentConfig}
          visible={viewVisible}
          dict={dict}
          onClose={() => {
            setViewVisible(false);
            setCurrentConfig(null);
          }}
        />
      )}
    </PageContainer>
  );
};

export default ConfigPage;
