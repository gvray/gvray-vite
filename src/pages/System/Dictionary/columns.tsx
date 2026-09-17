import {
  CellName,
  CopyId,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';
import { Tag } from 'antd';

export type DictionaryDict = {
  common_status: DictOption[];
};

export const getDictionaryColumns = (
  dict: DictionaryDict,
): TableProColumnsType<API.DictionaryTypeResponseDto> => [
  {
    title: '字典编号',
    dataIndex: 'typeId',
    key: 'typeId',
    width: 100,
    render: (typeId: string) => <CopyId id={typeId} $width={80} />,
  },
  {
    title: '字典名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    advancedSearch: { type: 'INPUT' },
    render: (name: string, record: API.DictionaryTypeResponseDto) => (
      <CellName name={name} description={record.description} />
    ),
  },
  {
    title: '字典类型',
    dataIndex: 'code',
    key: 'code',
    width: 150,
    advancedSearch: { type: 'INPUT' },
    render: (code: string) => <Tag color="processing">{code}</Tag>,
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
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 140,
    advancedSearch: { type: 'DATE_RANGE' },
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
