import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import installationService from '../../services/installation';

export default function License({ next }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // Skip licence check if both fields are empty
    if (!values.purchase_id && !values.purchase_code) {
      next();
      return;
    }

    setLoading(true);
    installationService
      .checkLicence(values)
      .then(() => next())
      .finally(() => setLoading(false));
  };

  return (
    <Card
      title="Licence"
      extra={<p>You can skip this step if you do not have a licence</p>}
      className="w-100"
    >
      <Form form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Purchase ID"
              name="purchase_id"
              dependencies={['purchase_code']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const code = getFieldValue('purchase_code');
                    if (!value && code) {
                      return Promise.reject(
                        new Error('Purchase ID is required if purchase code is provided')
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Purchase code"
              name="purchase_code"
              dependencies={['purchase_id']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const id = getFieldValue('purchase_id');
                    if (!value && id) {
                      return Promise.reject(
                        new Error('Purchase code is required if purchase ID is provided')
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Button
          type="primary"
          htmlType="submit"
          className="mt-4"
          loading={loading}
        >
          Continue
        </Button>
      </Form>
    </Card>
  );
}
