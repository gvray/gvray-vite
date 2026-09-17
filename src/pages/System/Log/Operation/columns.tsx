import { DateTimeFormat, type TableProColumnsType } from '@/components';
import { Tag, Tooltip } from 'antd';

const renderEllipsis = (text: string) => (
  <Tooltip placement="topLeft" title={text}>
    <span
      style={{
        display: 'inline-block',
        maxWidth: 180,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
      }}
    >
      {text}
    </span>
  </Tooltip>
);

export const getOperationLogColumns = (): TableProColumnsType<
  Record<string, unknown>
> => [
  {
    title: '用户',
    dataIndex: 'username',
    key: 'username',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '模块',
    dataIndex: 'module',
    key: 'module',
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '方法',
    dataIndex: 'method',
    key: 'method',
    width: 80,
    advancedSearch: { type: 'INPUT' },
  },
  {
    title: '结果',
    dataIndex: 'result',
    key: 'result',
    width: 80,
    advancedSearch: {
      type: 'SELECT',
      value: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ],
    },
    render: (result: string) => (
      <Tag color={result === 'success' ? 'success' : 'error'}>
        {result === 'success' ? '成功' : '失败'}
      </Tag>
    ),
  },
  {
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
    ellipsis: true,
    advancedSearch: { type: 'INPUT' },
    render: (text: string) => renderEllipsis(text),
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    key: 'ipAddress',
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    ellipsis: true,
    render: (text: string) => renderEllipsis(text),
  },
  {
    title: '耗时',
    dataIndex: 'latencyMs',
    key: 'latencyMs',
    width: 90,
    render: (v: number) => (v ? `${v} ms` : '-'),
  },
  {
    title: '时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
    advancedSearch: { type: 'DATE_RANGE' },
    render: (createdAt: string) => <DateTimeFormat value={createdAt} />,
  },
];
