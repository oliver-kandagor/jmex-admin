import { Form, Input, InputNumber, Select, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from 'components/search';
import { shallowEqual, useSelector } from 'react-redux';
import productService from 'services/product';

export const ProductStockTable = ({ data, fields, onRemoveStock }) => {
  const { t } = useTranslation();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  console.log('fields:', fields);

  const fetchAddons = async (search) => {
    const params = {
      search: search || undefined,
      page: 1,
      perPage: 20,
      'statuses[0]': 'published',
      'statuses[1]': 'pending',
      addon: 1,
      shop_id: activeMenu?.data?.shop_id,
    };
    const addons =
      productService.getAll(params).then((res) =>
        res?.data?.map((item) => ({
          label: item?.translation?.title,
          value: item?.id,
        })),
      ) || [];

    return addons?.length
      ? [{ label: t('all.addons'), value: 'all', key: 'all' }, ...addons]
      : [];
  };

  const columns = [
    {
      title: t('extra.values'),
      dataIndex: 'name',
      key: 'extra-values',
      render: (name) => {
        return (
          <Form.Item name={['stocks', name, 'extras']} className='mb-0'>
            {/*{({ getFieldValue, getFieldsValue }) => {
                console.log(getFieldsValue());
                return (
                  <React.Fragment>
                    {editingIndex === index ? (
                      <Input
                        placeholder="age"
                        style={{ width: "30%", marginRight: 8 }}
                      />
                    ) : (
                      getFieldValue(["users", index, "age"])
                    )}
                  </React.Fragment>
                );
              }}*/}
            {({ getFieldValue, getFieldsValue }) => {
              return <Select labelInValue mode='multiple' />;
            }}
            {/*<Select labelInValue mode='multiple' />*/}
          </Form.Item>
        );
        // return <span style={{ display: 'block', width: '200px' }}>
        //   {extras
        //     ?.map((extra) => extra?.label)
        //     ?.filter(Boolean)
        //     ?.join(' - ')}
        // </span>;
      },
    },
    // {
    //   title: t('addons'),
    //   dataIndex: 'name',
    //   key: 'addons',
    //   render: (name, row, index) => {
    //     console.log('name => ', name);
    //     return (
    //       <Form.Item className='mb-0' name={['stocks', index, 'addons']}>
    //         <DebounceSelect
    //           allowClear
    //           mode='multiple'
    //           style={{ width: '300px' }}
    //           fetchOptions={fetchAddons}
    //         />
    //       </Form.Item>
    //     );
    //   },
    // },
    // {
    //   title: t('sku'),
    //   dataIndex: 'sku',
    //   key: 'sku',
    //   render: (sku, row, index) => (
    //     <Form.Item className='mb-0' name={['stocks', index, 'sku']}>
    //       <Input style={{ width: '200px' }} />
    //     </Form.Item>
    //   ),
    // },
    // {
    //   title: t('quantity'),
    //   dataIndex: 'quantity',
    //   key: 'quantity',
    //   render: (quantity, row, index) => (
    //     <Form.Item
    //       className='mb-0'
    //       name={['stocks', index, 'quantity']}
    //       rules={[{ required: true, message: t('required') }]}
    //     >
    //       <InputNumber style={{ width: '200px' }} />
    //     </Form.Item>
    //   ),
    // },
    // {
    //   title: t('price'),
    //   dataIndex: 'price',
    //   key: 'price',
    //   render: (price, row, index) => (
    //     <Form.Item
    //       className='mb-0'
    //       name={['stocks', index, 'price']}
    //       rules={[{ required: true, message: t('required') }]}
    //     >
    //       <InputNumber
    //         style={{ width: '200px' }}
    //         addonBefore={
    //           defaultCurrency?.position === 'before' && defaultCurrency?.symbol
    //         }
    //         addonAfter={
    //           defaultCurrency?.position === 'after' && defaultCurrency?.symbol
    //         }
    //       />
    //     </Form.Item>
    //   ),
    // },
    // {
    //   title: t('tax'),
    //   dataIndex: 'tax',
    //   key: 'tax',
    //   render: (tax, row, index) => (
    //     <Form.Item className='mb-0' name={['stocks', index, 'tax']}>
    //       <InputNumber disabled style={{ width: '200px' }} />
    //     </Form.Item>
    //   ),
    // },
    // {
    //   title: t('total.price'),
    //   dataIndex: 'total_price',
    //   key: 'total-price',
    //   render: (price, row, index) => (
    //     <Form.Item
    //       noStyle
    //       className='mb-0'
    //       shouldUpdate={(prevValues, nextValues) =>
    //         prevValues?.stocks?.[index]?.price !==
    //         nextValues?.stocks?.[index]?.price
    //       }
    //     >
    //       {({ getFieldValue }) => {
    //         const tax = getFieldValue(['stocks', index, 'tax']) || 0;
    //         const price = getFieldValue(['stocks', index, 'price']);
    //         const totalPrice = tax === 0 ? price : (price * tax) / 100 + price;
    //         return (
    //           <Form.Item className='mb-0'>
    //             <InputNumber
    //               min={1}
    //               disabled
    //               value={totalPrice}
    //               style={{ width: '200px' }}
    //               addonBefore={
    //                 defaultCurrency?.position === 'before' &&
    //                 defaultCurrency?.symbol
    //               }
    //               addonAfter={
    //                 defaultCurrency?.position === 'after' &&
    //                 defaultCurrency?.symbol
    //               }
    //             />
    //           </Form.Item>
    //         );
    //       }}
    //     </Form.Item>
    //   ),
    // },
  ];

  return (
    <Table
      bordered
      scroll={{ x: true }}
      pagination={false}
      dataSource={fields || []}
      columns={columns}
      rowKey='key'
    />
  );
};
