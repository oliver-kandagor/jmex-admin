import { useEffect, useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Rate, Space, Table } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { sellerfetchShopReviews } from 'redux/slices/shop-reviews';
import ShopReviewShowModal from './shopReviewShow';
import moment from 'moment';
import FilterColumns from 'components/filter-column';

export default function SellerOrderReviews() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading } = useSelector(
    (state) => state.shopReviews,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [show, setShow] = useState(null);
  const [filters, setFilters] = useState({ page: 1 });
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'order',
      sorter: true,
      is_show: true,
    },
    {
      title: t('user'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (_, row) => row?.comment?.split(',')?.[0],
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
      is_show: true,
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (createdAt) => moment(createdAt).format('DD.MM.YYYY'),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (row) => (
        <Space>
          <Button
            type='primary'
            icon={<EyeOutlined />}
            onClick={() => setShow(row.id)}
          />
        </Space>
      ),
    },
  ]);

  const params = {
    page: filters.page,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setId(newSelectedRowKeys);
  };

  const rowSelection = {
    id,
    onChange: onSelectChange,
  };

  const fetch = () => {
    dispatch(sellerfetchShopReviews(params));
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
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetch();
  }, [filters]);

  return (
    <Card
      title={t('shop.reviews')}
      extra={
        <Space wrap>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={reviews}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          current: meta?.current_page || 1,
          total: meta?.total || 0,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      {Boolean(show) && (
        <ShopReviewShowModal id={show} handleCancel={() => setShow(null)} />
      )}
    </Card>
  );
}
