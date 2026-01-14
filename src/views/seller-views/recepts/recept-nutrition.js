import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

const ReceptNutrition = ({ prev, loading }) => {
  const { t } = useTranslation();

  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  return (
    <>
      <Row gutter={12}>
        <Col span={24}>
          <Form.List
            name='nutrition'
            initialValue={[
              {
                weight: undefined,
                percentage: undefined,
                en: undefined,
                ru: undefined,
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, i) => (
                  <Row gutter={12} align='middle'>
                    <Col flex={1}>
                      {languages.map((item) => (
                        <Form.Item
                          key={'title' + item?.locale}
                          label={t('title')}
                          name={[name, item?.locale]}
                          rules={[
                            {
                              required: item?.locale === defaultLang,
                              message: t('required'),
                            },
                          ]}
                          hidden={item?.locale !== defaultLang}
                        >
                          <Input />
                        </Form.Item>
                      ))}
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        label={t('weight')}
                        name={[name, 'weight']}
                        rules={[
                          {
                            required: true,
                            message: t('required'),
                          },
                          {
                            type: 'number',
                            min: 0,
                            message: t('min.0'),
                          },
                        ]}
                      >
                        <InputNumber enterButton className='w-100' max={191} />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        label={t('percentage')}
                        name={[name, 'percentage']}
                        rules={[
                          {
                            required: true,
                            message: t('required'),
                          },
                          {
                            type: 'number',
                            min: 0,
                            message: t('min.0'),
                          },
                        ]}
                      >
                        <InputNumber
                          addonAfter={'%'}
                          className='w-100'
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    {fields?.length !== 1 && (
                      <Col>
                        <Form.Item label=' '>
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                ))}
                <Button
                  type='dashed'
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                >
                  {t('add.nutrition')}
                </Button>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button htmlType='button' onClick={() => prev()}>
          {t('prev')}
        </Button>
        <Button type='primary' htmlType='submit' loading={loading}>
          {t('submit')}
        </Button>
      </Space>
    </>
  );
};

export default ReceptNutrition;
