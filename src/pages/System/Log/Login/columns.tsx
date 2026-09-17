import {
  DateTimeFormat,
  StatusTag,
  type TableProColumnsType,
} from '@/components';
import type { DictOption } from '@/types/dict';

export type LoginLogDict = {
  common_status: DictOption[];
};

export const getLoginLogColumns = (
  dict: LoginLogDict,
): TableProColumnsType<API.LoginLogResponseDto> => [
  { title: '访问编号', dataIndex: 'id', key: 'id' },
  {
    title: '登陆账号',
    dataIndex: 'account',
    key: 'account',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    key: 'ipAddress',
    advancedSearch: { type: 'INPUT' },
  },
  { title: '登录地点', dataIndex: 'location' },
  { title: '浏览器', dataIndex: 'browser' },
  { title: '操作系统', dataIndex: 'os' },
  {
    title: '登录状态',
    dataIndex: 'status',
    key: 'status',
    advancedSearch: { type: 'SELECT', value: dict.common_status },
    render: (status: string | number) => (
      <StatusTag value={status} options={dict.common_status} />
    ),
  },
  { title: '登录类型', dataIndex: 'loginType' },
  {
    title: '操作信息',
    dataIndex: 'failReason',
    render: (reason: string) => reason || '登陆成功',
  },
  {
    title: '登录时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    advancedSearch: { type: 'DATE_RANGE' },
    render: (time: string) => <DateTimeFormat value={time} />,
  },
];
