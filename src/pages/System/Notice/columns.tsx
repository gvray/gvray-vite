import {
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import { Tag } from 'antd';

const noticeTypeMap: Record<string, string> = {
  notice: '通知',
  announcement: '通告',
};

const TYPE_OPTIONS = [
  { label: '通知', value: 'notice' },
  { label: '通告', value: 'announcement' },
];

const STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
];

export const getNoticeColumns = (): TableProColumnsType<
  API.NoticeResponseDto
> => [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 280,
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    advancedSearch: { type: 'SELECT', value: TYPE_OPTIONS },
    render: (type: string) => <Tag>{noticeTypeMap[type] || type}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    advancedSearch: { type: 'SELECT', value: STATUS_OPTIONS },
    render: (status: string) => (
      <StatusTag value={status} options={STATUS_OPTIONS} />
    ),
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 160,
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
