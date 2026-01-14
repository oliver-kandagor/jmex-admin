import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tabs, Tag, Switch } from 'antd';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import sellerCategoryService from 'services/seller/category';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import { CgExport, CgImport } from 'react-icons/cg';
import { fetchSellerRecipeCategories } from 'redux/slices/recipe-category';
import ColumnImage from 'components/column-image';

const { TabPane } = Tabs;

const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];
const roles = ['all', 'pending', 'published', 'unpublished', 'deleted_at'];

const RecipeCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { categories, meta, loading } = useSelector(
    (state) => state.recipeCategory,
    shallowEqual,
  );

  const [active, setActive] = useState(null);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [text, setText] = useState(null);
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
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img) => <ColumnImage image={img} />,
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
            disabled={row?.deleted_at || !row?.shop_id}
            icon={<DeleteOutlined />}
            onClick={() => {
              setId([row?.id]);
              setIsModalVisible(true);
              setText(true);
            }}
          />
        </Space>
      ),
    },
  ]);

  const params = {
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    status:
      filters.status !== 'all' && filters.status !== 'deleted_at'
        ? filters.status
        : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/recipe-category/edit/${row?.uuid}`,
        id: 'category_edit',
        name: t('edit.category'),
      }),
    );
    navigate(`/seller/recipe-category/edit/${row?.uuid}`, { state: 'edit' });
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'seller/recipe-category/add',
        name: t('add.category'),
      }),
    );
    navigate('/seller/recipe-category/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        url: `seller/recipe-categories/import`,
        id: 'category_import',
        name: t('import.category'),
      }),
    );
    navigate(`/seller/recipe-categories/import`);
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
    sellerCategoryService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setText(null);
        setId(null);
      });
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const excelExport = () => {
    setDownloading(true);
    sellerCategoryService
      .export()
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = export_url + res?.data?.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.recipe.category'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleActive = () => {
    setLoadingBtn(true);
    sellerCategoryService
      .setActive(id)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const fetch = () => {
    dispatch(fetchSellerRecipeCategories(params));
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
      <Card>
        <Space wrap size={[12, 12]}>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFiltersChange({ search, page: 1 })}
            defaultValue={filters.search}
            resetSearch={!filters.search}
            style={{ minWidth: 200 }}
          />

          <DeleteButton onClick={allDelete}>
            {t('delete.selected')}
          </DeleteButton>
          <Button onClick={goToImport}>
            <CgImport className='mr-2' />
            {t('import')}
          </Button>
          <Button loading={downloading} onClick={excelExport}>
            <CgExport className='mr-2' />
            {t('export')}
          </Button>
          <Button type='primary' onClick={goToAddCategory}>
            {t('add.recipe.category')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Tabs
          className='mt-3'
          activeKey={filters.status}
          onChange={(status) => handleFiltersChange({ status, page: 1 })}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
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
          rowKey={(record) => record.id}
          onChange={onChangePagination}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={active ? handleActive : categoryDelete}
        text={
          active
            ? t('set.active.product')
            : text
              ? t('delete')
              : t('all.delete')
        }
        setText={setId}
        setActive={setActive}
        loading={loadingBtn}
      />
    </>
  );
};

export default RecipeCategories;
