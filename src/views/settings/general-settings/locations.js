import { Button, Col, Divider, Form, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { shallowEqual, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Map from 'components/map';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import useDemo from 'helpers/useDemo';
import { CustomCard } from 'components/custom-card';

const Locations = ({ location, setLocation }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { isDemo } = useDemo();

  const updateSettings = (data) => {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  };

  const onFinish = (values) => {
    const body = {
      ...values,
      location: `${location.lat}, ${location.lng}`,
      'location[latitude]': location.lat,
      'location[longitude]': location.lng,
    };
    updateSettings(body);
  };

  return (
    <CustomCard title={t('location')}>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        initialValues={{
          ...activeMenu.data,
        }}
      >
        <Row>
          <Col span={24}>
            <Form.Item
              label={t('google.map.key')}
              name='google_map_key'
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
          <Col span={24}>
            <Form.Item label={t('map')} name='location'>
              <Map location={location} setLocation={setLocation} />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Space className='w-100 justify-content-end'>
          <Button
            type='primary'
            onClick={() => form.submit()}
            loading={loadingBtn}
            disabled={isDemo}
          >
            {t('save')}
          </Button>
        </Space>
      </Form>
    </CustomCard>
  );
};

export default Locations;
