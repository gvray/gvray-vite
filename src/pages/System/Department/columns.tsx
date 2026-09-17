import {
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';

export type DepartmentDict = {
  common_status: DictOption[];
};

export const getDepartmentColumns = (
  dict: DepartmentDict,
): TableProColumnsType<API.DepartmentResponseDto> => [
  {
    title: '部门名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    advancedSearch: { type: 'SELECT', value: dict.common_status },
    render: (status: string | number) => (
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
