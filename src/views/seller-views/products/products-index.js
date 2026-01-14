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
import { DebounceSelect } from 'components/search';
import brandService from 'services/rest/brand';
import categoryService from 'services/rest/category';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/seller/product';
import { addMenu, replaceMenu, setRefetch } from 'redux/slices/menu';
import unitService from 'services/seller/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MediaUpload from 'components/upload';
import TextArea from 'antd/lib/input/TextArea';
import { PlusOutlined } from '@ant-design/icons';
import { AsyncTreeSelect } from 'components/async-tree-select-category';
import kitchenService from 'services/seller/kitchen';
import { InfiniteSelect } from 'components/infinite-select';
import { CustomCard } from 'components/custom-card';
import getTranslationFields from 'helpers/getTranslationFields';
import createImage from 'helpers/createImage';
import getLanguageFields from 'helpers/getLanguageFields';
import { checkIsTrueValue } from 'helpers/checkIsTrueValue';
import requestModelsService from 'services/seller/request-models';
import { PRODUCT_TYPES } from '../../../constants';
import { MODELS } from '../../../constants';
import AiTranslation from '../../../components/ai-translation/ai-translation';

const ProductsIndex = ({
  data,
  mainInfoChangedData,
  requestData,
  isRequest,
  actionType,
  next,
  onMainInfoChanged,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { uuid } = useParams();

  const type = Form.useWatch('type', form);
  const nutrition = Form.useWatch('nutrition', form);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { settings } = useSelector((state) => state.globalSettings);

  const [fileList, setFileList] = useState(
    activeMenu.data?.images ? activeMenu.data?.images : [],
  );
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [hasMore, setHasMore] = useState({
    kitchen: false,
    brand: false,
    unit: false,
  });

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        url: `seller/category/add`,
        id: 'seller/category/add',
        name: t('edit.category'),
      }),
    );
    navigate(`/seller/category/add`);
  };

  const fetchBrands = ({ search, page }) => {
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

  const fetchCategories = (search) => {
    const params = {
      page: 1,
      perPage: 20,
      type: 'main',
      search: search || undefined,
      'statuses[0]': 'pending',
      'statuses[1]': 'published',
      active: 1,
    };
    return categoryService.paginateSelect(params).then((res) => {
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

  const fetchComboCategories = (search) => {
    const params = {
      page: 1,
      perPage: 20,
      type: 'combo',
      search: search || undefined,
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
    };
    return kitchenService.getAll(params).then((res) => {
      setHasMore({
        ...hasMore,
        kitchen: res?.meta?.current_page < res?.meta?.last_page,
      });
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
      .then((res) => {
        dispatch(
          replaceMenu({
            id: `product-${res?.data?.uuid}`,
            url: `seller/product/${res?.data?.uuid}`,
            name: t('edit.product'),
            data: {},
            refetch: false,
          }),
        );
        navigate(`/seller/product/${res?.data?.uuid}?step=1`);
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
      category_id: values?.category?.value,
      kitchen_id: values?.kitchen?.value,
      brand_id: values?.brand?.value,
      unit_id: values?.unit?.value,
      images: fileList?.length ? fileList?.map((item) => item?.name) : [],
    };

    if (isRequest) {
      productRequestUpdate({
        ...(requestData?.data || {}),
        ...(values || {}),
        ...body,
      })
        .then(() => {
          next();
          dispatch(setRefetch(activeMenu));
        })
        .finally(() => setLoadingBtn(false));
      return;
    }

    if (actionType === 'edit') {
      // START CHECKING IF MAIN INFO CHANGED
      if (!checkIsTrueValue(settings?.product_auto_approve)) {
        let isMainInfoChanged = false;

        const getTranslationField = (field, locale) =>
          data?.translations?.find(
            (translation) => translation?.locale === locale,
          )?.[field];

        languages?.forEach((language) => {
          if (
            body.title?.[language?.locale] !==
              getTranslationField('title', language?.locale) ||
            body.description?.[language?.locale] !==
              getTranslationField('description', language?.locale)
          ) {
            isMainInfoChanged = true;
          }
        });

        if (!isMainInfoChanged && data?.category?.id !== body.category_id) {
          isMainInfoChanged = true;
        }

        if (!isMainInfoChanged && data?.brand?.id !== body.brand_id) {
          isMainInfoChanged = true;
        }

        if (
          !isMainInfoChanged &&
          (data?.galleries?.length !== body?.images?.length ||
            data?.galleries?.some((gallery) =>
              body?.images?.every((image) => image !== gallery?.path),
            ))
        ) {
          isMainInfoChanged = true;
        }

        if (!isMainInfoChanged && data?.unit?.id !== body.unit_id) {
          isMainInfoChanged = true;
        }

        if (!isMainInfoChanged && data?.interval !== body.interval) {
          isMainInfoChanged = true;
        }
        if (onMainInfoChanged) {
          onMainInfoChanged({
            isMainInfoChanged,
            ...(values || {}),
            ...body,
          });
        }
        if (isMainInfoChanged) {
          setLoadingBtn(false);
          next();
          return;
        }
      }
      // END OF CHECKING IF MAIN INFO CHANGED
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
        ...(requestData?.data || {}),
      });
      return;
    }
    if (mainInfoChangedData?.isMainInfoChanged) {
      if (mainInfoChangedData?.images?.length) {
        setFileList(
          (mainInfoChangedData?.images || [])?.map((image) =>
            createImage(image),
          ),
        );
      }
      form.setFieldsValue({
        ...(mainInfoChangedData || {}),
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
        type: data?.type || null,
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
  }, [data, mainInfoChangedData, requestData, isRequest]);

  useEffect(() => {
    if (onMainInfoChanged) {
      const formValues = form.getFieldsValue();
      onMainInfoChanged({
        ...formValues,
        images: fileList?.map((item) => item?.name),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, vegetarian: true }}
      onFinish={onFinish}
    >
      <Row gutter={[20, 20]}>
        <Col span={14}>
          <Row gutter={[20, 20]}>
            <Col span={24}>
              <CustomCard title={t('basic')}>
                <Row gutter={12}>
                  <Col span={24}>
                    {languages.map((item) => (
                      <Form.Item
                        key={'title' + item.id}
                        label={t('title')}
                        name={`title[${item.locale}]`}
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
                </Row>
              </CustomCard>
            </Col>
            <Col span={24}>
              <CustomCard title={t('price.information')}>
                <Row gutter={12}>
                  <Col span={6}>
                    <Form.Item
                      label={t('min.qty')}
                      name='min_qty'
                      tooltip={t('minimum.quantity.user.can.order')}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t('max.qty')}
                      name='max_qty'
                      tooltip={t('maximum.quantity.user.can.order')}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
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
                  <Col span={6}>
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
            <Col span={24}>
              <CustomCard title={t('additional.information')}>
                <Row gutter={12} style={{ marginBottom: 14 }}>
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
          <Row gutter={[20, 20]}>
            <Col span={24}>
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
                      label={t('category')}
                      name='category'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      {type === 'single' ? (
                        <AsyncTreeSelect
                          disabled={!type}
                          refetch
                          fetchOptions={fetchCategories}
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
                          disabled={!type}
                          fetchOptions={fetchComboCategories}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('kitchen')} name='kitchen'>
                      <InfiniteSelect
                        fetchOptions={fetchKitchens}
                        hasMore={hasMore.kitchen}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('brand')} name='brand'>
                      <InfiniteSelect
                        hasMore={hasMore.brand}
                        fetchOptions={fetchBrands}
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
