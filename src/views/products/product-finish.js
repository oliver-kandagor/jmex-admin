import {
  Button,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Row,
  Space,
  Table,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromMenu } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import ColumnImage from 'components/column-image';
import numberToPrice from 'helpers/numberToPrice';
import { toast } from 'react-toastify';

const ProductFinish = ({ data, requestData, prev, isRequest }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);

  const finish = () => {
    const nextUrl = 'catalog/products';
    if (isRequest) {
      navigate(`/${nextUrl}`, { state: { tab: 'request' } });
      toast.success(t('successfully.updated'));
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      return;
    }
    navigate(`/${nextUrl}`);
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
  };

  const stockColumns = [
    // {
    //   title: t('id'),
    //   dataIndex: 'id',
    //   key: 'id',
    // },
    {
      title: t('extras'),
      dataIndex: 'extras',
      key: 'extras',
      render: (extras) => extras?.map((extra) => extra?.value)?.join(' - '),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <span>
          {data?.unit?.position === 'before' && data?.unit?.translation?.title}{' '}
          {quantity || 0}{' '}
          {data?.unit?.position === 'after' && data?.unit?.translation?.title}
        </span>
      ),
    },
    {
      title: t('sku'),
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => sku || t('N/A'),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: () => `${data?.tax || 0}%`,
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (totalPrice) => numberToPrice(totalPrice),
    },
  ];

  const requestStockColumns = [
    // {
    //   title: t('id'),
    //   dataIndex: 'id',
    //   key: 'id',
    // },
    {
      title: t('extras'),
      dataIndex: 'extras',
      key: 'extras',
      render: (extras) => extras?.map((extra) => extra?.label)?.join(' - '),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <span>
          {data?.unit?.position === 'before' && data?.unit?.translation?.title}{' '}
          {quantity || 0}{' '}
          {data?.unit?.position === 'after' && data?.unit?.translation?.title}
        </span>
      ),
    },
    {
      title: t('sku'),
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => sku || t('N/A'),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: () => `${data?.tax || 0}%`,
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (totalPrice) => numberToPrice(totalPrice),
    },
  ];

  const getTranslationField = (field) =>
    data?.translations?.find(
      (translation) => translation?.locale === defaultLang,
    )?.[field] || t('N/A');

  const productInfo = requestData?.data;

  return (
    <>
      {isRequest && (
        <>
          <Descriptions bordered title={t('changed.info')}>
            <Descriptions.Item
              label={`${t('title')} (${defaultLang})`}
              span={3}
            >
              {productInfo?.[`title[${defaultLang}]`]}
            </Descriptions.Item>
            <Descriptions.Item
              label={`${t('description')} (${defaultLang})`}
              span={3}
            >
              {productInfo?.[`description[${defaultLang}]`]}
            </Descriptions.Item>
            <Descriptions.Item label={t('shop')} span={1.5} column={1.5}>
              {data?.shop?.translation?.title || t('N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t('category')} span={1.5} column={1.5}>
              {productInfo?.category?.label || t('N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t('kitchen')} span={1} column={1}>
              {productInfo?.kitchen?.label || t('N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t('brand')} span={1} column={1}>
              {productInfo?.brand?.label || t('N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t('unit')} span={1} column={1}>
              {productInfo?.unit?.label || t('N/A')}
            </Descriptions.Item>
            <Descriptions.Item label={t('media')} span={3} column={3}>
              <Row gutter={12}>
                {productInfo?.images?.map((image) => (
                  <Col key={image}>
                    <ColumnImage size={80} image={image} />
                  </Col>
                ))}
              </Row>
            </Descriptions.Item>
            <Descriptions.Item label={t('tax')}>
              {productInfo?.tax || 0}%
            </Descriptions.Item>
            <Descriptions.Item label={t('min.quantity')}>
              {productInfo?.min_qty || 0}
            </Descriptions.Item>
            <Descriptions.Item label={t('max.quantity')}>
              {productInfo?.max_qty || 0}
            </Descriptions.Item>
          </Descriptions>
          <Collapse className='mt-4'>
            <Collapse.Panel key='stocks' header={t('stocks')}>
              <Table
                scroll={{ x: true }}
                dataSource={productInfo?.stocks || []}
                pagination={false}
                columns={requestStockColumns}
              />
            </Collapse.Panel>
          </Collapse>
          <Divider />
        </>
      )}
      <Descriptions bordered className='mt-4' title={t('original.info')}>
        <Descriptions.Item
          label={`${t('title')} (${defaultLang})`}
          span={3}
          column={3}
        >
          {getTranslationField('title')}
        </Descriptions.Item>
        <Descriptions.Item
          label={`${t('description')} (${defaultLang})`}
          span={3}
          column={3}
        >
          {getTranslationField('description')}
        </Descriptions.Item>
        <Descriptions.Item label={t('shop')} span={1.5} column={1.5}>
          {data?.shop?.translation?.title || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('category')} span={1.5} column={1.5}>
          {data?.category?.translation?.title || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('kitchen')} span={1} column={1}>
          {data?.kitchen?.translation?.title || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('brand')} span={1} column={1}>
          {data?.brand?.title || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('unit')} span={1} column={1}>
          {data?.unit?.translation?.title || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('media')} span={3} column={3}>
          <Row gutter={12}>
            {data?.galleries?.map((gallery) => (
              <Col key={gallery?.id}>
                <ColumnImage size={80} image={gallery?.path} />
              </Col>
            ))}
          </Row>
        </Descriptions.Item>
        <Descriptions.Item span={3} column={3} label={t('tax')}>
          {data?.tax || 0}%
        </Descriptions.Item>
        <Descriptions.Item span={3} column={3} label={t('interval')}>
          {data?.interval || 1}
        </Descriptions.Item>
        <Descriptions.Item span={3} column={3} label={t('min.quantity')}>
          {data?.min_qty || 0}
        </Descriptions.Item>
        <Descriptions.Item span={3} column={3} label={t('max.quantity')}>
          {data?.max_qty || 0}
        </Descriptions.Item>
      </Descriptions>
      <Collapse className='mt-4'>
        <Collapse.Panel key='stocks' header={t('stocks')}>
          <Table
            scroll={{ x: true }}
            dataSource={data?.stocks || []}
            pagination={false}
            columns={stockColumns}
          />
        </Collapse.Panel>
      </Collapse>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={prev}>{t('prev')}</Button>
        <Button type='primary' onClick={finish}>
          {t('finish')}
        </Button>
      </Space>
    </>
  );
};

export default ProductFinish;
