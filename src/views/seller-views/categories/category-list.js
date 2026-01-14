import { useContext, useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Switch, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { fetchSellerCategory } from 'redux/slices/category';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import sellerCategory from 'services/seller/category';
import { useNavigate, useParams } from 'react-router-dom';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import SearchInput from 'components/search-input';
import DeleteButton from 'components/delete-button';
import ColumnImage from 'components/column-image';
import CreateCategory from './createCategory';

const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];
const roles = ['all', 'pending', 'published', 'unpublished', 'deleted_at'];

export default function SellerCategoryList({ parentId, type = 'main' }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { categories, meta, loading } = useSelector(
    (state) => state.category,
    shallowEqual,
  );
  const { uuid: parentUuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [active, setActive] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    status: roles[0],
  });
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
      render: (translation) => translation?.title || t('N/A'),
    },
    {
      title: t('created.by'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => (shop ? t('you') : t('admin')),
    },
    {
      title: t('translations'),
      dataIndex: 'locales',
      key: 'locales',
      is_show: true,
      render: (locales) => (
        <Space>
          {locales?.map((item, index) => (
            <Tag className='text-uppercase' color={[colors[index]]}>
              {item}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} row={row} />,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          onChange={() => {
            setIsModalVisible(true);
            setId(row.uuid);
            setActive(true);
          }}
          disabled={row.deleted_at || !row?.shop_id}
          checked={active}
        />
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status) => (
        <Tag
          color={
            status === 'pending'
              ? 'blue'
              : status === 'unpublished'
                ? 'red'
                : 'cyan'
          }
        >
          {t(status)}
        </Tag>
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
            disabled={!row?.shop_id}
          />
          <DeleteButton
            disabled={row.deleted_at || !row?.shop_id}
            icon={<DeleteOutlined />}
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

  const params = {
    type,
    parent_id: parentId || undefined,
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    status:
      filters.status !== 'all' && filters.status !== 'deleted_at'
        ? filters.status
        : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/category/${row.uuid}`,
        id: 'category_edit',
        name: t('category'),
      }),
    );
    navigate(`/seller/category/${row.uuid}`, {
      state: { parentId, parentUuid },
    });
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

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
    sellerCategory
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleCancel = () => setIsModalOpen(false);

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        url: `seller/category/add`,
        id: 'seller/category/add',
        name: t('edit.category'),
      }),
    );
    navigate(`/seller/category/add`, { state: { parentId, parentUuid } });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    sellerCategory
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.updated'));
        setActive(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetch = () => {
    dispatch(fetchSellerCategory(params));
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
  }, [filters, parentId, type]);

  return (
    <Card
      title={parentId ? t('sub.category') : t('categories')}
      extra={
        <Space wrap>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFiltersChange({ search, page: 1 })}
            defaultValue={filters.search}
            resetSearch={!filters.search}
          />
          <Button type='primary' onClick={goToAddCategory}>
            {t('add.category')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Tabs
        className='mt-3'
        activeKey={filters.status}
        type='card'
        onChange={(status) => handleFiltersChange({ status, page: 1 })}
      >
        {roles.map((item) => (
          <Tabs.TabPane tab={t(item)} key={item} />
        ))}
      </Tabs>
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={categories}
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
      {isModalOpen && (
        <CreateCategory handleCancel={handleCancel} isModalOpen={isModalOpen} />
      )}
      <CustomModal
        click={active ? handleActive : categoryDelete}
        text={
          active
            ? t('set.active.category')
            : text
              ? t('delete')
              : t('all.delete')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </Card>
  );
}
