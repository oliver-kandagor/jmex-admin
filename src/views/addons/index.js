import { useContext, useEffect, useState } from 'react';
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Card, Space, Switch, Tag, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import productService from 'services/product';
import useDidUpdate from 'helpers/useDidUpdate';
import { DebounceSelect } from 'components/search';
import shopService from 'services/restaurant';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import { fetchAddons } from 'redux/slices/addons';
import RiveResult from 'components/rive-result';
import ResultModal from 'components/result-modal';
import { CgExport, CgImport } from 'react-icons/cg';
import ProductStatusModal from './productStatusModal';

const { TabPane } = Tabs;
const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];
const roles = ['all', 'published', 'pending', 'unpublished', 'deleted_at'];

const AddonsCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { addonsList, meta, loading, params } = useSelector(
    (state) => state.addons,
    shallowEqual,
  );

  const [productDetails, setProductDetails] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    shop: null,
    status: roles[0],
  });
  const [id, setId] = useState(null);
  const { setIsModalVisible } = useContext(Context);
  const [active, setActive] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
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
      title: t('translations'),
      dataIndex: 'locales',
      key: 'locales',
      is_show: true,
      render: (locales) => (
        <Space>
          {locales?.map((item, index) => (
            <Tag
              key={item?.locale}
              className='text-uppercase'
              color={[colors[index]]}
            >
              {item}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('shop'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('N/A'),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          disabled={row.deleted_at}
          checked={active}
          onChange={() => {
            setIsModalVisible(true);
            setId(row.uuid);
            setActive(true);
          }}
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
              setProductDetails(row);
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
          {!row.deleted_at && <EditOutlined />}
        </Space>
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
            onClick={() => goToEdit(row.uuid)}
            disabled={Boolean(row?.deleted_at)}
          />
          <Button
            icon={<CopyOutlined />}
            onClick={() => goToClone(row.uuid)}
            disabled={Boolean(row?.deleted_at)}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            disabled={Boolean(row?.deleted_at)}
            onClick={() => {
              setIsModalVisible(true);
              setId([row.id]);
              setText(true);
              setActive(false);
            }}
          />
        </Space>
      ),
    },
  ]);
  const paramsData = {
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    shop_id: filters.shop?.value,
    status:
      filters.status !== 'all' && filters.status !== 'deleted_at'
        ? filters.status
        : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters({ ...filters, ...value });
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'addon-import',
        url: `catalog/addon/import`,
        name: t('addon.import'),
        shop_id: activeMenu?.data?.shop?.value,
      }),
    );
    navigate(`/catalog/addon/import`);
  };

  const productDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    productService
      .delete(params)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchAddons(paramsData));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const productDropAll = () => {
    setLoadingBtn(true);
    productService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchAddons());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productRestoreAll = () => {
    setLoadingBtn(true);
    productService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchAddons(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchAddons(paramsData));
        toast.success(t('successfully.updated'));
        setActive(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const excelExport = () => {
    setDownloading(true);
    productService
      .export({ ...params, addon: 1 })
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = export_url + res.data.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: `addon-edit`,
        url: `addon/${uuid}`,
        name: t('edit.addon'),
      }),
    );
    navigate(`/addon/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `addon-clone`,
        url: `addon-clone/${uuid}`,
        name: t('clone.addon'),
      }),
    );
    navigate(`/addon-clone/${uuid}`);
  };

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'addon-add',
        url: `addon/add`,
        name: t('add.addon'),
      }),
    );
    navigate(`/addon/add`);
  };

  const fetchShops = (search) => {
    const params = {
      search: search || undefined,
    };
    return shopService.search(params).then((res) =>
      res?.data?.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.addon'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const fetch = () => {
    dispatch(fetchAddons(paramsData));
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
        <Space wrap size={[14, 20]}>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFiltersChange({ search, page: 1 })}
            defaultValue={filters.search}
            resetSearch={!filters.search}
            style={{ minWidth: 200 }}
          />
          <DebounceSelect
            placeholder={t('select.shop')}
            fetchOptions={fetchShops}
            style={{ minWidth: 200 }}
            value={filters.shop}
            onChange={(shop) => handleFiltersChange({ shop, page: 1 })}
          />
          <Button onClick={goToImport}>
            <CgImport className='mr-2' />
            {t('import')}
          </Button>
          <Button loading={downloading} onClick={excelExport}>
            <CgExport className='mr-2' />
            {t('export')}
          </Button>
          {filters.status !== 'deleted_at' ? (
            <DeleteButton onClick={allDelete}>
              {t('delete.selected')}
            </DeleteButton>
          ) : (
            <DeleteButton onClick={() => setRestore({ restore: true })}>
              {t('restore.all')}
            </DeleteButton>
          )}
          <FilterColumns columns={columns} setColumns={setColumns} />
          <Button type='primary' onClick={goToAddProduct}>
            {t('add.addon')}
          </Button>
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
          locale={{
            emptyText: <RiveResult id='nosell' />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={addonsList}
          pagination={{
            showSizeChanger: false,
            pageSize: meta?.per_page || 10,
            current: meta?.current_page || 1,
            total: meta?.total || 0,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record?.id}
        />
      </Card>
      {productDetails && (
        <ProductStatusModal
          orderDetails={productDetails}
          handleCancel={() => setProductDetails(null)}
        />
      )}
      <CustomModal
        click={active ? handleActive : productDelete}
        text={
          active ? t('set.active.addon') : text ? t('delete') : t('all.delete')
        }
        loading={loadingBtn}
        setText={setId}
        setActive={setActive}
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
          setActive={setActive}
        />
      )}
    </>
  );
};

export default AddonsCategories;
