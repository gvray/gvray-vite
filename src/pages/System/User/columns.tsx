import {
  CopyId,
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';

export type UserDict = {
  user_status: DictOption[];
  user_gender: DictOption[];
};

export const getUserColumns = (
  dict: UserDict,
): TableProColumnsType<API.UserResponseDto> => [
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
    width: 180,
  },
  {
    title: '用户名称',
    dataIndex: 'nickname',
    key: 'nickname',
    advancedSearch: { type: 'INPUT' },
    width: 180,
  },
  {
    title: '手机号码',
    key: 'phone',
    dataIndex: 'phone',
    advancedSearch: { type: 'INPUT' },
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    advancedSearch: { type: 'SELECT', value: dict.user_status },
    render: (status: string) => (
      <StatusTag value={status} options={dict.user_status} />
    ),
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 160,
    advancedSearch: { type: 'DATE_RANGE' },
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
