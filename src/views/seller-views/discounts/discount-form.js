import { useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import { DebounceSelect } from 'components/search';
import MediaUpload from 'components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/seller/product';
import { toast } from 'react-toastify';
import { removeFromMenu } from 'redux/slices/menu';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

export default function DiscountForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image?.length ? activeMenu.data?.image : [],
  );

  const selectedType = Form.useWatch('type', form);

  //functions
  const fetchProducts = (search) => {
    const params = {
      search: search || undefined,
      shop_id: shop?.id,
      status: 'published',
      active: 1,
      rest: 1,
    };
    return productService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item?.translation?.title,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      type: values?.type,
      price: values?.price,
      start: values?.duration?.[0]?.format('YYYY-MM-DD'),
      end: values?.duration?.[1]?.format('YYYY-MM-DD'),
      products: values?.products?.map((item) => item?.value),
      images: image?.map((item) => item?.name),
    };
    handleSubmit(body)
      .then(() => {
        const nextUrl = 'seller/discounts';
        toast.success(t('successfully.saved'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Form layout='vertical' form={form} onFinish={onFinish}>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('type')}
            name={'type'}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              options={[
                { label: t('fix'), value: 'fix', key: 'fix' },
                { label: t('percent'), value: 'percent', key: 'percent' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('price')}
            name='price'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber
              min={0}
              className='w-100'
              addonBefore={
                selectedType === 'fix' &&
                defaultCurrency?.position === 'before' &&
                defaultCurrency?.symbol
              }
              addonAfter={
                selectedType === 'fix'
                  ? defaultCurrency?.position === 'after' &&
                    defaultCurrency?.symbol
                  : '%'
              }
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('duration')}
            name='duration'
            rules={[{ required: true, message: t('required') }]}
          >
            <RangePicker
              placeholder={[t('start.date'), t('end.date')]}
              className='w-100'
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('products')}
            name='products'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect fetchOptions={fetchProducts} mode='multiple' />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                required: !image.length,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='discounts'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
              name='image'
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Space>
    </Form>
  );
}
