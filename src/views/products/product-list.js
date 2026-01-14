import React, { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Table, Card, Space, Switch, Tag, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import productService from 'services/product';
import { fetchProducts } from 'redux/slices/product';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import ProductStatusModal from './productStatusModal';
import FilterColumns from 'components/filter-column';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import ResultModal from 'components/result-modal';
import RiveResult from 'components/rive-result';
import { CgExport, CgImport } from 'react-icons/cg';
import { useQueryParams } from 'helpers/useQueryParams';
import ColumnImage from 'components/column-image';
import ProductListFilter from './components/filter';

const { TabPane } = Tabs;

const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];
const roles = ['all', 'pending', 'published', 'unpublished', 'deleted_at'];
const initialFilters = {
  search: '',
  shop: null,
  category: null,
  brand: null,
  kitchen: null,
  status: roles[0],
  page: 1,
  type: null,
};

const ProductCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryParams = useQueryParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { products, meta, loading } = useSelector(
    (state) => state.product,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);

  const [filters, setFilters] = useState(initialFilters);
  const [productDetails, setProductDetails] = useState(null);
  const [active, setActive] = useState(null);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
  const [id, setId] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      is_show: true,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage row={row} image={img} />,
    },
    {
      title: t('name'),
      dataIndex: 'name',
      is_show: true,
    },
    {
      title: t('translations'),
      dataIndex: 'locales',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            {row.locales?.map((item, index) => (
              <Tag className='text-uppercase' color={[colors[index]]}>
                {item}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('shop'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || shop?.id || t('N/A'),
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) =>
        category?.translation?.title || category?.id || t('N/A'),
    },
    {
      title: t('kitchen'),
      dataIndex: 'kitchen',
      key: 'kitchen',
      is_show: true,
      render: (kitchen) =>
        kitchen?.translation?.title || kitchen?.id || t('N/A'),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type || 'single'),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.uuid);
              setActive(true);
            }}
            disabled={row?.deleted_at}
            checked={!!active}
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space
          style={{ cursor: row?.deleted_at ? 'not-allowed' : 'pointer' }}
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
          {!row?.deleted_at && <EditOutlined />}
        </Space>
      ),
    },
    {
      title: t('options'),
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row.uuid)}
              disabled={row.deleted_at}
            />
            <Button
              icon={<CopyOutlined />}
              onClick={() => goToClone(row.uuid)}
              disabled={row.deleted_at}
            />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setId([row.id]);
                setText(true);
                setActive(false);
              }}
              disabled={row.deleted_at}
            />
          </Space>
        );
      },
    },
  ]);

  const status = queryParams.get('status');
  const params = {
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    type: filters.type || undefined,
    shop_id: filters.shop?.value,
    category_id: filters.category?.value,
    brand_id: filters.brand?.value,
    kitchen_id: filters.kitchen?.value,
    status:
      filters.status !== 'all' && filters.status !== 'deleted_at'
        ? filters.status
        : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const handleFiltersChange = (values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'product-add',
        url: `product/add`,
        name: t('add.product'),
      }),
    );
    navigate(`/product/add`);
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: `product-edit`,
        url: `product/${uuid}`,
        name: t('edit.product'),
      }),
    );
    navigate(`/product/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `product-clone`,
        url: `product-clone/${uuid}`,
        name: t('clone.product'),
      }),
    );
    navigate(`/product-clone/${uuid}`);
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'product-import',
        url: `catalog/product/import`,
        name: t('product.import'),
      }),
    );
    navigate(`/catalog/product/import`);
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
        setText(null);
        setActive(false);
        setId([]);
      })
      .finally(() => setLoadingBtn(false));
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const productDropAll = () => {
    setLoadingBtn(true);
    productService
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

  const productRestoreAll = () => {
    setLoadingBtn(true);
    productService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const excelExport = () => {
    setDownloading(true);
    productService
      .export(params)
      .then((res) => {
        window.location.href = export_url + res?.data?.file_name;
      })
      .finally(() => setDownloading(false));
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

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const fetch = () => {
    dispatch(fetchProducts(params));
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
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetch();
  }, [filters]);

  return (
    <React.Fragment>
      <ProductListFilter
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />
      <Card className='p-0'>
        <Space wrap size={[14, 20]}>
          <Button onClick={goToImport}>
            <CgImport className='mr-2' />
            {t('import')}
          </Button>
          {status !== 'deleted_at' && (
            <Button loading={downloading} onClick={excelExport}>
              <CgExport className='mr-2' />
              {t('export')}
            </Button>
          )}
          <FilterColumns columns={columns} setColumns={setColumns} />
          {status !== 'deleted_at' && (
            <DeleteButton onClick={allDelete}>
              {t('delete.selected')}
            </DeleteButton>
          )}

          {status !== 'deleted_at' ? (
            <DeleteButton onClick={() => setRestore({ delete: true })}>
              {t('delete.all')}
            </DeleteButton>
          ) : (
            <DeleteButton
              icon={<FaTrashRestoreAlt className='mr-2' />}
              onClick={() => setRestore({ restore: true })}
            >
              {t('restore.all')}
            </DeleteButton>
          )}
          <Button
            icon={<PlusCircleOutlined />}
            type='primary'
            onClick={goToAddProduct}
          >
            {t('add.product')}
          </Button>
        </Space>
      </Card>

      <Card>
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
            emptyText: <RiveResult />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={products}
          pagination={{
            showSizeChanger: false,
            pageSize: meta?.per_page || 10,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
        />
      </Card>
      {Boolean(productDetails) && (
        <ProductStatusModal
          orderDetails={productDetails}
          handleCancel={() => setProductDetails(null)}
          paramsData={params}
        />
      )}
      <CustomModal
        click={active ? handleActive : productDelete}
        text={
          active
            ? t('set.active.product')
            : text
              ? t('delete')
              : t('all.delete')
        }
        loading={loadingBtn}
        setText={setId}
        setActive={setActive}
      />
      {Boolean(restore) && (
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
    </React.Fragment>
  );
};

export default ProductCategories;
