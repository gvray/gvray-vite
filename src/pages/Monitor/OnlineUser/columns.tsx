import {
  CopyId,
  DateTimeFormat,
  type TableProColumnsType,
} from '@/components';
import { Tag } from 'antd';

export const getOnlineUserColumns = (): TableProColumnsType<
  API.OnlineUserItemDto
> => [
  {
    title: '用户编号',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
    render: (userId: string) => <CopyId id={userId} />,
  },
  {
    title: '登陆账号',
    dataIndex: 'username',
    key: 'username',
    advancedSearch: { type: 'INPUT' },
    width: 150,
  },
  {
    title: '用户昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
  },
  {
    title: '最后活跃',
    dataIndex: 'lastActiveAt',
    key: 'lastActiveAt',
    width: 170,
    render: (time: string) => (
      <DateTimeFormat value={time} format="YYYY-MM-DD HH:mm:ss" />
    ),
  },
  {
    title: '会话数',
    dataIndex: 'sessionCount',
    key: 'sessionCount',
    width: 80,
    align: 'center',
    render: (count: number) => <Tag color="success">{count || 1}</Tag>,
  },
];
