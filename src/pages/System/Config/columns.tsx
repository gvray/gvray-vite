import {
  CellName,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';
import { Tag } from 'antd';

export type ConfigDict = {
  config_group: DictOption[];
  common_status: DictOption[];
  config_type: DictOption[];
};

const IS_PUBLIC_OPTIONS = [
  { label: '公开', value: 'true' },
  { label: '私有', value: 'false' },
];

export const getConfigColumns = (
  dict: ConfigDict,
): TableProColumnsType<API.ConfigResponseDto> => [
  {
    title: '配置名称',
    dataIndex: 'name',
    key: 'name',
    width: 240,
    advancedSearch: { type: 'INPUT' },
    render: (name: string, record: API.ConfigResponseDto) => (
      <CellName name={name} description={record.description} />
    ),
  },
  {
    title: '配置键',
    dataIndex: 'key',
    key: 'key',
    width: 180,
    advancedSearch: { type: 'INPUT' },
    render: (key: string) => <Tag color="processing">{key}</Tag>,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (type: string) => (
      <Tag>
        {dict.config_type?.find((d) => d.value === String(type))?.label ||
          type}
      </Tag>
    ),
  },
  {
    title: '分组',
    dataIndex: 'group',
    key: 'group',
    width: 120,
    advancedSearch: { type: 'SELECT', value: dict.config_group },
    render: (group: string) => {
      const label =
        dict.config_group?.find((d) => String(d.value) === group)?.label ||
        group;
      return <Tag>{label}</Tag>;
    },
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
    title: '前端公开',
    dataIndex: 'isPublic',
    key: 'isPublic',
    width: 100,
    advancedSearch: { type: 'SELECT', value: IS_PUBLIC_OPTIONS },
    render: (isPublic: boolean) => (
      <Tag color={isPublic ? 'green' : 'default'}>
        {isPublic ? '公开' : '私有'}
      </Tag>
    ),
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 160,
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
