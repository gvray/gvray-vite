import {
  CopyId,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

export type DictionaryDict = {
  common_status: DictOption[];
};

export const getDictionaryItemColumns = (
  dict: DictionaryDict,
): TableProColumnsType<API.DictionaryItemResponseDto> => [
  {
    title: '字典项ID',
    dataIndex: 'itemId',
    key: 'itemId',
    width: 120,
    render: (itemId: string) => <CopyId id={itemId} />,
  },
  {
    title: '字典标签',
    dataIndex: 'label',
    key: 'label',
    width: 120,
    advancedSearch: { type: 'INPUT' },
    render: (label: string) => <Text>{label}</Text>,
  },
  {
    title: '字典值',
    dataIndex: 'value',
    key: 'value',
    width: 100,
    advancedSearch: { type: 'INPUT' },
    render: (value: string) => <Tag color="processing">{value}</Tag>,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
    render: (sort: number) => <Tag>{sort}</Tag>,
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
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
