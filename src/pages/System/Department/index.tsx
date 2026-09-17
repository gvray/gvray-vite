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
import { useRef } from 'react';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getDepartmentColumns, type DepartmentDict } from './columns';
import { useDepartmentModel } from './model';
const DepartmentPage = () => {
  const updateFormRef = useRef<UpdateFormRef>(null);
  const { removeDepartment, fetchDepartmentTree } = useDepartmentModel();
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<DepartmentDict>(['common_status']);
  const { message } = useFeedback();

  const handleAdd = async () => {
    callRef(updateFormRef, (t) => t.show('添加部门'));
  };

  const handleDelete = async (record: API.DepartmentResponseDto) => {
    confirmAction({
      content: `是否确认删除部门“${record.name}”？`,
      async onOk() {
        try {
          await removeDepartment(record.departmentId);
          callRef(tableProRef, (t) => t.reload());
          message.success('删除成功');
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.DepartmentResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改部门', record.departmentId));
  };
  const handleOk = () => {
    callRef(tableProRef, (t) => t.reload());
  };
  const columns = [
    ...getDepartmentColumns(dict),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (record: API.DepartmentResponseDto) => {
        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<Icon name="EditOutlined" />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.DEPARTMENT_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<Icon name="DeleteOutlined" />}
              onClick={() => handleDelete(record)}
              perms={[PERM.DEPARTMENT_DELETE]}
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
        tree={true}
        ref={tableProRef}
        rowKey={'departmentId'}
        columns={columns as any}
        request={fetchDepartmentTree}
        expandable={{ defaultExpandAllRows: true }}
        toolbarRender={() => (
          <AuthButton
            type="primary"
            icon={<Icon name="PlusOutlined" />}
            onClick={handleAdd}
            perms={[PERM.DEPARTMENT_CREATE]}
          >
            新增部门
          </AuthButton>
        )}
      />
      {/* 部门新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
    </PageContainer>
  );
};

export default DepartmentPage;
