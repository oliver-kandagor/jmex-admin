import { Button, Col, Divider, Form, Input, Row, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import { setMenuData } from 'redux/slices/menu';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import { CustomCard } from 'components/custom-card';

const Footer = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <CustomCard title={t('footer')}>
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
              label={t('phone')}
              name='phone'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('address')}
              name='address'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('footer.text')}
              name='footer_text'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
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

export default Footer;
