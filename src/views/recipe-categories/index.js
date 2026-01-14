import { useContext, useEffect, useState } from 'react';
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tabs, Tag, Switch } from 'antd';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import categoryService from 'services/category';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import { CgExport, CgImport } from 'react-icons/cg';
import ResultModal from 'components/result-modal';
import { fetchRecipeCategories } from 'redux/slices/recipe-category';
import shopService from 'services/restaurant';
import { InfiniteSelect } from 'components/infinite-select';
import ColumnImage from 'components/column-image';
import CategoryStatusModal from '../categories/categoryStatusModal';

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

  const [restore, setRestore] = useState(null);
  const [active, setActive] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const [filters, setFilters] = useState({ page: 1, search: '', shop: null });
  const [hasMore, setHasMore] = useState({ shop: false });

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [text, setText] = useState(null);
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
      render: (shop) =>
        shop ? shop?.translation?.title || t('N/A') : t('admin'),
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
      render: (img) => <ColumnImage image={img} />,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          onChange={() => {
            setIsModalVisible(true);
            setId(row?.uuid);
            setActive(true);
          }}
          disabled={Boolean(row?.deleted_at)}
          checked={active}
        />
      ),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space
          style={{ cursor: !row?.deleted_at ? 'pointer' : 'not-allowed' }}
          onClick={() => {
            if (!row?.deleted_at) {
              setRecipeData(row);
            }
          }}
        >
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
          {!row?.deleted_at && <EditOutlined />}
        </Space>
      ),
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
            disabled={Boolean(row?.deleted_at)}
          />
          <Button
            icon={<CopyOutlined />}
            onClick={() => goToClone(row.uuid)}
            disabled={Boolean(row?.deleted_at)}
          />
          <DeleteButton
            disabled={Boolean(row?.deleted_at)}
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
    type: 'receipt',
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    status:
      filters.status !== 'all' && filters.status !== 'deleted_at'
        ? filters.status
        : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
    shop_id: filters.shop?.value,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const fetchShops = ({ search, page }) => {
    const params = {
      search: search || undefined,
      status: 'approved',
      page: page || 1,
    };
    return shopService.search(params).then((res) => {
      setHasMore((prev) => ({ ...prev, shop: Boolean(res?.links?.next) }));
      return res.data.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `recipe-category/edit/${row.uuid}`,
        id: 'category_edit',
        name: t('edit.category'),
      }),
    );
    navigate(`/recipe-category/edit/${row?.uuid}`, { state: 'edit' });
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'recipe-category/add',
        name: t('add.category'),
      }),
    );
    navigate('/recipe-category/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        url: `recipe-categories/import`,
        id: 'category_import',
        name: t('import.category'),
      }),
    );
    navigate(`/recipe-categories/import`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `category-clone`,
        url: `recipe-category-clone/${uuid}`,
        name: t('category.clone'),
      }),
    );
    navigate(`/recipe-category-clone/${uuid}`, { state: 'clone' });
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
    categoryService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setText(null);
        setId(null);
      });
  };

  const categoryDropAll = () => {
    setLoadingBtn(true);
    categoryService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const categoryRestoreAll = () => {
    setLoadingBtn(true);
    categoryService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const excelExport = () => {
    setDownloading(true);
    categoryService
      .export(params)
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
    categoryService
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
    dispatch(fetchRecipeCategories(params));
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
        <Space wrap size={[14, 20]}>
          <SearchInput
            placeholder={t('search')}
            className='w-25'
            handleChange={(search) => handleFiltersChange({ search, page: 1 })}
            defaultValue={filters.search}
            resetSearch={!filters.search}
            style={{ minWidth: 200 }}
          />
          <InfiniteSelect
            placeholder={t('select.shop')}
            hasMore={hasMore.shop}
            fetchOptions={fetchShops}
            style={{ minWidth: 200 }}
            value={filters.shop}
            onChange={(shop) => handleFiltersChange({ shop, page: 1 })}
          />
          {filters.status !== 'deleted_at' ? (
            <>
              <DeleteButton size='' onClick={allDelete}>
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
                {t('add.category')}
              </Button>
            </>
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
          type='card'
          className='mt-3'
          activeKey={filters.status}
          onChange={(status) => handleFiltersChange({ status, page: 1 })}
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={categories?.map((category) => ({
            ...category,
            children: category?.children?.length
              ? category?.children?.map((child) => ({
                  ...child,
                  children: null,
                }))
              : null,
          }))}
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
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? categoryRestoreAll : categoryDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
      {Boolean(recipeData) && (
        <CategoryStatusModal
          categoryDetails={recipeData}
          handleCancel={() => setRecipeData(null)}
        />
      )}
    </>
  );
};

export default RecipeCategories;
