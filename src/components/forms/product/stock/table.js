import { useTranslation } from 'react-i18next';
import { Form, Input, InputNumber, Table } from 'antd';
import { DebounceSelect } from 'components/search';
import { shallowEqual, useSelector } from 'react-redux';

export const ProductStockTable = ({ data, fields, onFetchAddons }) => {
  const { t } = useTranslation();

  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  const columns = [
    {
      title: t('extra.values'),
      dataIndex: 'name',
      key: 'name',
      render: (_, row, index) => (
        <Form.Item
          noStyle
          shouldUpdate={(prev, next) =>
            prev?.stocks?.[index]?.extras !== next?.stocks?.[index]?.extras
          }
        >
          {({ getFieldValue }) => (
            <Form.Item className='mb-0' style={{ width: '200px' }}>
              {getFieldValue(['stocks', index, 'extras'])
                ?.map((extra) => extra?.label)
                ?.filter(Boolean)
                ?.join(' - ') || t('no.extra.selected')}
            </Form.Item>
          )}
        </Form.Item>
      ),
    },
    {
      title: t('addons'),
      dataIndex: 'name',
      key: 'name',
      render: (_, row, index) => (
        <Form.Item className='mb-0' name={[index, 'addons']}>
          <DebounceSelect
            allowClear
            mode='multiple'
            style={{ width: '300px' }}
            fetchOptions={onFetchAddons}
          />
        </Form.Item>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, row, index) => (
        <Form.Item
          className='mb-0'
          name={[index, 'quantity']}
          rules={[{ required: true, message: t('required') }]}
        >
          <InputNumber
            style={{ width: '100px' }}
            // addonBefore={
            //   data?.unit?.position === 'before' &&
            //   (data?.unit?.translation?.title || '')
            // }
            // addonAfter={
            //   data?.unit?.position === 'after' &&
            //   (data?.unit?.translation?.title || '')
            // }
          />
        </Form.Item>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (_, row, index) => (
        <Form.Item className='mb-0' name={[index, 'price']}>
          <InputNumber
            style={{ width: '200px' }}
            addonBefore={
              defaultCurrency?.position === 'before' && defaultCurrency?.symbol
            }
            addonAfter={
              defaultCurrency?.position === 'after' && defaultCurrency?.symbol
            }
          />
        </Form.Item>
      ),
    },
    {
      title: t('sku'),
      dataIndex: 'name',
      key: 'name',
      render: (_, row, index) => (
        <Form.Item className='mb-0' name={[index, 'sku']}>
          <Input style={{ width: '100px' }} />
        </Form.Item>
      ),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (_, row, index) => (
        <Form.Item className='mb-0' name={[index, 'tax']}>
          <InputNumber disabled addonAfter='%' style={{ width: '100px' }} />
        </Form.Item>
      ),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total-price',
      render: (price, row, index) => (
        <Form.Item
          noStyle
          className='mb-0'
          shouldUpdate={(prevValues, nextValues) =>
            prevValues?.stocks?.[index]?.price !==
            nextValues?.stocks?.[index]?.price
          }
        >
          {({ getFieldValue }) => {
            const tax = getFieldValue(['stocks', index, 'tax']) || 0;
            const price = getFieldValue(['stocks', index, 'price']);
            const totalPrice = tax === 0 ? price : (price * tax) / 100 + price;
            return (
              <Form.Item className='mb-0'>
                <InputNumber
                  min={1}
                  disabled
                  value={totalPrice}
                  style={{ width: '200px' }}
                  addonBefore={
                    defaultCurrency?.position === 'before' &&
                    defaultCurrency?.symbol
                  }
                  addonAfter={
                    defaultCurrency?.position === 'after' &&
                    defaultCurrency?.symbol
                  }
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      ),
    },
  ];

  return (
    <Table
      bordered
      dataSource={fields}
      pagination={false}
      scroll={{ x: true }}
      columns={columns}
    />
  );
};
