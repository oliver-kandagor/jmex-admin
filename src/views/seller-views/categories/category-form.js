import { useState } from 'react';
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
import TextArea from 'antd/es/input/TextArea';
import { DebounceSelect } from 'components/search';
import MediaUpload from 'components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import categoryService from 'services/seller/category';
import getTranslationFields from 'helpers/getTranslationFields';
import { toast } from 'react-toastify';
import { removeFromMenu } from 'redux/slices/menu';
import { CustomCard } from 'components/custom-card';
import { MODELS } from '../../../constants';
import AiTranslation from '../../../components/ai-translation/ai-translation';

export default function CategoryForm({ form, handleSubmit, request = true }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { state } = useLocation();

  //state
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : [],
  );

  //functions
  const fetchCategories = (search) => {
    const params = {
      perPage: 100,
      type: state?.parentId ? 'main' : 'sub_shop',
      active: 1,
      search: search || undefined,
    };

    return categoryService.selectMyCategoryPaginate(params).then((res) =>
      res.data.map((item) => ({
        label: item?.translation?.title,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  //submit form
  const onFinish = (values) => {
    const createCategoryBody = {
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      keywords: values?.keywords?.join(','),
      parent_id: state?.parentId || values?.parent_id?.value,
      input: values?.input,
      images: image?.map((item) => item?.name),
      active: Number(values?.active),
      type: state?.parentId ? 'sub_main' : 'main',
    };
    const requestBody = {
      type: 'category',
      id: values?.id,
      data: {
        ...values,
        keywords: values?.keywords?.join(','),
        parent_id: state?.parentId || values?.parent_id?.value,
        input: values?.input,
        images: image?.map((item) => item?.name),
        active: Number(values?.active),
        type: state?.parentId ? 'sub_main' : 'main',
      },
    };
    const submitBody = request ? requestBody : createCategoryBody;
    setLoadingBtn(true);
    handleSubmit(submitBody)
      .then(() => {
        const nextUrl = state?.parentId
          ? `seller/category/${state?.parentUuid}`
          : 'seller/categories';
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`, { state: { tab: 'request' } });
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Form
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        active: true,
        ...activeMenu.data,
      }}
      form={form}
    >
      <Row gutter={[12, 20]}>
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
                  >
                    <AiTranslation
                      model={{
                        type: MODELS.Category,
                        id: activeMenu.data?.id,
                      }}
                      isTitleField
                    >
                      <Input maxLength={50} />
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
                  >
                    <AiTranslation
                      model={{
                        type: MODELS.Category,
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
          <CustomCard title={t('additional.information')}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  label={t('parent.category')}
                  name='parent_id'
                  rules={[{ required: false, message: t('required') }]}
                >
                  <DebounceSelect fetchOptions={fetchCategories} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={t('keywords')}
                  name='keywords'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <Select mode='tags' style={{ width: '100%' }}></Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name='input'
                  label={t('order.of.category')}
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    parser={(value) => parseInt(value, 10)}
                    max={9999999}
                    className='w-100'
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label={t('image')}
                  name='images'
                  rules={[
                    {
                      required: !image?.length,
                      message: t('required'),
                    },
                  ]}
                >
                  <MediaUpload
                    type='categories'
                    imageList={image}
                    setImageList={setImage}
                    form={form}
                    multiple={false}
                  />
                </Form.Item>
              </Col>
              <Col>
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
          {t('submit')}
        </Button>
      </Space>
    </Form>
  );
}
