import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import shopService from 'services/restaurant';
import brandService from 'services/brand';
import categoryService from 'services/category';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/product';
import { addMenu, replaceMenu, setRefetch } from 'redux/slices/menu';
import unitService from 'services/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MediaUpload from 'components/upload';
import TextArea from 'antd/lib/input/TextArea';
import { PlusOutlined } from '@ant-design/icons';
import { AsyncTreeSelect } from 'components/async-tree-select-category';
import kitchenService from 'services/kitchen';
import { InfiniteSelect } from 'components/infinite-select';
import { CustomCard } from 'components/custom-card';
import getTranslationFields from 'helpers/getTranslationFields';
import getLanguageFields from 'helpers/getLanguageFields';
import createImage from 'helpers/createImage';
import requestModelsService from 'services/request-models';
import { PRODUCT_TYPES } from 'constants/index';
import { DebounceSelect } from 'components/search';
import AiTranslation from '../../components/ai-translation/ai-translation';
import { MODELS } from '../../constants';

const ProductsIndex = ({
  isRequest,
  data,
  requestData,
  action_type = 'add',
  next,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [form] = Form.useForm();

  const type = Form.useWatch('type', form);
  const shop = Form.useWatch('shop', form);
  const nutrition = Form.useWatch('nutrition', form);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  const [fileList, setFileList] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [hasMore, setHasMore] = useState({
    shop: false,
    kitchen: false,
    brand: false,
    unit: false,
  });

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'category/add',
        name: t('add.category'),
      }),
    );
    navigate('/category/add');
  };

  const fetchUserShopList = ({ search, page }) => {
    const params = {
      search: search || undefined,
      perPage: 20,
      page,
      active: 1,
    };
    return shopService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        shop: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res.data.map((item) => ({
        label: item?.translation?.title || item?.id || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const fetchUserBrandList = ({ search, page }) => {
    const params = {
      page,
      perPage: 20,
      type: 'main',
      search: search || undefined,
      active: 1,
    };
    return brandService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        brand: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => ({
        label: item?.title || item?.id || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const fetchUserCategoryList = (search) => {
    const params = {
      page: 1,
      perPage: 20,
      type: 'main',
      search: search || undefined,
      shop_id: shop?.value,
      'statuses[0]': 'pending',
      'statuses[1]': 'published',
      active: 1,
    };
    return categoryService.selectPaginate(params).then((res) => {
      return res?.data?.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
        disabled: item?.children?.length > 0,
        children: item?.children?.map((child) => ({
          label: child?.translation?.title || t('N/A'),
          value: child?.id,
          key: child?.id,
        })),
      }));
    });
  };

  const fetchUserComboCategoryList = (search) => {
    const params = {
      page: 1,
      perPage: 20,
      type: 'combo',
      search: search || undefined,
      shop_id: shop?.value,
      'statuses[0]': 'pending',
      'statuses[1]': 'published',
      active: 1,
    };
    return categoryService.getAll(params).then((res) => {
      return res?.data?.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const fetchKitchens = ({ search, page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 20,
      active: 1,
      shop_id: shop?.value,
    };
    return kitchenService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        kitchen: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => ({
        label: item?.translation?.title || item?.id || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const fetchUnits = ({ search, page }) => {
    const params = {
      perPage: 20,
      page,
      active: 1,
      search: search || undefined,
    };
    return unitService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        unit: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => ({
        label: item?.translation?.title || item?.id || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const productCreate = (body) => {
    productService
      .create(body)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `product-${data?.uuid}`,
            url: `product/${data?.uuid}`,
            name: t('add.product'),
            data: {},
            refetch: false,
          }),
        );
        navigate(`/product/${data?.uuid}/?step=1`);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productUpdate = (body) => {
    productService
      .update(uuid, body)
      .then(() => {
        next();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  const productRequestUpdate = (body) =>
    requestModelsService.requestChangeUpdate(requestData?.id, {
      id: requestData?.model_id,
      type: 'product',
      data: body,
    });

  const onFinish = (values) => {
    setLoadingBtn(true);

    const images = fileList?.length ? fileList?.map((item) => item?.name) : [];

    if (isRequest) {
      productRequestUpdate({
        ...(requestData?.data || {}),
        ...(values || {}),
        images,
      })
        .then(() => {
          next();
          dispatch(setRefetch(activeMenu));
        })
        .finally(() => setLoadingBtn(false));
      return;
    }

    const body = {
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      min_qty: values?.min_qty || 0,
      max_qty: values?.max_qty || 0,
      interval: values?.interval || 0,
      tax: values?.tax || 0,
      active: Number(values?.active) || 0,
      vegetarian: Number(values.vegetarian) || 0,
      kcal: nutrition ? String(values.kcal) : undefined,
      carbs: nutrition ? String(values.carbs) : undefined,
      protein: nutrition ? String(values.protein) : undefined,
      fats: nutrition ? String(values.fats) : undefined,
      type: values?.type,
      shop_id: values?.shop?.value,
      category_id: values?.category?.value,
      kitchen_id: values?.kitchen_id?.value,
      brand_id: values?.brand?.value,
      unit_id: values?.unit?.value,
      images,
    };

    if (action_type === 'edit') {
      productUpdate(body);
    } else {
      productCreate(body);
    }
  };

  useEffect(() => {
    if (isRequest) {
      if (requestData?.data?.images?.length) {
        setFileList(
          (requestData?.data?.images || [])?.map((image) => createImage(image)),
        );
      }
      form.setFieldsValue({
        shop: requestData?.model?.shop
          ? {
              label: requestData?.model?.shop?.translation?.title || t('N/A'),
              value: requestData?.model?.shop?.id,
              key: requestData?.model?.shop?.id,
            }
          : null,
        ...(requestData?.data || {}),
      });
      return;
    }
    if (data) {
      if (data?.galleries?.length) {
        setFileList(data?.galleries?.map((item) => createImage(item?.path)));
      }
      form.setFieldsValue({
        ...getLanguageFields(languages, data, ['title', 'description']),
        min_qty: data?.min_qty || 0,
        max_qty: data?.max_qty || 0,
        interval: data?.interval || 1,
        tax: data?.tax || 0,
        active: Boolean(data?.active),
        vegetarian: Boolean(data?.vegetarian),
        nutrition: Boolean(
          data?.kcal || data?.carbs || data?.protein || data?.fats,
        ),
        kcal: data?.kcal ? Number(data?.kcal) : null,
        carbs: data?.carbs ? Number(data?.carbs) : null,
        protein: data?.protein ? Number(data?.protein) : null,
        fats: data?.fats ? Number(data?.fats) : null,
        type: data?.type || PRODUCT_TYPES[0],
        shop: data?.shop
          ? {
              label: data?.shop?.translation?.title || t('N/A'),
              value: data?.shop?.id,
              key: data?.shop?.id,
            }
          : null,
        category: data?.category
          ? {
              label: data?.category?.translation?.title || t('N/A'),
              value: data?.category?.id,
              key: data?.category?.id,
            }
          : null,
        kitchen: data?.kitchen
          ? {
              label: data?.kitchen?.translation?.title || t('N/A'),
              value: data?.kitchen?.id,
              key: data?.kitchen?.id,
            }
          : null,
        brand: data?.brand
          ? {
              label: data?.brand?.title || t('N/A'),
              value: data?.brand?.id,
              key: data?.brand?.id,
            }
          : null,
        unit: data?.unit
          ? {
              label: data?.unit?.translation?.title || t('N/A'),
              value: data?.unit?.id,
              key: data?.unit?.id,
            }
          : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, requestData, isRequest]);

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, vegetarian: true }}
      onFinish={onFinish}
    >
      <Row gutter={20}>
        <Col flex='1'>
          <Row gutter={12}>
            <Col span={24} className='mb-4'>
              <CustomCard title={t('basic')}>
                <Col span={24}>
                  {languages.map((item) => (
                    <Form.Item
                      key={'title' + item.id}
                      label={t('title')}
                      name={`title[${item.locale}]`}
                      labelCol={{ span: 10 }}
                      rules={[
                        {
                          required: item?.locale === defaultLang,
                          message: t('required'),
                        },
                        {
                          type: 'string',
                          min: 2,
                          max: 200,
                          message: t('min.2.max.200.chars'),
                        },
                      ]}
                      hidden={item.locale !== defaultLang}
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
                  {languages.map((item) => (
                    <Form.Item
                      key={'description' + item.id}
                      label={t('description')}
                      name={`description[${item.locale}]`}
                      rules={[
                        {
                          required: item?.locale === defaultLang,
                          message: t('required'),
                        },
                        {
                          validator(_, value) {
                            if (
                              value &&
                              value?.trim()?.length < 2 &&
                              item?.locale === defaultLang
                            ) {
                              return Promise.reject(
                                new Error(t('must.be.at.least.2')),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      hidden={item.locale !== defaultLang}
                    >
                      <AiTranslation
                        model={{
                          type: MODELS.Product,
                          id: activeMenu.data?.id,
                        }}
                      >
                        <TextArea rows={2} maxLength={150} />
                      </AiTranslation>
                    </Form.Item>
                  ))}
                </Col>
              </CustomCard>
            </Col>
            <Col span={24} className='mb-4'>
              <CustomCard title={t('price.information')}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={t('min.qty')}
                      name='min_qty'
                      tooltip={t('minimum.quantity.user.can.order')}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('max.qty')}
                      name='max_qty'
                      tooltip={t('maximum.quantity.user.can.order')}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('add.quantity.per.click')}
                      name='interval'
                      tooltip={t(
                        'If you set 100g, every “+” adds another 100g to the cart.',
                      )}
                      rules={[
                        { required: true, message: t('required') },
                        {
                          type: 'number',
                          min: 0,
                          message: t('must.be.positive'),
                        },
                      ]}
                    >
                      <InputNumber className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('tax')}
                      name='tax'
                      rules={[
                        {
                          validator(_, value) {
                            if (value && (value < 0 || value > 100)) {
                              return Promise.reject(
                                new Error(t('must.be.between.0.and.100')),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber className='w-100' addonAfter='%' />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
            <Col span={24} className='mb-4'>
              <CustomCard title={t('additional.information')}>
                <Row gutter={12} style={{ marginBottom: 11 }}>
                  <Col flex='1'>
                    <Form.Item
                      label={t('active')}
                      name='active'
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col flex='1'>
                    <Form.Item
                      label={t('vegetarian')}
                      name='vegetarian'
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col flex='1'>
                    <Form.Item
                      label={t('nutrition')}
                      name='nutrition'
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
          </Row>
        </Col>
        <Col span={10}>
          <Row gutter={12}>
            <Col span={24} className='mb-4'>
              <CustomCard title={t('information')}>
                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Item
                      label={t('type')}
                      name='type'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <Select
                        options={PRODUCT_TYPES.map((item) => ({
                          label: t(item),
                          value: item,
                          key: item,
                        }))}
                        onChange={() => {
                          form.setFieldsValue({
                            category: null,
                          });
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t('shop')}
                      name='shop'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InfiniteSelect
                        hasMore={hasMore.shop}
                        disabled={Boolean(isRequest)}
                        fetchOptions={fetchUserShopList}
                        onChange={() => {
                          form.setFieldsValue({
                            category: null,
                            kitchen: null,
                          });
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t('category')}
                      name='category'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      {type === 'single' ? (
                        <AsyncTreeSelect
                          disabled={Boolean(!shop?.value || !type)}
                          refetch
                          fetchOptions={fetchUserCategoryList}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                              <div className='p-1'>
                                <Button
                                  icon={<PlusOutlined />}
                                  className='w-100'
                                  onClick={goToAddCategory}
                                >
                                  {t('add.category')}
                                </Button>
                              </div>
                            </>
                          )}
                        />
                      ) : (
                        <DebounceSelect
                          disabled={Boolean(!shop?.value || !type)}
                          fetchOptions={fetchUserComboCategoryList}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('kitchen')} name='kitchen'>
                      <InfiniteSelect
                        fetchOptions={fetchKitchens}
                        hasMore={hasMore.kitchen}
                        disabled={!shop?.value}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('brand')} name='brand'>
                      <InfiniteSelect
                        hasMore={hasMore.brand}
                        fetchOptions={fetchUserBrandList}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t('unit')}
                      name='unit'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InfiniteSelect
                        hasMore={hasMore.unit}
                        fetchOptions={fetchUnits}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
            <Col span={24}>
              <CustomCard title={t('media')}>
                <Col span={24}>
                  <Form.Item
                    name='images'
                    rules={[
                      {
                        required: !fileList?.length,
                        message: t('required'),
                      },
                    ]}
                  >
                    <MediaUpload
                      type='products'
                      imageList={fileList}
                      setImageList={setFileList}
                      form={form}
                      multiple={true}
                    />
                  </Form.Item>
                </Col>
              </CustomCard>
            </Col>
          </Row>
        </Col>
        {Boolean(nutrition) && (
          <Col span={24}>
            <CustomCard title={t('nutritional.value.of.product')}>
              <Row gutter={12}>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: t('required') }]}
                    label={t('kcal')}
                    name='kcal'
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: t('required') }]}
                    label={t('carbs')}
                    name='carbs'
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: t('required') }]}
                    label={t('protein')}
                    name='protein'
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: t('required') }]}
                    label={t('fats')}
                    name='fats'
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </CustomCard>
          </Col>
        )}
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
