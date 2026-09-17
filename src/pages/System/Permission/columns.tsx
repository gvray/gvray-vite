import { DateTimeFormat, type TableProColumnsType } from '@/components';
import { Tag, Tooltip, Typography } from 'antd';
import type { PermissionTreeNode } from './model';

type FormatMessage = (descriptor: {
  id: string;
  defaultMessage?: string;
}) => string;

export const getPermissionColumns = (
  formatMessage: FormatMessage,
): TableProColumnsType<PermissionTreeNode> => [
  {
    title: formatMessage({ id: 'permission.column.name' }),
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 240,
    ellipsis: { showTitle: false },
    render: (_, record: PermissionTreeNode) => {
      const name = record.intlId
        ? formatMessage({ id: record.intlId, defaultMessage: record.name })
        : record.name;
      if (record.nodeType === 'DOMAIN') {
        return (
          <Typography.Text strong className="domain-name">
            {name}
          </Typography.Text>
        );
      }
      if (record.nodeType === 'RESOURCE') {
        return (
          <Typography.Text strong type="secondary">
            {name}
          </Typography.Text>
        );
      }
      return (
        <Tooltip title={name} placement="topLeft">
          <span>{name}</span>
        </Tooltip>
      );
    },
  },
  {
    title: formatMessage({ id: 'permission.column.code' }),
    dataIndex: 'code',
    key: 'code',
    width: 150,
    ellipsis: { showTitle: false },
    render: (code: string, record: PermissionTreeNode) => {
      if (!code) return '-';
      return (
        <Tooltip title={code} placement="topLeft">
          <Typography.Text
            code
            copyable={
              record.isVirtual
                ? false
                : {
                    text: code,
                    tooltips: [
                      formatMessage({ id: 'permission.copy.copy' }),
                      formatMessage({ id: 'permission.copy.copied' }),
                    ],
                  }
            }
          >
            {code}
          </Typography.Text>
        </Tooltip>
      );
    },
  },
  {
    title: formatMessage({ id: 'permission.column.description' }),
    dataIndex: 'description',
    key: 'description',
    ellipsis: { showTitle: false },
    render: (desc: string, record: PermissionTreeNode) => {
      if (record.isVirtual) {
        const defaultDesc =
          record.nodeType === 'DOMAIN'
            ? formatMessage({ id: 'permission.desc.domain' })
            : formatMessage({ id: 'permission.desc.resource' });
        return (
          <Typography.Text type="secondary">{defaultDesc}</Typography.Text>
        );
      }
      if (!desc) return <Typography.Text type="secondary">-</Typography.Text>;
      return (
        <Tooltip title={desc} placement="topLeft">
          <span>{desc}</span>
        </Tooltip>
      );
    },
  },
  {
    title: formatMessage({ id: 'permission.column.origin' }),
    dataIndex: 'origin',
    key: 'origin',
    width: 90,
    render: (origin: string, record: PermissionTreeNode) => {
      if (record.isVirtual) {
        return (
          <Tag color="default">
            {formatMessage({ id: 'permission.tag.group' })}
          </Tag>
        );
      }
      return (
        <Tag color={origin === 'SYSTEM' ? 'blue' : 'green'}>
          {origin === 'SYSTEM'
            ? formatMessage({ id: 'permission.origin.system' })
            : formatMessage({ id: 'permission.origin.user' })}
        </Tag>
      );
    },
  },
  {
    title: formatMessage({ id: 'permission.column.updatedAt' }),
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 100,
    render: (time: string, record: PermissionTreeNode) => {
      if (record.isVirtual || !time) return '-';
      return <DateTimeFormat value={time} />;
    },
  },
];
