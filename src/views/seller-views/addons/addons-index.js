import { useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/seller/product';
import { replaceMenu } from 'redux/slices/menu';
import unitService from 'services/seller/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextArea from 'antd/lib/input/TextArea';
import { InfiniteSelect } from 'components/infinite-select';
import { CustomCard } from 'components/custom-card';
import getTranslationFields from 'helpers/getTranslationFields';
import { MODELS } from '../../../constants';
import AiTranslation from '../../../components/ai-translation/ai-translation';

const ProductsIndex = ({ next, action_type = '' }) => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [hasMore, setHasMore] = useState({ unit: false });

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      tax: values?.tax,
      min_qty: values?.min_qty,
      max_qty: values?.max_qty,
      active: Number(values?.active),
      unit_id: values?.unit?.value,
      interval: Number(values?.interval) || 1,
      addon: 1,
    };

    if (action_type === 'edit') {
      productUpdate(values, body);
    } else {
      productCreate(values, body);
    }
  };

  const productCreate = (values, params) => {
    productService
      .create(params)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `addon-edit-${data?.uuid}`,
            url: `seller/addon/${data?.uuid}`,
            name: t('add.addon'),
            refetch: false,
          }),
        );
        navigate(`/seller/addon/${data?.uuid}?step=1`);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productUpdate = (values, params) => {
    productService
      .update(uuid, params)
      .then(() => {
        next();
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetchUnits = ({ search, page = 1 }) => {
    const params = {
      search: search || undefined,
      active: 1,
      page,
    };
    return unitService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        unit: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
      onFinish={onFinish}
    >
      <Row gutter={[12, 12]}>
        <Col span={16}>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <CustomCard title={t('basic')}>
                <Row gutter={12}>
                  <Col span={24}>
                    {languages?.map((item) => (
                      <Form.Item
                        key={`title[${item?.locale}]`}
                        label={t('title')}
                        name={`title[${item?.locale}]`}
                        hidden={item?.locale !== defaultLang}
                        rules={[
                          {
                            required: item?.locale === defaultLang,
                            message: t('required'),
                          },
                        ]}
                      >
                        <AiTranslation
                          model={{
                            type: MODELS.Product,
                            id: activeMenu.data?.id,
                          }}
                          isTitleField
                        >
                          <Input />
                        </AiTranslation>
                      </Form.Item>
                    ))}
                  </Col>
                  <Col span={24}>
                    {languages?.map((item) => (
                      <Form.Item
                        key={`description[${item?.locale}]`}
                        label={t('description')}
                        name={`description[${item?.locale}]`}
                        hidden={item?.locale !== defaultLang}
                        rules={[
                          {
                            required: item?.locale === defaultLang,
                            message: t('required'),
                          },
                        ]}
                      >
                        <AiTranslation
                          model={{
                            type: MODELS.Product,
                            id: activeMenu.data?.id,
                          }}
                        >
                          <TextArea rows={1} />
                        </AiTranslation>
                      </Form.Item>
                    ))}
                  </Col>
                </Row>
              </CustomCard>
            </Col>
            <Col span={24}>
              <CustomCard title={t('prices')}>
                <Row gutter={[12, 12]} style={{ marginBottom: 3 }}>
                  <Col span={8}>
                    <Form.Item
                      label={t('tax')}
                      name='tax'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber
                        className='w-100'
                        min={0}
                        max={100}
                        addonAfter='%'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('min.qty')}
                      name='min_qty'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('max.qty')}
                      name='max_qty'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <CustomCard title={t('additional')}>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={t('unit')}
                  name='unit'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InfiniteSelect
                    fetchOptions={fetchUnits}
                    hasMore={hasMore.unit}
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name='interval'
                  label={t('interval')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber className='w-100' min={0} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t('active')}
                  name='active'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </CustomCard>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};

export default ProductsIndex;
