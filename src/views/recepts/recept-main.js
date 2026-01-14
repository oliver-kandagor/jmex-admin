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
} from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MediaUpload from 'components/upload';
import shopService from 'services/restaurant';
import { DebounceSelect } from 'components/search';
import categoryService from 'services/category';
import { CustomCard } from 'components/custom-card';
import { MODELS } from '../../constants';
import AiTranslation from '../../components/ai-translation/ai-translation';

const { TextArea } = Input;

const ReceptMain = ({ next, image, setImage, back, setBack }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const fetchCategory = (search) => {
    const params = {
      active: 1,
      type: 'receipt',
      search: search || undefined,
    };
    return categoryService.getAll(params).then((res) => {
      return res.data.map((category) => ({
        label: category?.translation?.title || t('N/A'),
        value: category?.id,
        key: category?.id,
      }));
    });
  };

  const fetchShops = (search) => {
    const params = { search: search || undefined, status: 'approved' };
    return shopService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item?.translation?.title,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  console.log('activeMenu21', activeMenu);

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col span={16}>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <CustomCard title={t('basic')}>
                <Row gutter={12}>
                  <Col span={24}>
                    {languages?.map((item) => (
                      <Form.Item
                        key={'title' + item?.locale}
                        label={t('title')}
                        name={`title[${item?.locale}]`}
                        rules={[
                          {
                            required: item?.locale === defaultLang,
                            message: t('required'),
                          },
                        ]}
                        hidden={item?.locale !== defaultLang}
                      >
                        <AiTranslation
                          model={{
                            type: MODELS.Receipt,
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
                        key={'description' + item?.locale}
                        label={t('description')}
                        name={`description[${item?.locale}]`}
                        rules={[
                          {
                            required: item?.locale === defaultLang,
                            message: t('required'),
                          },
                        ]}
                        hidden={item?.locale !== defaultLang}
                      >
                        <AiTranslation
                          model={{
                            type: MODELS.Receipt,
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
              <CustomCard title={t('nutrition.&.time')}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      key='calories'
                      label={t('calories')}
                      name='calories'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber className='w-100' min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      key='servings'
                      label={t('servings')}
                      name='servings'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber className='w-100' min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      key='active_time'
                      label={t('active.time')}
                      name='active_time'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber className='w-100' min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      key='total_time'
                      label={t('total.time')}
                      name='total_time'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <InputNumber className='w-100' min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <CustomCard title={t('shop.&.category')}>
                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Item
                      label={t('shop')}
                      name='shop_id'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <DebounceSelect fetchOptions={fetchShops} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      key='category_id'
                      label={t('category')}
                      name='category_id'
                      rules={[
                        {
                          required: true,
                          message: t('required'),
                        },
                      ]}
                    >
                      <DebounceSelect fetchOptions={fetchCategory} />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>
            <Col span={24}>
              <CustomCard title={t('discount')}>
                <Col span={24}>
                  <Form.Item
                    label={t('discount.type')}
                    name='discount_type'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <Select
                      options={[
                        { label: t('fix'), value: 'fix' },
                        { label: t('percent'), value: 'percent' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('discount.price')}
                    name='discount_price'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber className='w-100' min={0} />
                  </Form.Item>
                </Col>
              </CustomCard>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <CustomCard title={t('media')}>
            <Row gutter={12}>
              <Col>
                <Form.Item
                  label={t('background')}
                  name='back_img'
                  rules={[{ required: !back?.length, message: t('required') }]}
                >
                  <MediaUpload
                    type='receipts'
                    imageList={back}
                    setImageList={setBack}
                    form={form}
                    multiple={false}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label={t('image')}
                  name='image'
                  rules={[
                    {
                      required: !image?.length,
                      message: t('required'),
                    },
                  ]}
                >
                  <MediaUpload
                    type='receipts'
                    imageList={image}
                    setImageList={setImage}
                    form={form}
                    multiple={false}
                  />
                </Form.Item>
              </Col>
            </Row>
          </CustomCard>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button
          type='primary'
          htmlType='button'
          onClick={() => {
            form
              .validateFields([
                ['title', defaultLang],
                ['description', defaultLang],
                'calories',
                'servings',
                'active_time',
                'total_time',
                'discount_type',
                'discount_price',
                'category_id',
                'shop_id',
                'back_img',
                'image',
              ])
              .then(next);
          }}
        >
          {t('next')}
        </Button>
      </Space>
    </>
  );
};

export default ReceptMain;
