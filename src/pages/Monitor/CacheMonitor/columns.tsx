import { type TableProColumnsType } from '@/components';
import { formatDuration, formatFileSize as formatBytes } from '@gvray/formatkit';
import { Tag } from 'antd';

export const getCacheKeyColumns = (): TableProColumnsType<
  API.CacheKeyInfoDto
> => [
  {
    title: '缓存 Key',
    dataIndex: 'key',
    key: 'key',
    ellipsis: true,
  },
  {
    title: '剩余 TTL',
    dataIndex: 'ttl',
    key: 'ttl',
    width: 120,
    align: 'center',
    render: (ttl: number) => {
      if (typeof ttl !== 'number') return '-';
      if (ttl === -1) return <Tag>永久</Tag>;
      if (ttl === -2) return <Tag color="red">已过期</Tag>;
      return formatDuration(ttl);
    },
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: 120,
    align: 'center',
    render: (size: number) => (typeof size === 'number' ? formatBytes(size) : '-'),
  },
];
