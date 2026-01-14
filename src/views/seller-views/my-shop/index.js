import { useEffect, useState } from 'react';
import { Button, Card, Col, Descriptions, Row, Spin, Switch } from 'antd';
import shopService from 'services/seller/shop';
import { EditOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchMyShop } from 'redux/slices/myShop';
import numberToPrice from 'helpers/numberToPrice';
import useDidUpdate from 'helpers/useDidUpdate';
import ColumnImage from 'components/column-image';

export default function MyShop() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop: data, loading } = useSelector(
    (state) => state.myShop,
    shallowEqual,
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { user } = useSelector((state) => state.auth, shallowEqual);

  const [statusLoading, setStatusLoading] = useState(false);

  const goToEdit = () => {
    dispatch(
      addMenu({
        data: data.uuid,
        id: 'edit-shop',
        url: `my-shop/edit`,
        name: t('edit.shop'),
      }),
    );
    navigate(`/my-shop/edit`);
  };

  const workingStatusChange = () => {
    setStatusLoading(true);
    shopService
      .setWorkingStatus()
      .then(() => {
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setStatusLoading(false);
      });
  };

  const fetch = () => {
    dispatch(fetchMyShop({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('my.shop')}
      extra={
        user?.role !== 'seller' ? null : (
          <Button type='primary' icon={<EditOutlined />} onClick={goToEdit}>
            {t('shop.edit')}
          </Button>
        )
      }
    >
      {!loading ? (
        <Row gutter={12}>
          <Col span={24}>
            <div className='position-relative'>
              <Descriptions bordered>
                <Descriptions.Item label={t('shop.name')} span={2}>
                  {data.translation?.title}
                </Descriptions.Item>
                <Descriptions.Item label={t('shop.address')} span={2}>
                  {data.translation?.address}
                </Descriptions.Item>
                <Descriptions.Item label={t('phone')} span={2}>
                  {data.phone}
                </Descriptions.Item>
                <Descriptions.Item label={t('tax')} span={2}>
                  {data.tax}
                </Descriptions.Item>
                <Descriptions.Item label={t('background.image')} span={2}>
                  <ColumnImage image={data?.background_img} size={100} />
                </Descriptions.Item>
                <Descriptions.Item label={t('logo.image')} span={2}>
                  <ColumnImage image={data?.logo_img} size={100} />
                </Descriptions.Item>
                <Descriptions.Item label={t('open')} span={2}>
                  <Switch
                    name='open'
                    defaultChecked={data?.open}
                    onChange={workingStatusChange}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('wallet')} span={2}>
                  {numberToPrice(
                    data?.seller?.wallet?.price,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </Descriptions.Item>
              </Descriptions>
              {Boolean(data?.subscription) && (
                <Descriptions
                  title={t('subscription')}
                  bordered
                  className='mt-5'
                >
                  <Descriptions.Item label={t('type')} span={3}>
                    {data?.subscription?.type}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('price')} span={3}>
                    {numberToPrice(
                      data?.subscription?.price,
                      defaultCurrency?.symbol,
                      defaultCurrency?.symbol,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('expired.at')} span={3}>
                    {data?.subscription?.expired_at}
                  </Descriptions.Item>
                </Descriptions>
              )}
              {statusLoading && (
                <div className='loader'>
                  <Spin />
                </div>
              )}
            </div>
          </Col>
        </Row>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
