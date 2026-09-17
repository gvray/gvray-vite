import {
  AuthButton,
  Icon,
  PageContainer,
  TablePro,
  type TableProRef,
} from '@/components';
import { PERM } from '@/constants';
import { useAppNavigate, useAuth, useFeedback } from '@/hooks';
import useDict from '@/hooks/useDict';
import { hasPermissions } from '@gvray/adminkit';
import { callRef, confirmAction, logger } from '@/utils';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Form, Input, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import UpdateForm, { type UpdateFormRef } from './UpdateForm';
import { getUserColumns, type UserDict } from './columns';
import { useUserModel } from './model';

const UserPage = () => {
  const navigate = useAppNavigate();
  const updateFormRef = useRef<UpdateFormRef>(null);
  const tableProRef = useRef<TableProRef>(null);
  const dict = useDict<UserDict>(['user_status', 'user_gender']);
  const { fetchUserList, removeUser, resetPassword } = useUserModel();
  const { permissions } = useAuth();
  const { message } = useFeedback();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetForm] = Form.useForm();

  const tableReload = () => {
    callRef(tableProRef, (t) => t.reload());
  };

  const handleAdd = () => {
    callRef(updateFormRef, (t) => t.show('添加用户'));
  };

  const handleDelete = async (record: API.UserResponseDto) => {
    confirmAction({
      content: `是否确认删除用户编号为"${record.userId}"的数据项？`,
      async onOk() {
        try {
          await removeUser(record.userId);
          tableReload();
          message.success(`删除成功`);
        } catch (error) {
          logger.error(error);
        }
      },
    });
  };

  const handleUpdate = (record: API.UserResponseDto) => {
    callRef(updateFormRef, (t) => t.show('修改用户', record.userId));
  };

  const handleOk = () => {
    tableReload();
  };

  const handleAuthRole = (userId: string) => {
    navigate(`/system/user-auth/role/${userId}`);
  };

  const handleResetPassword = (record: API.UserResponseDto) => {
    setResetUserId(record.userId);
    setResetModalOpen(true);
  };

  const handleResetOk = async () => {
    try {
      const values = await resetForm.validateFields();
      if (resetUserId) {
        await resetPassword(resetUserId, values.newPassword);
        message.success('重置密码成功');
        setResetModalOpen(false);
        resetForm.resetFields();
      }
    } catch (error) {
      logger.error(error);
    }
  };

  const handleResetCancel = () => {
    setResetModalOpen(false);
    resetForm.resetFields();
  };

  // 权限检查辅助函数
  const hasPermission = (requiredPerms: string[]) =>
    hasPermissions(permissions, requiredPerms);

  // 更多操作菜单
  const getMoreMenu = (record: API.UserResponseDto): MenuProps['items'] => {
    const menuItems = [
      {
        key: 'authRole',
        icon: <Icon name="UserOutlined" />,
        label: '分配角色',
        onClick: () => handleAuthRole(record.userId),
        permission: PERM.USER_UPDATE_ROLES,
      },
      {
        key: 'resetPassword',
        icon: <Icon name="KeyOutlined" />,
        label: '重置密码',
        onClick: () => handleResetPassword(record),
        permission: PERM.USER_RESET_PASSWORD,
      },
    ];

    return (
      menuItems
        .filter((item) => hasPermission([item.permission]))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ permission, ...item }) => item)
    );
  };

  const columns = [
    ...getUserColumns(dict),
    {
      title: '操作',
      key: 'action',
      render: (record: API.UserResponseDto) => {
        const moreMenu = getMoreMenu(record);

        return (
          <Space size={0}>
            <AuthButton
              type="link"
              icon={<Icon name="EditOutlined" />}
              onClick={() => handleUpdate(record)}
              perms={[PERM.USER_UPDATE]}
            >
              修改
            </AuthButton>
            <AuthButton
              danger
              type="link"
              icon={<Icon name="DeleteOutlined" />}
              onClick={() => handleDelete(record)}
              perms={[PERM.USER_DELETE]}
            >
              删除
            </AuthButton>
            {moreMenu && moreMenu.length > 0 && (
              <Dropdown
                menu={{ items: moreMenu }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="link" icon={<Icon name="MoreOutlined" />}>
                  更多
                </Button>
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <TablePro
        rowKey={'userId'}
        toolbarRender={() => (
          <>
            <AuthButton
              type="primary"
              onClick={handleAdd}
              perms={[PERM.USER_CREATE]}
            >
              新增用户
            </AuthButton>
          </>
        )}
        ref={tableProRef}
        columns={columns}
        request={fetchUserList}
      />
      {/* 用户新增修改弹出层 */}
      <UpdateForm ref={updateFormRef} dict={dict} onOk={handleOk} />
      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={resetModalOpen}
        onOk={handleResetOk}
        onCancel={handleResetCancel}
        destroyOnHidden
      >
        <Form form={resetForm} layout="vertical" preserve={false}>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
export default UserPage;
