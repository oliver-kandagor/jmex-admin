import { useContext, useEffect, useState } from 'react';
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Card, Space, Switch, Tag, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import productService from 'services/seller/product';
import useDidUpdate from 'helpers/useDidUpdate';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import { fetchSellerfetchAddons } from 'redux/slices/addons';
import RiveResult from 'components/rive-result';
import { CgExport, CgImport } from 'react-icons/cg';

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
        url: `seller/addon/import`,
        name: t('addon.import'),
      }),
    );
    navigate(`/seller/addon/import`);
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
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(setRefetch(activeMenu));
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
    navigate(`/seller/addon/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `addon-clone`,
        url: `seller/addon-clone/${uuid}`,
        name: t('clone.addon'),
      }),
    );
    navigate(`/seller/addon-clone/${uuid}`);
  };

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'addon-add',
        url: `seller/addon/add`,
        name: t('add.addon'),
      }),
    );
    navigate(`/seller/addon/add`);
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
    dispatch(fetchSellerfetchAddons(paramsData));
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
          <Button onClick={goToImport}>
            <CgImport className='mr-2' />
            {t('import')}
          </Button>
          <Button loading={downloading} onClick={excelExport}>
            <CgExport className='mr-2' />
            {t('export')}
          </Button>
          {filters.status !== 'deleted_at' && (
            <DeleteButton onClick={allDelete}>
              {t('delete.selected')}
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
      <CustomModal
        click={active ? handleActive : productDelete}
        text={
          active ? t('set.active.addon') : text ? t('delete') : t('all.delete')
        }
        loading={loadingBtn}
        setText={setId}
        setActive={setActive}
      />
    </>
  );
};

export default AddonsCategories;
