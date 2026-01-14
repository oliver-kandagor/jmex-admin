import { useContext, useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchRequestModels } from 'redux/slices/request-models';
import { HiArrowNarrowRight } from 'react-icons/hi';
import requestAdminModelsService from 'services/request-models';
import moment from 'moment';
import ProductStatusModal from './productStatusModal';

export default function ProductRequestList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    data: requests,
    meta,
    loading,
  } = useSelector((state) => state.requestModels, shallowEqual);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
  });

  const params = {
    type: 'product',
    perPage: 10,
    page: filters.page,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `product-request/${id}`,
        id: 'product_request_edit',
        name: t('product.request.edit'),
      }),
    );
    navigate(`/product-request/${id}`);
  };

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `product-request-details/${id}`,
        id: 'product_request_details',
        name: t('product.request.details'),
      }),
    );
    navigate(`/product-request-details/${id}`);
  };

  const columns = [
    {
      title: t('created.by'),
      dataIndex: 'createdBy',
      key: 'createdBy',
      is_show: true,
      render: (createdBy) => (
        <>
          {createdBy.firstname || ''} {createdBy?.lastname || ''}
        </>
      ),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (createdAt) => moment(createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('original.title -> changed.title'),
      key: 'title',
      is_show: true,
      render: (row) => (
        <Space>
          <span>{row?.model?.translation?.title || t('N/A')}</span>
          <HiArrowNarrowRight />
          <span>
            {row?.data?.[`title[${row?.model?.translation?.locale}]`]}
          </span>
        </Space>
      ),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space
          style={{ cursor: 'pointer' }}
          onClick={() => setProductDetails(row)}
        >
          <Tag
            color={
              status === 'pending'
                ? 'blue'
                : status === 'canceled'
                  ? 'red'
                  : 'cyan'
            }
          >
            {t(status)}
          </Tag>
          <EditOutlined />
        </Space>
      ),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (row) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => goToShow(row?.id)} />
          <Button icon={<EditOutlined />} onClick={() => goToEdit(row?.id)} />
        </Space>
      ),
    },
  ];

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const requestStatusChange = () => {
    setLoadingBtn(true);
    const params = {
      status: id?.[0]?.status,
    };
    requestAdminModelsService
      .changeStatus(id?.[0]?.id, params)
      .then(() => {
        toast.success(t('successfully.changed'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
        setId(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const fetch = () => {
    dispatch(fetchRequestModels(params));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
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
    <Card>
      <Table
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={requests}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        rowKey={(record) => record?.id}
        rowSelection={rowSelection}
        onChange={onChangePagination}
      />
      {Boolean(productDetails) && (
        <ProductStatusModal
          orderDetails={productDetails}
          handleCancel={() => setProductDetails(null)}
          paramsData={params}
          listType='request'
        />
      )}
      <CustomModal
        click={requestStatusChange}
        text={t('change.status')}
        setText={setId}
        loading={loadingBtn}
      />
    </Card>
  );
}
