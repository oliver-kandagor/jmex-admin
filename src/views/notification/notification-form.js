import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import CkeEditor from 'components/ckeEditor';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { MODELS } from '../../constants';
import AiTranslation from '../../components/ai-translation/ai-translation';

export default function NotificationForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{
        active: true,
        ...activeMenu.data,
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'title' + item.locale}
              label={t('title')}
              name={`title[${item.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 2) {
                      return Promise.reject(new Error(t('must.be.at.least.2')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <AiTranslation
                model={{
                  type: MODELS.Notification,
                  id: activeMenu.data?.id,
                }}
                isTitleField
                fieldsMap={{
                  title: 'title',
                  description: 'short_desc',
                  short_desc: 'description',
                }}
              >
                <Input />
              </AiTranslation>
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          {languages.map((item) => (
            <Form.Item
              key={'short_desc' + item.locale}
              label={t('short.description')}
              name={`short_desc[${item.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 5) {
                      return Promise.reject(new Error(t('must.be.at.least.5')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <AiTranslation
                model={{
                  type: MODELS.Notification,
                  id: activeMenu.data?.id,
                }}
                fieldsMap={{
                  title: 'title',
                  description: 'short_desc',
                  short_desc: 'description',
                }}
              >
                <Input />
              </AiTranslation>
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          <CkeEditor form={form} languages={languages} lang={defaultLang} />
        </Col>
      </Row>
      <Space>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Space>
    </Form>
  );
}
