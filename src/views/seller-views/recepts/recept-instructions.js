import { Button, Col, Divider, Form, Row, Space } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTranslation } from 'react-i18next';

const ReceptInstructions = ({ next, prev }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  return (
    <>
      <Row gutter={12}>
        <Col span={24}>
          {languages?.map((item) => (
            <Form.Item
              label={t('instructions')}
              name={['instruction', item?.locale]}
              valuePropName='data'
              getValueFromEvent={(event, editor) => editor.getData()}
              rules={[
                {
                  required: item?.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item?.locale !== defaultLang}
            >
              <CKEditor editor={ClassicEditor} />
            </Form.Item>
          ))}
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={() => prev()}>{t('prev')}</Button>
        <Button
          type='primary'
          htmlType='button'
          onClick={() => {
            form.validateFields([['instruction', defaultLang]]).then(() => {
              next();
            });
          }}
        >
          {t('next')}
        </Button>
      </Space>
    </>
  );
};

export default ReceptInstructions;
