import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tabs } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import numberToPrice from 'helpers/numberToPrice';
import { fetchRecepts } from 'redux/slices/reciept';
import receiptService from 'services/reciept';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import ResultModal from 'components/result-modal';
import ColumnImage from 'components/column-image';

const roles = ['published', 'deleted_at'];

const { TabPane } = Tabs;

const Receipts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { recepts, meta, loading } = useSelector(
    (state) => state.reciept,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState({
    status: roles[0],
    page: 1,
  });

  const params = {
    perPage: 10,
    page: filters.page,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `recept/edit/${row.id}`,
        id: 'recipe_edit',
        name: t('edit.recipe'),
      }),
    );
    navigate(`/recept/edit/${row.id}`, { state: 'edit' });
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'recipe_add',
        url: 'recept/add',
        name: t('add.recipe'),
      }),
    );
    navigate('/recept/add');
  };

  const productRestoreAll = () => {
    setLoadingBtn(true);
    receiptService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productDropAll = () => {
    setLoadingBtn(true);
    receiptService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'title',
      is_show: true,
      render: (translation) => translation?.title,
    },
    {
      title: t('shop'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('N/A'),
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img) => <ColumnImage image={img} />,
    },
    {
      title: t('recipe.category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) => category?.translation?.title || t('N/A'),
    },
    {
      title: t('discount'),
      dataIndex: 'discount_price',
      key: 'discount',
      is_show: true,
      render: (discountPrice, row) =>
        row?.discount_type === 'fix'
          ? numberToPrice(discountPrice)
          : `${discountPrice} %`,
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
            disabled={Boolean(row?.deleted_at)}
            onClick={() => goToEdit(row)}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            disabled={Boolean(row?.deleted_at)}
            onClick={() => {
              setId([row.id]);
              setIsModalVisible(true);
              setText(true);
            }}
          />
        </Space>
      ),
    },
  ]);

  const brandDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    receiptService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
        setText(null);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
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
      toast.warning(t('select.receipt'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const fetch = () => {
    dispatch(fetchRecepts(params));
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
    <>
      <Card className='p-0'>
        <Space wrap className='justify-content-end w-100'>
          <Button type='primary' onClick={goToAdd}>
            {t('add.recipe')}
          </Button>
          {filters.status !== 'deleted_at' ? (
            <DeleteButton onClick={allDelete}>
              {t('delete.selected')}
            </DeleteButton>
          ) : (
            <DeleteButton
              icon={<FaTrashRestoreAlt className='mr-2' />}
              onClick={() => setRestore({ restore: true })}
            >
              {t('restore.all')}
            </DeleteButton>
          )}
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Tabs
          className='mt-3'
          activeKey={filters.status}
          type='card'
          onChange={(status) => {
            handleFiltersChange({ status, page: 1 });
          }}
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={recepts}
          pagination={{
            showSizeChanger: false,
            pageSize: meta?.per_page || 0,
            current: meta?.current_page || 0,
            total: meta?.total || 0,
          }}
          rowKey={(record) => record.id}
          loading={loading}
          onChange={onChangePagination}
        />
      </Card>
      <CustomModal
        click={brandDelete}
        text={text ? t('delete') : t('all.delete')}
        setText={setId}
        loading={loadingBtn}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? productRestoreAll : productDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
};

export default Receipts;
