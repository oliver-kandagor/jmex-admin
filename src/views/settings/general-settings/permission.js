import { Col, Divider, Form, Row, Switch } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import useDemo from 'helpers/useDemo';
import { CustomCard } from 'components/custom-card';

const Permission = () => {
  const { t } = useTranslation();
  const { isDemo } = useDemo();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);

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

  const permissionSettings = [
    {
      name: 'system_refund',
      label: 'system.refund',
      description: 'You.decide.whether.the.project.has.a.refund.system.or.not',
    },
    {
      name: 'order_auto_approved',
      label: 'order.auto.approved',
      description:
        'When.you.create.the.status.of.the.order.you.choose.the.approved.status',
    },
    {
      name: 'parcel_order_auto_approved',
      label: 'parcel.order.auto.approved',
      description:
        'When.you.create.parcel.order.it.creates.with.status.approved',
    },
    {
      name: 'refund_delete',
      label: 'refund.delete',
      description:
        'You.decide.whether.to.show.the.refund.system.disable.button',
    },
    {
      name: 'order_auto_delivery_man',
      label: 'order.auto.deliveryMan',
      description:
        'You.choose.the.deliveryman.yourself.when.you.create.the.order',
    },
    {
      name: 'blog_active',
      label: 'blog.active',
      description: 'You.choose.to.display.the.blog.page.yourself',
    },
    {
      name: 'prompt_email_modal',
      label: 'prompt.email.modal',
      description: 'Send.sms.to.email.subscribers',
    },
    {
      name: 'referral_active',
      label: 'referral.active',
      description: 'You.choose.whether.the.referral.will.work.or.not',
    },
    {
      name: 'aws',
      label: 'aws.active',
      description: 'You.choose.whether.the.aws.will.work.or.not',
      disabled: isDemo,
    },
    {
      name: 'by_subscription',
      label: 'by.subscription',
      description: 'You.choose.whether.the.by.subscription.will.work.or.not',
      disabled: isDemo,
    },
    {
      name: 'group_order',
      label: 'group.order',
      description: 'You.choose.whether.enable.group.order.or.not',
      disabled: isDemo,
    },
    {
      name: 'reservation_enable_for_user',
      label: 'reservation_enable_for_user',
      description:
        'You.choose.whether.enable.reservation.enable.for.user.or.not',
      disabled: isDemo,
    },
    {
      name: 'is_demo',
      label: 'is_demo',
      description: 'You.choose.whether.enable.is.demo.or.not',
    },
    {
      name: 'active_parcel',
      label: 'activate.parcel.mode',
      description: 'You.choose.whether.enable.parcel.or.not',
    },
    {
      name: 'product_auto_approve',
      label: 'auto.approve.products',
      description: 'You.choose.whether.auto.approve.products.or.not',
    },
    {
      name: 'category_auto_approve',
      label: 'auto.approve.categories',
      description: 'You.choose.whether.auto.approve.categories.or.not',
    },
    {
      name: 'before_order_phone_required',
      label: 'require.phone.for.create.order',
      description:
        'You.choose.whether.require.phone.number.or.not.for.create.order',
    },
    {
      name: 'driver_can_edit_credentials',
      label: 'driver_can_edit_credentials',
      description: 'You.choose.whether.driver.can.edit.credentials',
    },
    {
      name: 'auto_print_order',
      label: 'auto.print.order',
      description: 'auto.print.when.order.status.changed.to.accepted',
    },
    {
      name: 'ai_active',
      label: 'ai.features',
      description: 'You.can.enable.or.disable.ai.features',
    }
  ];

  const SettingRow = ({ name, label, description, disabled = false }) => (
    <Row gutter={24}>
      <Col span={12} className='mb-0'>
        <b>{t(label)}</b>
        <p className='mb-0'>{t(description)}</p>
      </Col>
      <Col
        span={12}
        className='mb-0'
        style={{ display: 'flex', justifyContent: 'end' }}
      >
        <Form.Item name={name} valuePropName='checked' className='mb-0'>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            loading={loadingBtn}
            disabled={disabled}
            onChange={(e) => updateSettings({ [name]: e })}
          />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <CustomCard title={t('permission')}>
      <Form
        layout='vertical'
        form={form}
        name='global-settings'
        initialValues={{
          ...activeMenu.data,
          active_parcel: Number(activeMenu.data?.active_parcel),
          auto_print_order: Number(activeMenu.data?.auto_print_order),
        }}
      >
        <Row gutter={24}>
          {permissionSettings.map((setting, index) => (
            <Col span={24} key={setting?.name}>
              {index !== 0 && <Divider />}
              <SettingRow key={setting?.name} {...setting} />
            </Col>
          ))}
        </Row>
      </Form>
    </CustomCard>
  );
};

export default Permission;
