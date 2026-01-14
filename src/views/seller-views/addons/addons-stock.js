import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from 'antd';
import productService from 'services/seller/product';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from 'redux/slices/menu';

const ProductStock = ({ prev }) => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const extras = [
      {
        price: values?.price,
        quantity: values?.quantity,
        sku: values?.sku || '',
      },
    ];
    productService
      .stocks(uuid, { extras })
      .then(() => {
        const nextUrl = 'seller/addons';
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    const stock = activeMenu.data?.stocks?.[0];
    form.setFieldsValue({
      price: stock?.price || 0,
      quantity: stock?.quantity || 0,
      sku: stock?.sku || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.data?.stocks]);

  return (
    <Form layout='vertical' form={form} onFinish={onFinish}>
      <Row
        gutter={12}
        align='middle'
        style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
      >
        <Col span={8}>
          <Form.Item
            label={t('price')}
            name={'price'}
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={t('quantity')}
            name={'quantity'}
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={t('sku')} name='sku'>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={prev}>{t('prev')}</Button>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};

export default ProductStock;
