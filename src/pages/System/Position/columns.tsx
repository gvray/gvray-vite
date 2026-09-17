import {
  CopyId,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';

export type PositionDict = {
  common_status: DictOption[];
};

export const getPositionColumns = (
  dict: PositionDict,
): TableProColumnsType<API.PositionResponseDto> => [
  {
    title: '岗位编号',
    dataIndex: 'positionId',
    key: 'positionId',
    width: 120,
    render: (positionId: string) => <CopyId id={positionId} />,
  },
  {
    title: '岗位编码',
    dataIndex: 'code',
    key: 'code',
    advancedSearch: { type: 'INPUT' },
    width: 160,
  },
  {
    title: '岗位名称',
    dataIndex: 'name',
    key: 'name',
    advancedSearch: { type: 'INPUT' },
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
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
