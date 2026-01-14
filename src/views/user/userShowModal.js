import React, { useEffect, useState } from 'react';
import { Button, Col, Descriptions, Modal, Row } from 'antd';
import userService from 'services/user';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import { shallowEqual, useSelector } from 'react-redux';
import numberToPrice from 'helpers/numberToPrice';
import useDemo from 'helpers/useDemo';
import hideEmail from 'components/hideEmail';
import ColumnImage from 'components/column-image';

export default function UserShowModal({ uuid, handleCancel }) {
  const { t } = useTranslation();

  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { isDemo } = useDemo();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchUser = () => {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => setData(res?.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  return (
    <Modal
      visible={Boolean(uuid)}
      title={t('user')}
      onCancel={handleCancel}
      footer={[
        <Button key='cancel' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      {!loading ? (
        <Row gutter={24}>
          <Col span={data?.shop ? 12 : 24}>
            <Descriptions bordered>
              <Descriptions.Item span={3} label={t('user.id')}>
                {data?.id}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('avatar')}>
                <ColumnImage image={data?.img} />
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('name')}>
                {data?.firstname || ''} {data?.lastname || ''}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('gender')}>
                {t(data?.gender)}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('birthday')}>
                {data?.birthday || t('N/A')}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('email')}>
                {isDemo ? hideEmail(data?.email) : data?.email}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('phone')}>
                {data?.phone || t('N/A')}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('role')}>
                {t(data?.role)}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('wallet')}>
                {numberToPrice(
                  data.wallet?.price || 0,
                  defaultCurrency?.symbol,
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          {Boolean(data.shop) && (
            <Col span={12}>
              <Descriptions bordered>
                <Descriptions.Item span={3} label={t('shop.id')}>
                  {data?.shop?.id}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.name')}>
                  {data?.shop?.translation?.title || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.logo')}>
                  <ColumnImage image={data?.shop?.logo_img} />
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.phone')}>
                  {data?.shop?.phone || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.open_close.time')}>
                  {data?.shop?.open_time} - {data?.shop?.close_time}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('delivery.range')}>
                  {data?.shop?.delivery_range}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          )}
        </Row>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
