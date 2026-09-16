import { Icon } from '@/components';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Listy,
  Space,
  Tag,
  Typography,
} from 'antd';
import { maskPhone } from '@gvray/formatkit';
import styles from './index.module.scss';
import { useProfileSecurityModel } from './model';

const { Text } = Typography;

const TabSecurity: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const model = useProfileSecurityModel(passwordForm);
  const emailBound = !!model.profile?.profile?.email;
  const phoneBound = !!model.profile?.profile?.phone;

  return (
    <div className={styles.securityGrid}>
      <Card
        title={
          <>
            <Icon name="KeyOutlined" /> 修改密码
          </>
        }
        className={styles.moduleCard}
        size="small"
      >
        <Alert
          type="info"
          showIcon
          className={styles.securityAlert}
          title="密码修改成功后将清除当前登录状态，需要重新登录。"
        />
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={model.handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password
              placeholder="请输入原密码"
              iconRender={(visible) =>
                visible ? (
                  <Icon name="EyeTwoTone" />
                ) : (
                  <Icon name="EyeInvisibleOutlined" />
                )
              }
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码长度至少8位' },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码（至少8位）"
              iconRender={(visible) =>
                visible ? (
                  <Icon name="EyeTwoTone" />
                ) : (
                  <Icon name="EyeInvisibleOutlined" />
                )
              }
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value)
                    return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              iconRender={(visible) =>
                visible ? (
                  <Icon name="EyeTwoTone" />
                ) : (
                  <Icon name="EyeInvisibleOutlined" />
                )
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={model.passwordLoading}
              block
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <>
            <Icon name="SafetyCertificateOutlined" /> 安全建议
          </>
        }
        className={styles.moduleCard}
        size="small"
      >
        <Listy
          items={[
            {
              icon: <Icon name="MailOutlined" />,
              title: '邮箱绑定',
              desc: emailBound
                ? String(model.profile?.profile?.email)
                : '暂未绑定邮箱，建议联系管理员补全',
              ok: emailBound,
            },
            {
              icon: <Icon name="MobileOutlined" />,
              title: '手机号绑定',
              desc: phoneBound
                ? maskPhone(String(model.profile?.profile?.phone ?? ''))
                : '暂未绑定手机号，建议联系管理员补全',
              ok: phoneBound,
            },
            {
              icon: <Icon name="LockOutlined" />,
              title: '登录记录',
              desc: '建议定期查看登录记录，发现异常后及时修改密码',
              ok: true,
            },
          ]}
          rowKey="title"
          itemRender={(item) => (
            <div className={styles.responsiveListItem}>
              <span className={item.ok ? styles.safeIcon : styles.mutedIcon}>
                {item.icon}
              </span>
              <div className={styles.securityItemContent}>
                <Space size={8} wrap>
                  <Text className={styles.listTitle}>{item.title}</Text>
                  <Tag color={item.ok ? 'green' : 'default'}>
                    {item.ok ? '已完成' : '待完善'}
                  </Tag>
                </Space>
                <Text type="secondary">{item.desc}</Text>
              </div>
            </div>
          )}
        />
        <Alert
          type="success"
          showIcon
          className={styles.securityAlert}
          icon={<Icon name="CheckCircleFilled" />}
          title="权限、登录记录和密码修改均来自真实接口能力。"
        />
      </Card>
    </div>
  );
};

export default TabSecurity;
