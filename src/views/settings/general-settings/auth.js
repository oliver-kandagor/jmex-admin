import {
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  InputNumber,
  Row,
  Space,
  Switch,
} from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import {
  AppleOutlined,
  FacebookOutlined,
  GoogleOutlined,
} from '@ant-design/icons';
import { CustomCard } from 'components/custom-card';

const socialAuthOptions = [
  {
    name: 'social_auth_google',
    icon: <GoogleOutlined style={{ fontSize: '1.5rem' }} />,
  },
  {
    name: 'social_auth_apple',
    icon: <AppleOutlined style={{ fontSize: '1.5rem' }} />,
  },
  {
    name: 'social_auth_facebook',
    icon: <FacebookOutlined style={{ fontSize: '1.5rem' }} />,
  },
];

const Auth = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);

  function updateSettings(data) {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  }

  const onFinish = (values) => updateSettings(values);

  return (
    <CustomCard title={t('auth.settings')}>
      <Form
        layout='vertical'
        form={form}
        name='global-settings'
        onFinish={onFinish}
        initialValues={{
          ...activeMenu.data,
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={`${t('otp.expire.time')} ( ${t('minute')} )`}
              name='otp_expire_time'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber addonAfter={t('minute')} className='w-100' min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('social.auth.options')}>
              <Descriptions
                bordered
                column={1}
                style={{ width: 'fit-content' }}
              >
                {socialAuthOptions.map((option) => (
                  <Descriptions.Item key={option.name} label={option.icon}>
                    <Form.Item
                      noStyle
                      name={option.name}
                      valuePropName='checked'
                    >
                      <Switch defaultChecked />
                    </Form.Item>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Space className='w-100 justify-content-end'>
          <Button
            type='primary'
            onClick={() => form.submit()}
            loading={loadingBtn}
          >
            {t('save')}
          </Button>
        </Space>
      </Form>
    </CustomCard>
  );
};

export default Auth;
