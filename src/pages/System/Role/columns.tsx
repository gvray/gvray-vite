import {
  CopyId,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';

export type RoleDict = {
  common_status: DictOption[];
};

export const getRoleColumns = (
  dict: RoleDict,
): TableProColumnsType<API.RoleResponseDto> => [
  {
    title: '角色编号',
    dataIndex: 'roleId',
    key: 'roleId',
    width: 120,
    render: (roleId: string) => <CopyId id={roleId} />,
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
    advancedSearch: { type: 'INPUT' },
    width: 180,
  },
  {
    title: '角色标识',
    dataIndex: 'roleKey',
    key: 'roleKey',
    advancedSearch: { type: 'INPUT' },
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    advancedSearch: { type: 'SELECT', value: dict.common_status },
    render: (status: number) => (
      <StatusTag value={status} options={dict.common_status} />
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
    advancedSearch: { type: 'DATE_RANGE' },
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
