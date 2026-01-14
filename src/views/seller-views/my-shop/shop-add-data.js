import { useState } from 'react';
import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  TreeSelect,
} from 'antd';
import { DebounceSelect } from 'components/search';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useSelector } from 'react-redux';
import Map from 'components/map';
import { useTranslation } from 'react-i18next';
import categoryService from 'services/seller/category';
import MediaUpload from 'components/upload';
import shopTagService from 'services/shopTag';
import { AsyncTreeSelect } from 'components/async-tree-select-category';
import { MAP_API_KEY } from 'configs/app-global';
import useGoogle from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import getAddress from 'helpers/getAddress';
import { MODELS, orderPayments } from 'constants/index';
import { FileOutlined } from '@ant-design/icons';
import { CustomCard } from 'components/custom-card';
import AiTranslation from '../../../components/ai-translation/ai-translation';

const { SHOW_ALL } = TreeSelect;

const ShopAddData = ({
  logoImage,
  setLogoImage,
  backImage,
  setBackImage,
  form,
  location,
  setLocation,
  emailStatusOptions,
}) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const categories = Form.useWatch('categories', form);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const [value, setValue] = useState('');

  const sellerDocuments = activeMenu?.data?.documents || [];

  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    useGoogle({
      apiKey: MAP_API_KEY,
      libraries: ['places', 'geocode'],
    });

  const orderPaymentOptions = orderPayments.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  const status = Form.useWatch('status', form);

  async function fetchShopCategory(search) {
    const params = { search, type: 'shop', active: 1, lang: defaultLang };
    return categoryService.selectPaginate(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
        disabled: item.children?.length === 0,
        children: item.children?.map((child) => ({
          label: child.translation?.title,
          value: child.id,
          parent: {
            label: item.translation?.title || 'no name',
            value: item.id,
          },
        })),
      })),
    );
  }

  async function fetchShopTag(search) {
    const params = { search };
    return shopTagService.getAllSeller(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
      })),
    );
  }

  const handleCategorySelect = (node) => {
    if (node.children) {
      if (categories.some((category) => category.value === node.value)) {
        const categoriesWithoutParent = categories.filter(
          (category) => category.value !== node.value,
        );
        const filteredCategories = categoriesWithoutParent.filter(
          (category) =>
            !node.children.some((child) => child.value === category.value),
        );
        form.setFieldsValue({ categories: filteredCategories });
      } else {
        form.setFieldsValue({
          categories: categories.concat([
            { label: node.label, value: node.value },
            ...node.children.map((child) => ({
              label: child.label,
              value: child.value,
            })),
          ]),
        });
      }
    } else {
      if (categories?.some((category) => category.value === node.value)) {
        form.setFieldsValue({
          categories: categories.filter(
            (category) => category.value !== node.value,
          ),
        });
      } else {
        form.setFieldsValue({
          categories: categories.concat([
            node.parent,
            { label: node.label, value: node.value },
          ]),
        });
      }
    }
  };

  const tagRender = (props) => {
    const { label, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Row gutter={12}>
      <Col span={24} className='mb-4'>
        <Row gutter={20}>
          <Col span={12}>
            <CustomCard title={t('basic')}>
              <Row gutter={12}>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'title' + idx}
                      label={t('title')}
                      name={`title[${item.locale}]`}
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
                          type: MODELS.Shop,
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
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'desc' + idx}
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
                          type: MODELS.Shop,
                          id: activeMenu.data?.id,
                        }}
                      >
                        <TextArea rows={1} maxLength={150} />
                      </AiTranslation>
                    </Form.Item>
                  ))}
                </Col>
              </Row>
            </CustomCard>
          </Col>
          <Col span={12}>
            <CustomCard title={t('shop.logo.&.cover')}>
              <Row gutter={12} style={{ marginBottom: 22 }}>
                <Col>
                  <Form.Item
                    label={`${t('logo')} (1:1)`}
                    name='logo_img'
                    rules={[
                      {
                        validator() {
                          if (logoImage?.length === 0) {
                            return Promise.reject(new Error(t('required')));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <MediaUpload
                      type='shops/logo'
                      imageList={logoImage}
                      setImageList={setLogoImage}
                      form={form}
                      multiple={false}
                      name='logo_img'
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    label={`${t('cover')} (2:1)`}
                    name='background_img'
                    rules={[
                      {
                        validator() {
                          if (backImage?.length === 0) {
                            return Promise.reject(new Error(t('required')));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <MediaUpload
                      type='shops/background'
                      imageList={backImage}
                      setImageList={setBackImage}
                      form={form}
                      multiple={false}
                      name='background_img'
                      wider
                    />
                  </Form.Item>
                </Col>
              </Row>
            </CustomCard>
          </Col>
        </Row>
      </Col>
      <Col span={24} className='mb-4'>
        <CustomCard title={t('shop.information')}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('phone')}
                name='phone'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('shop.tags')}
                name='tags'
                rules={[{ required: true, message: t('required') }]}
              >
                <DebounceSelect
                  mode='multiple'
                  fetchOptions={fetchShopTag}
                  style={{ minWidth: 150 }}
                />
              </Form.Item>
            </Col>
            <Col span={8} hidden>
              <Form.Item
                label={t('seller')}
                name='user'
                rules={[{ required: true, message: t('required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('categories')}
                name='categories'
                rules={[{ required: true, message: t('required') }]}
              >
                <AsyncTreeSelect
                  treeCheckable
                  tagRender={tagRender}
                  showCheckedStrategy={SHOW_ALL}
                  treeCheckStrictly
                  refetch
                  onSelect={(value, node) => handleCategorySelect(node)}
                  onDeselect={(value, node) => handleCategorySelect(node)}
                  fetchOptions={fetchShopCategory}
                />
              </Form.Item>
            </Col>
            {Boolean(sellerDocuments?.length) && (
              <Col span={24}>
                <Form.Item label={t('uploaded.documents.for.verification')}>
                  <Space gap='4px 0' wrap>
                    {sellerDocuments?.map((item) => (
                      <a
                        href={item?.path}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Tag icon={<FileOutlined />}>{item?.title}</Tag>
                      </a>
                    ))}
                  </Space>
                </Form.Item>
              </Col>
            )}
            {status === 'rejected' && (
              <Col span={24}>
                <Form.Item label={t('status.note')} name='status_note'>
                  <TextArea rows={1} maxLength={100} />
                </Form.Item>
              </Col>
            )}
            <Col span={6}>
              <Form.Item name='status' label={t('status')}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('status.note')} name='status_note'>
                <TextArea rows={1} />
              </Form.Item>
            </Col>
          </Row>
        </CustomCard>
      </Col>
      <Col span={24} className='mb-4'>
        <Row gutter={20}>
          <Col span={24} className='mb-4'>
            <CustomCard title={t('order.information')}>
              <Row gutter={12}>
                <Col span={6}>
                  <Form.Item
                    label={t('tax')}
                    name='tax'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} addonAfter={'%'} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={t('admin.comission')}
                    name='percentage'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber
                      disabled
                      min={0}
                      max={100}
                      className='w-100'
                      addonAfter={'%'}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={t('min.amount')}
                    name='min_amount'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name='emailStatuses'
                    label={t('order.statuses.for.email.notifications')}
                  >
                    <Select mode='multiple' options={emailStatusOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </CustomCard>
          </Col>
          <Col span={12}>
            <CustomCard title={t('delivery.information')}>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name='delivery_time_type'
                    label={t('delivery_time_type')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <Select
                      className='w-100'
                      options={[
                        {
                          label: t('minute'),
                          value: 'minute',
                          key: 'minute',
                        },
                        {
                          label: t('hour'),
                          value: 'hour',
                          key: 'hour',
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='delivery_time_from'
                    label={t('delivery_time_from')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='delivery_time_to'
                    label={t('delivery_time_to')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='price'
                    label={t('min.price')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='price_per_km'
                    label={t('price.per.km')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </CustomCard>
          </Col>
          <Col span={12}>
            <CustomCard title={t('qr.menu.information')}>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name='wifi_name' label={t('shop.wifi.name')}>
                    <Input className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='wifi_password'
                    label={t('shop.wifi.password')}
                  >
                    <Input className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('order.payment')}
                    name='order_payment'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <Select options={orderPaymentOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='new_order_after_payment'
                    label={t('new.order.after.payment')}
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
      <Col span={24} className='mb-4'>
        <CustomCard title={t('address.information')}>
          <Row gutter={12}>
            <Col span={24}>
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
                <Select
                  allowClear
                  searchValue={value}
                  showSearch
                  autoClearSearchValue
                  loading={isPlacePredictionsLoading}
                  options={placePredictions?.map((prediction) => ({
                    label: prediction.description,
                    value: prediction.description,
                  }))}
                  onSearch={(searchValue) => {
                    setValue(searchValue);
                    if (searchValue.length > 0) {
                      getPlacePredictions({ input: searchValue });
                    }
                  }}
                  onSelect={async (value) => {
                    const address = await getAddress(value);
                    setLocation({
                      lat: address?.geometry?.location?.lat,
                      lng: address?.geometry?.location?.lng,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Map
                location={location}
                setLocation={setLocation}
                setAddress={(value) => form.setFieldsValue({ address: value })}
              />
            </Col>
          </Row>
        </CustomCard>
      </Col>
    </Row>
  );
};

export default ShopAddData;
