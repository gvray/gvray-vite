import { AuthButton, Icon } from '@/components';
import { PERM } from '@/constants';
import { useFeedback } from '@/hooks';
import { queryDepartmentOptions } from '@/services/department';
import {
  assignRoleDataScopes,
  getRoleById,
  getRoleDataScopesById,
} from '@/services/role';
import { logger } from '@/utils';
import {
  Button,
  Col,
  Modal,
  Radio,
  Row,
  Space,
  Spin,
  Tag,
  Tree,
  Typography,
  theme,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

const { Text } = Typography;

// Styled Components with theme support
const PermissionTypeOption = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colorBorder};
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${({ theme }) => theme.colorBgContainer};

  &:hover {
    border-color: ${({ theme }) => theme.colorPrimary};
    background-color: ${({ theme }) => theme.colorBgTextHover};
  }

  ${({ selected, theme }) =>
    selected &&
    `
    border-color: ${theme.colorPrimary};
    background-color: ${theme.colorPrimaryBg};
  `}

  .option-icon {
    margin-right: 12px;
    font-size: 16px;
    color: ${({ theme }) => theme.colorPrimary};
  }

  .option-content {
    flex: 1;

    .option-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      color: ${({ theme }) => theme.colorText};
    }

    .option-description {
      font-size: 12px;
      color: ${({ theme }) => theme.colorTextSecondary};
      line-height: 1.4;
    }
  }

  .option-radio {
    margin-left: 12px;
  }
`;

const DepartmentTreeContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

export const DataScope = {
  SELF: 1, // 仅本人数据权限
  DEPARTMENT: 2, // 本部门数据权限
  DEPARTMENT_AND_CHILD: 3, // 本部门及以下数据权限
  CUSTOM: 4, // 自定义数据权限
  ALL: 5, // 全部数据权限
} as const;

export type DataScope = (typeof DataScope)[keyof typeof DataScope];

// 数据权限类型配置
const PERMISSION_TYPES = [
  {
    value: DataScope.ALL,
    label: '全部数据权限',
    description: '可以访问所有数据，不受任何限制',
    icon: <Icon name="DatabaseOutlined" />,
    color: 'var(--gvray-color-success)',
  },
  {
    value: DataScope.DEPARTMENT,
    label: '本部门数据权限',
    description: '只能访问当前用户所在部门的数据',
    icon: <Icon name="TeamOutlined" />,
    color: 'var(--gvray-color-warning)',
  },
  {
    value: DataScope.DEPARTMENT_AND_CHILD,
    label: '本部门及以下数据权限',
    description: '可以访问当前用户所在部门及其下级部门的数据',
    icon: <Icon name="TeamOutlined" />,
    color: 'var(--gvray-color-info)',
  },
  {
    value: DataScope.CUSTOM,
    label: '自定义数据权限',
    description: '可以自定义访问特定部门的数据',
    icon: <Icon name="EyeOutlined" />,
    color: 'var(--gvray-color-primary)',
  },
  {
    value: DataScope.SELF,
    label: '仅本人数据权限',
    description: '只能访问自己创建或负责的数据',
    icon: <Icon name="EyeOutlined" />,
    color: 'var(--gvray-color-error)',
  },
];

interface RoleState {
  roleId: string;
  name: string;
  roleKey: string;
}

interface AuthDataScopeModalProps {
  visible: boolean;
  roleId: string;
  roleName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AuthDataScopeModal({
  visible,
  roleId,
  roleName,
  onCancel,
  onSuccess,
}: AuthDataScopeModalProps) {
  const { message } = useFeedback();
  const { token } = theme.useToken();
  const [currentRole, setCurrentRole] = useState<RoleState | null>(null);
  const [departments, setDepartments] = useState<API.DepartmentResponseDto[]>(
    [],
  );
  const [dataScope, setDataScope] = useState<DataScope>(DataScope.SELF);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initializeData = async () => {
    setLoading(true);
    try {
      const [roleRes, dataScopesRes, departmentsRes] = await Promise.all([
        getRoleById(roleId),
        getRoleDataScopesById(roleId),
        queryDepartmentOptions(),
      ]);
      setCurrentRole({
        ...roleRes.data,
      });

      // 设置当前数据权限配置
      if (dataScopesRes.data) {
        setDataScope(dataScopesRes.data.dataScope as DataScope);
        if (dataScopesRes.data.dataScope === DataScope.CUSTOM) {
          const deptIds =
            dataScopesRes.data.departments?.map((d) => d.departmentId) || [];
          setSelectedDeptIds(deptIds);
        }
      }

      setDepartments(departmentsRes.data || []);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (visible && roleId) {
      initializeData();
    }
  }, [visible, roleId]);

  // 处理权限类型选择
  const handlePermissionTypeChange = (newDataScope: DataScope) => {
    setDataScope(newDataScope);
    // 如果不是自定义权限，清除部门选择
    if (newDataScope !== DataScope.CUSTOM) {
      setSelectedDeptIds([]);
    }
  };

  // 处理部门选择
  const handleDepartmentChange = (deptIds: string[]) => {
    setSelectedDeptIds(deptIds);
  };

  // 提交数据权限分配
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 数据权限是角色的全局设置，包装成数组格式
      const dataScopesData: {
        dataScope: number;
        departmentIds?: string[];
      } = {
        dataScope: dataScope,
        departmentIds: selectedDeptIds,
      };
      if (dataScope !== DataScope.CUSTOM) {
        delete dataScopesData.departmentIds;
      }

      await assignRoleDataScopes(roleId, dataScopesData);
      message.success('数据权限分配成功');
      onSuccess?.();
      onCancel?.();
    } catch (error) {
      logger.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 重置选择
  const handleReset = () => {
    setDataScope(DataScope.SELF);
    setSelectedDeptIds([]);
  };

  // 将扁平部门列表构建为树形结构
  const departmentTreeData = useMemo(() => {
    type DeptTreeNode = {
      key: string;
      title: ReactNode;
      children: DeptTreeNode[];
    };
    const nodeMap = new Map<string, DeptTreeNode>();
    const roots: DeptTreeNode[] = [];

    departments.forEach((dept) => {
      nodeMap.set(dept.departmentId, {
        key: dept.departmentId,
        title: (
          <Space>
            <span>{dept.name}</span>
            {dept.description && (
              <Tag color="processing">{dept.description}</Tag>
            )}
          </Space>
        ),
        children: [],
      });
    });

    departments.forEach((dept) => {
      const node = nodeMap.get(dept.departmentId)!;
      const parent = dept.parentId ? nodeMap.get(dept.parentId) : null;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [departments]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon
            name="DatabaseOutlined"
            style={{ marginRight: '8px', color: 'var(--gvray-color-primary)' }}
          />
          数据权限分配 - {currentRole?.name || roleName}
          {currentRole?.roleKey && (
            <Tag color="processing" style={{ marginLeft: '8px' }}>
              {currentRole.roleKey}
            </Tag>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <AuthButton
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          perms={[PERM.ROLE_UPDATE_DATA_SCOPE]}
        >
          保存分配
        </AuthButton>,
      ]}
      destroyOnHidden
      styles={{
        body: {
          maxHeight: '500px',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        },
      }}
    >
      <Spin spinning={loading}>
        <Text
          strong
          style={{
            fontSize: '16px',
            marginBottom: '16px',
            display: 'block',
          }}
        >
          选择数据权限类型：
        </Text>

        <Radio.Group
          value={dataScope}
          onChange={(e) => handlePermissionTypeChange(e.target.value)}
        >
          <Row gutter={[16, 12]}>
            {PERMISSION_TYPES.map((type) => (
              <Col span={24} key={type.value}>
                <PermissionTypeOption
                  theme={token}
                  selected={dataScope === type.value}
                  onClick={() => handlePermissionTypeChange(type.value)}
                >
                  <div className="option-icon" style={{ color: type.color }}>
                    {type.icon}
                  </div>
                  <div className="option-content">
                    <div className="option-title">{type.label}</div>
                    <div className="option-description">
                      {type.description}
                    </div>
                  </div>
                  <div className="option-radio">
                    <Radio value={type.value} />
                  </div>
                </PermissionTypeOption>
                {/* 自定义部门选择 - 作为自定义权限的子项 */}
                {type.value === DataScope.CUSTOM &&
                  dataScope === DataScope.CUSTOM && (
                    <div
                      style={{
                        marginTop: '4px',
                        marginLeft: '24px',
                        paddingLeft: '16px',
                        borderLeft: `2px solid ${token.colorPrimaryBorder}`,
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong>选择允许访问的部门：</Text>
                        {selectedDeptIds.length > 0 && (
                          <Tag
                            color="processing"
                            style={{ marginLeft: '8px' }}
                          >
                            已选 {selectedDeptIds.length} 个部门
                          </Tag>
                        )}
                      </div>
                      <DepartmentTreeContainer
                        theme={token}
                        style={{ maxWidth: '480px' }}
                      >
                        <Tree
                          checkable
                          checkedKeys={selectedDeptIds}
                          onCheck={(checkedKeys) =>
                            handleDepartmentChange(checkedKeys as string[])
                          }
                          treeData={departmentTreeData}
                          defaultExpandAll
                        />
                      </DepartmentTreeContainer>
                    </div>
                  )}
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Spin>
    </Modal>
  );
}
