import { useContext, useEffect, useState } from 'react';
import { Button, Card, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchBranch } from 'redux/slices/branch';
import branchService from 'services/seller/branch';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';

const SellerBranch = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { branches, meta, loading } = useSelector(
    (state) => state.branch,
    shallowEqual,
  );

  const [filters, setFilters] = useState({ page: 1 });
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'translation',
      key: 'title',
      render: (translation) => translation?.title,
    },
    {
      title: t('address'),
      is_show: true,
      dataIndex: 'address',
      key: 'address',
      render: (address) => address?.address,
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      render: (row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <DeleteButton
            disabled={row.deleted_at}
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId([row.id]);
              setText(true);
            }}
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

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/branch/${row.id}`,
        id: 'branch_edit',
        name: t('edit.branch'),
      }),
    );
    navigate(`/seller/branch/${row.id}`);
  };

  const branchDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    branchService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
        setId(null);
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const onChangePagination = (pageNumber) => {
    const { current: page } = pageNumber;
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
      toast.warning(t('select.branch'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const goToAddBranch = () => {
    dispatch(
      addMenu({
        url: `seller/branch/add`,
        id: 'add.branch',
        name: t('add.branch'),
      }),
    );
    navigate(`/seller/branch/add`);
  };

  const fetch = () => {
    dispatch(fetchBranch(params));
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
      title={t('branches')}
      extra={
        <Space wrap>
          <Button type='primary' onClick={goToAddBranch}>
            {t('add.branch')}
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
        dataSource={branches}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
      <CustomModal
        click={branchDelete}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
};

export default SellerBranch;
