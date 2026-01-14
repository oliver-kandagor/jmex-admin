import { useTranslation } from 'react-i18next';
import { Form, Row, Col, Space, Button, Divider } from 'antd';
import { CustomCard } from 'components/custom-card';
import { SketchPicker } from 'react-color';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import settingService from 'services/settings';
import { toast } from 'react-toastify';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import { useState } from 'react';

const defaultPrimaryColors = {
  primary_color: '#83ea00',
  primary_button_font_color: '#232b2f',
};

const SettingsPrimaryColor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetColors = () => {
    form.setFieldsValue(defaultPrimaryColors);
  };

  const updateSettings = (data) => {
    setIsSubmitting(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onFinish = (values) => {
    updateSettings(values);
  };

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        primary_color:
          activeMenu.data?.primary_color || defaultPrimaryColors.primary_color,
        primary_button_font_color:
          activeMenu.data?.primary_button_font_color ||
          defaultPrimaryColors.primary_button_font_color,
      }}
      onFinish={onFinish}
    >
      <CustomCard
        title={t('primary.color')}
        extra={<Button onClick={handleResetColors}>{t('reset')}</Button>}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('primary.color')}
              name='primary_color'
              rules={[{ required: true, message: t('required') }]}
            >
              <SketchPicker
                color={Form.useWatch('primary_color', form)}
                disableAlpha
                onChangeComplete={(color) =>
                  form.setFieldsValue({ primary_color: color.hex })
                }
              />
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  marginTop: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: Form.useWatch('primary_color', form),
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('primary.button.font.color')}
              name='primary_button_font_color'
              rules={[{ required: true, message: t('required') }]}
            >
              <SketchPicker
                color={Form.useWatch('primary_button_font_color', form)}
                disableAlpha
                onChangeComplete={(color) =>
                  form.setFieldsValue({ primary_button_font_color: color.hex })
                }
              />
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  marginTop: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: Form.useWatch('primary_button_font_color', form),
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Space className='w-100 justify-content-end w-100'>
          <Button type='primary' htmlType='submit' loading={isSubmitting}>
            {t('save')}
          </Button>
        </Space>
      </CustomCard>
    </Form>
  );
};

export default SettingsPrimaryColor;
