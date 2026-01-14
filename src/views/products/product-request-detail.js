import { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Space,
  Spin,
  Alert,
  Typography,
  Collapse,
  Table,
  Divider,
} from 'antd';
import { removeFromMenu } from 'redux/slices/menu';
import requestAdminModelsService from 'services/request-models';
import ColumnImage from 'components/column-image';
import numberToPrice from 'helpers/numberToPrice';
import ProductRequestModal from './product-request-modal';

const { Text } = Typography;

const ProductRequestDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { id } = useParams();
  const { activeMenu } = useSelector((state) => state.menu);
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [isButtonLoading, setButtonLoading] = useState(false);
  const [data, setData] = useState({});
  const [model, setModel] = useState({});
  const [statusNote, setStatusNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
          {model?.unit?.position === 'before' &&
            model?.unit?.translation?.title}{' '}
          {quantity || 0}{' '}
          {model?.unit?.position === 'after' && model?.unit?.translation?.title}
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
      render: () => `${model?.tax || 0}%`,
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
          {model?.unit?.position === 'before' &&
            model?.unit?.translation?.title}{' '}
          {quantity || 0}{' '}
          {model?.unit?.position === 'after' && model?.unit?.translation?.title}
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
      render: () => `${model?.tax || 0}%`,
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (totalPrice) => numberToPrice(totalPrice),
    },
  ];

  const fetchProductRequest = () => {
    setLoading(true);
    requestAdminModelsService
      .getById(id)
      .then((res) => {
        setData(res?.data?.data);
        setModel(res?.data?.model);
        setStatusNote(res.data?.status_note);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleStatusUpdate = (params) => {
    setButtonLoading(true);

    const nextUrl = 'catalog/products';

    requestAdminModelsService
      .changeStatus(id, params)
      .then(() => {
        navigate(`/${nextUrl}`, { state: { tab: 'request' } });
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        toast.success(t('successfully.changed'));
      })
      .finally(() => {
        setModalVisible(false);
        setButtonLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchProductRequest();
    }
    // eslint-disable-next-line
  }, [id]);

  const changedInfo = data;
  const originalInfo = model;

  return !loading ? (
    <>
      <Card>
        <Descriptions bordered title={t('changed.info')}>
          <Descriptions.Item label={`${t('title')} (${defaultLang})`} span={3}>
            <Text
              type={
                changedInfo?.[`title[${defaultLang}]`] !==
                originalInfo?.translation?.title
                  ? 'danger'
                  : undefined
              }
            >
              {changedInfo?.[`title[${defaultLang}]`]}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={`${t('description')} (${defaultLang})`}
            span={3}
          >
            <Text
              type={
                changedInfo?.[`description[${defaultLang}]`] !==
                originalInfo?.translation?.description
                  ? 'danger'
                  : undefined
              }
            >
              {changedInfo?.[`description[${defaultLang}]`]}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('shop')} span={1.5}>
            <Text>{originalInfo?.shop?.translation?.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('category')} span={1.5}>
            <Text
              type={
                changedInfo?.category?.value !== originalInfo?.category?.id
                  ? 'danger'
                  : undefined
              }
            >
              {changedInfo?.category?.label}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('brand')} span={1.5}>
            {changedInfo?.brand?.label || t('N/A')}
          </Descriptions.Item>
          <Descriptions.Item label={t('unit')} span={1.5}>
            {changedInfo?.unit?.label || t('N/A')}
          </Descriptions.Item>
          <Descriptions.Item label={t('images')} span={3}>
            <Row gutter={12}>
              {changedInfo?.images?.map((item) => (
                <Col key={item}>
                  <ColumnImage width={80} image={item} />
                </Col>
              ))}
            </Row>
          </Descriptions.Item>
          <Descriptions.Item label={t('tax')}>
            {changedInfo?.tax || 0}%
          </Descriptions.Item>
          <Descriptions.Item label={t('min.quantity')}>
            {changedInfo?.min_qty}
          </Descriptions.Item>
          <Descriptions.Item label={t('max.quantity')}>
            {changedInfo?.max_qty}
          </Descriptions.Item>
        </Descriptions>

        <Collapse className='mt-4'>
          <Collapse.Panel key='stocks' header={t('stocks')}>
            <Table
              scroll={{ x: true }}
              dataSource={data?.stocks || []}
              pagination={false}
              columns={requestStockColumns}
            />
          </Collapse.Panel>
        </Collapse>

        <Divider />

        <Descriptions bordered className='mt-4' title={t('original.info')}>
          <Descriptions.Item
            label={`${t('title')} (${defaultLang})`}
            span={3}
            column={3}
          >
            {originalInfo?.translation?.title}
          </Descriptions.Item>
          <Descriptions.Item
            label={`${t('description')} (${defaultLang})`}
            span={3}
            column={3}
          >
            {originalInfo?.translation?.description}
          </Descriptions.Item>
          <Descriptions.Item label={t('shop')} span={1.5} column={1.5}>
            {originalInfo?.shop?.translation?.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('category')} span={1.5} column={1.5}>
            {originalInfo?.category?.translation?.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('brand')} span={1.5} column={1.5}>
            {originalInfo?.brand?.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('unit')} span={1.5} column={1.5}>
            {originalInfo?.unit?.translation?.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('images')} span={3} column={3}>
            <Row gutter={12}>
              {originalInfo?.galleries?.map((item, idx) => (
                <Col key={'image' + idx}>
                  <ColumnImage width={80} image={item?.path} />
                </Col>
              ))}
            </Row>
          </Descriptions.Item>
          <Descriptions.Item span={3} column={3} label={t('tax')}>
            {originalInfo?.tax || 0}%
          </Descriptions.Item>
          <Descriptions.Item span={3} column={3} label={t('min.quantity')}>
            {originalInfo?.min_qty}
          </Descriptions.Item>
          <Descriptions.Item span={3} column={3} label={t('max.quantity')}>
            {originalInfo?.max_qty}
          </Descriptions.Item>
        </Descriptions>
        <Collapse className='mt-4'>
          <Collapse.Panel key='stocks' header={t('stocks')}>
            <Table
              scroll={{ x: true }}
              dataSource={model?.stocks || []}
              pagination={false}
              columns={stockColumns}
            />
          </Collapse.Panel>
        </Collapse>

        {statusNote && (
          <Alert
            className='mt-4'
            message={t('status.note')}
            description={statusNote}
            type='error'
          />
        )}

        <div className='d-flex justify-content-end mt-4'>
          <Space>
            <Button
              type='primary'
              danger
              onClick={() => {
                setModalVisible(true);
              }}
            >
              {t('decline')}
            </Button>
            <Button
              type='primary'
              loading={isButtonLoading}
              onClick={() => {
                handleStatusUpdate({ status: 'approved' });
              }}
            >
              {t('accept')}
            </Button>
          </Space>
        </div>
      </Card>

      <ProductRequestModal
        data={{ title: 'decline' }}
        visible={modalVisible}
        handleCancel={() => setModalVisible(false)}
        handleOk={handleStatusUpdate}
        laoding={isButtonLoading}
      />
    </>
  ) : (
    <div className='d-flex justify-content-center align-items-center'>
      <Spin size='large' className='py-5' />
    </div>
  );
};

export default ProductRequestDetail;
