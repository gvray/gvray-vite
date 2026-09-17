import {
  DateTimeFormat,
  Icon,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';
import { Tag } from 'antd';

export type MenuDict = {
  common_status: DictOption[];
};

const TYPE_OPTIONS = [
  { label: '目录', value: 'CATALOG' },
  { label: '菜单', value: 'MENU' },
];

export const getMenuColumns = (
  dict: MenuDict,
): TableProColumnsType<API.MenuTreeNodeDto> => [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 80,
    render: (_, record) => (record?.icon ? <Icon name={record.icon} /> : '-'),
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    advancedSearch: { type: 'SELECT', value: TYPE_OPTIONS },
    render: (type: string) => (
      <Tag color={type === 'CATALOG' ? 'processing' : 'green'}>
        {type === 'CATALOG' ? '目录' : '菜单'}
      </Tag>
    ),
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    advancedSearch: { type: 'INPUT' },
    width: 200,
    render: (path: string) => path || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    advancedSearch: { type: 'SELECT', value: dict.common_status },
    render: (status: string) => (
      <StatusTag value={status} options={dict.common_status} />
    ),
  },
  {
    title: '是否隐藏',
    dataIndex: 'hidden',
    key: 'hidden',
    width: 100,
    render: (hidden: boolean) => (
      <Tag color={hidden ? 'default' : 'green'}>{hidden ? '是' : '否'}</Tag>
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
