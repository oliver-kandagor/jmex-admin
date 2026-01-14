import { useState, useEffect } from 'react';
import { Button, Space, Table, Card } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSelletExtraValue } from 'redux/slices/extraValue';
import extraService from 'services/seller/extras';
import DeleteButton from 'components/delete-button';
import { disableRefetch } from 'redux/slices/menu';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import ColumnImage from 'components/column-image';
import ExtraValueModal from './extra-value-modal';
import ExtraDeleteModal from './extra-delete-modal';

export default function SellerExtraValue() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { extraValues, loading, meta } = useSelector(
    (state) => state.extraValue,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [modal, setModal] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
  });
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('group'),
      dataIndex: 'group',
      key: 'group',
      is_show: true,
      render: (group) => group?.translation?.title,
    },
    {
      title: t('created.by'),
      dataIndex: 'group',
      key: 'created_by',
      is_show: true,
      render: (group) => (group?.shop ? t('you') : t('admin')),
    },
    {
      title: t('value'),
      dataIndex: 'value',
      key: 'value',
      is_show: true,
      render: (value, row) => (
        <Space className='extras'>
          {row?.group?.type === 'color' && (
            <div
              className='extra-color-wrapper-contain'
              style={{ backgroundColor: value }}
            />
          )}
          {row?.group?.type === 'image' && <ColumnImage image={value} />}
          {row?.group?.type === 'text' && <span>{value}</span>}
        </Space>
      ),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (record) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => setModal(record)}
            disabled={!record?.group?.shop_id}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            onClick={() => setId([record.id])}
            disabled={!record?.group?.shop_id}
          />
        </Space>
      ),
    },
  ]);

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const handleCancel = () => setModal(null);

  const params = {
    perPage: 10,
    page: filters.page,
  };

  const deleteExtra = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    extraService
      .deleteValue(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setId(null);
        dispatch(disableRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const fetch = () => {
    dispatch(fetchSelletExtraValue(params));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetch();
  }, [activeMenu?.data]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch();
    }
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('extra.value')}
      extra={
        <Space wrap>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={() => setModal({})}
          >
            {t('add.extra')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={extraValues}
        rowKey={(record) => record.id}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
      />
      {Boolean(modal) && (
        <ExtraValueModal modal={modal} handleCancel={handleCancel} />
      )}
      {Boolean(id) && (
        <ExtraDeleteModal
          id={id}
          click={deleteExtra}
          text={t('delete.extra')}
          loading={loadingBtn}
          handleClose={() => setId(null)}
        />
      )}
    </Card>
  );
}
