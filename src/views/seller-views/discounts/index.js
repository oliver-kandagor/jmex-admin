import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Switch, Table } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import discountService from 'services/seller/discount';
import { fetchDiscounts } from 'redux/slices/discount';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import ColumnImage from 'components/column-image';
import numberToPrice from 'helpers/numberToPrice';

export default function SellerDiscounts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { discounts, meta, loading } = useSelector(
    (state) => state.discount,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [active, setActive] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [filters, setFilters] = useState({ page: 1 });
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img) => <ColumnImage image={img} />,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price, row) =>
        row?.type === 'fix' ? numberToPrice(price) : `${price}%`,
    },
    {
      title: t('start.date'),
      dataIndex: 'start',
      key: 'start',
      is_show: true,
    },
    {
      title: t('end.date'),
      dataIndex: 'end',
      key: 'end',
      is_show: true,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (_, row) => (
        <Switch
          onChange={() => {
            setIsModalVisible(true);
            setId([row.id]);
            setActive(true);
          }}
          disabled={row.deleted_at}
          checked={row.active}
        />
      ),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            onClick={() => {
              setId([row.id]);
              setActive(false);
              setIsModalVisible(true);
              setText(true);
            }}
          />
        </Space>
      ),
    },
  ]);

  const params = {
    page: filters.page,
    perPage: 10,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `discount/${row.id}`,
        id: 'discount_edit',
        name: t('edit.discount'),
      }),
    );
    navigate(`/discount/${row.id}`);
  };

  const discountDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    discountService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const discountSetActive = () => {
    setLoadingBtn(true);
    discountService
      .setActive(id[0])
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
        setActive(true);
      })
      .finally(() => setLoadingBtn(false));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.discount'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add-discount',
        url: `discount/add`,
        name: t('add.discount'),
      }),
    );
    navigate(`/discount/add`);
  };

  const fetch = () => {
    dispatch(fetchDiscounts(params));
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
      title={t('discounts')}
      extra={
        <Space wrap>
          <Button type='primary' onClick={goToAdd}>
            {t('add.discount')}
          </Button>
          <DeleteButton onClick={allDelete}>
            {t('delete.selected')}
          </DeleteButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={discounts}
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
      <CustomModal
        click={active ? discountSetActive : discountDelete}
        text={
          active
            ? t('set.active.discount')
            : text
              ? t('delete')
              : t('all.delete')
        }
        setText={setId}
        loading={loadingBtn}
        setActive={setActive}
      />
    </Card>
  );
}
