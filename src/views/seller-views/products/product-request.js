import React, { useContext, useEffect, useState } from 'react';
import { Card, Image, Table, Button, Space, Tag, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';
import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  addMenu,
  disableRefetch,
  setMenuData,
  setRefetch,
} from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import FilterColumns from '../../../components/filter-column';
import formatSortType from '../../../helpers/formatSortType';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { fetchSellerRequestModels } from 'redux/slices/request-models';
import { HiArrowNarrowRight } from 'react-icons/hi';
import requestModelsService from 'services/seller/request-models';

const body = {
  type: 'product',
};

export default function SellerProductRequest({ parentId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const { uuid: parentUuid } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    data: requests,
    meta,
    loading,
    params,
  } = useSelector((state) => state.requestModels, shallowEqual);
  const data = activeMenu.data;

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [isVisibleMsgModal, setIsVisibleMsgModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [id, setId] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
  });

  const paramsData = {
    search: data?.search,
    sort: data?.sort,
    column: data?.column,
    perPage: data?.perPage,
    page: data?.page,
    parent_id: parentId,
    type: 'product',
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/product-request/${row.id}`,
        id: 'product_request_edit',
        name: t('product.request.edit'),
      }),
    );
    navigate(`/seller/product-request/${row.id}`, {
      state: { parentId, parentUuid },
    });
  };

  const columns = [
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
        <div>
          {status === 'pending' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (row) => (
        <Space>
          {Boolean(row?.status === 'canceled' && row?.status_note) && (
            <Button
              icon={<MessageOutlined />}
              onClick={() => {
                setIsVisibleMsgModal(true);
                setModalText(row.status_note);
              }}
            />
          )}
          <Button icon={<EditOutlined />} onClick={() => goToEdit(row)} />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              setId([row?.id]);
              setIsModalVisible(true);
            }}
          />
        </Space>
      ),
    },
  ];

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const categoryDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    requestModelsService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
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
    dispatch(fetchSellerRequestModels(paramsData));
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
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={requests}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        rowKey={(record) => record.key}
        onChange={onChangePagination}
        loading={loading}
      />

      <CustomModal
        click={categoryDelete}
        text={t('delete')}
        setText={setId}
        loading={loadingBtn}
      />

      <Modal
        title={t('reject.message')}
        closable={false}
        visible={isVisibleMsgModal}
        footer={null}
        centered
      >
        <p>{modalText}</p>
        <div className='d-flex justify-content-end'>
          <Button
            type='primary'
            className='mr-2'
            onClick={() => setIsVisibleMsgModal(false)}
          >
            {t('close')}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
