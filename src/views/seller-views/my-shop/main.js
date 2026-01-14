import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Space } from 'antd';
import ShopAddData from './shop-add-data';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setMenuData } from 'redux/slices/menu';
import shopService from 'services/seller/shop';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from 'helpers/getDefaultLocation';
import { SHOP_EMAIL_STATUSES } from '../../../constants';
import getTranslationFields from '../../../helpers/getTranslationFields';

const ShopMain = ({ next }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const [location, setLocation] = useState(
    activeMenu?.data?.location
      ? {
          lat: parseFloat(activeMenu?.data?.location?.latitude),
          lng: parseFloat(activeMenu?.data?.location?.longitude),
        }
      : getDefaultLocation(settings),
  );
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(
    activeMenu.data?.logo_img ? [activeMenu.data?.logo_img] : [],
  );
  const [backImage, setBackImage] = useState(
    activeMenu.data?.background_img ? [activeMenu.data?.background_img] : [],
  );

  const emailStatusOptions = useMemo(
    () =>
      SHOP_EMAIL_STATUSES.map((item) => ({
        label: t(item),
        value: item,
        key: item,
      })),
    // eslint-disable-next-line
    [],
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } }),
      );
    };
    // eslint-disable-next-line
  }, []);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      // address: getTranslationFields(languages, values, 'address', true),
      address: languages?.reduce((acc, language) => {
        acc[language?.locale] = values?.address;
        return acc;
      }, {}),
      description: getTranslationFields(languages, values, 'description'),
      title: getTranslationFields(languages, values, 'title'),
      categories: values.categories.map((e) => e.value),
      delivery_time: 0,
      delivery_time_from: values.delivery_time_from,
      delivery_time_to: values.delivery_time_to,
      delivery_time_type: values.delivery_time_type,
      email_statuses: values?.emailStatuses?.length
        ? values?.emailStatuses?.map((emailStatus) => emailStatus?.value)
        : undefined,
      images: [logoImage?.[0]?.name, backImage?.[0]?.name],
      'location[latitude]': location.lat,
      'location[longitude]': location.lng,
      min_amount: String(values.min_amount),
      new_order_after_payment: values.new_order_after_payment ? 1 : 0,
      order_payment:
        values?.order_payment?.value || values?.order_payment || undefined,
      percentage: values.percentage,
      phone: String(values.phone),
      price: values.price,
      price_per_km: values.price_per_km,
      status: values.status,
      tags: values?.tags?.map((e) => e.value),
      tax: values.tax,
      user_id: values.user.value,
      wifi_name: values?.wifi_name || '',
      wifi_password: values?.wifi_password || '',
    };
    shopUpdate(values, body);
  };

  function shopUpdate(values, params) {
    shopService
      .update(params)
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: values,
          }),
        );
        next();
      })
      .finally(() => setLoadingBtn(false));
  }

  return (
    <>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          visibility: true,
          status: 'new',
          ...activeMenu.data,
        }}
      >
        <ShopAddData
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          backImage={backImage}
          setBackImage={setBackImage}
          form={form}
          location={location}
          setLocation={setLocation}
          emailStatusOptions={emailStatusOptions}
        />
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('next')}
          </Button>
        </Space>
      </Form>
    </>
  );
};
export default ShopMain;
