import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, InputNumber, Row, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import productService from 'services/seller/product';
import { InfiniteSelect } from 'components/infinite-select';

const ReceptStocks = ({ next, prev }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const stocks = Form.useWatch('stocks', form);
  const shop = Form.useWatch('shop_id', form);
  const [links, setLinks] = useState(null);

  const fetchProductsStock = ({ search, page }) => {
    const params = {
      search: search || undefined,
      shop_id: shop?.value,
      page: page,
      perPage: 10,
      status: 'published',
    };
    return productService.getStock(params).then((res) => {
      setLinks(res?.links);
      return res?.data
        ?.filter(
          (stock) =>
            !stocks?.map((item) => item?.stock_id?.value)?.includes(stock?.id),
        )
        ?.map((stock) => ({
          label: `${stock?.product?.translation?.title || ''} - ${stock?.extras
            ?.map((extra) => extra?.value)
            ?.filter(Boolean)
            ?.join(', ')}`,
          value: stock.id,
        }));
    });
  };

  return (
    <>
      <Row gutter={12}>
        <Col span={24}>
          <Form.List
            name='stocks'
            initialValue={[{ stock_id: undefined, min_quantity: undefined }]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={12} align='middle'>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={t('stock')}
                        name={[name, 'stock_id']}
                        rules={[
                          {
                            required: true,
                            message: t('required'),
                          },
                        ]}
                      >
                        <InfiniteSelect
                          fetchOptions={fetchProductsStock}
                          debounceTimeout={200}
                          hasMore={links?.next}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex={1}>
                      <Form.Item
                        {...restField}
                        label={t('min.quantity')}
                        name={[name, 'min_quantity']}
                        rules={[
                          {
                            required: true,
                            message: t('required'),
                          },
                        ]}
                      >
                        <InputNumber min={1} className='w-100' />
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
                  block
                  type='dashed'
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                >
                  {t('add')}
                </Button>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={() => prev()}>{t('prev')}</Button>
        <Button
          type='primary'
          htmlType='button'
          onClick={() => {
            form
              .validateFields(
                stocks.flatMap((stock, i) => [
                  ['stocks', i, 'stock_id'],
                  ['stocks', i, 'min_quantity'],
                ]),
              )
              .then(() => {
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

export default ReceptStocks;
