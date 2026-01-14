import { useContext, useEffect, useState } from 'react';
import { Button, Card, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import pagesService from 'services/pages';
import { fetchPages } from 'redux/slices/pages';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import RiveResult from 'components/rive-result';
import ColumnImage from 'components/column-image';
import useDidUpdate from 'helpers/useDidUpdate';

const Page = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { pages, meta, loading } = useSelector(
    (state) => state.pages,
    shallowEqual,
  );

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
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
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img) => <ColumnImage image={img} size={100} />,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => type.toUpperCase(),
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
            disabled={row?.deleted_at}
          />
          <DeleteButton
            disabled={row?.deleted_at}
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId([row?.type]);
            }}
          />
        </Space>
      ),
    },
  ]);

  const params = {
    page: filters.page,
  };

  const handleFiltersChange = (values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const goToAddBanners = () => {
    dispatch(
      addMenu({
        id: 'page_add',
        url: 'page/add',
        name: t('add.page'),
      }),
    );
    navigate('/page/add');
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'page_edit',
        url: `page/${row.id}`,
        name: t('edit.page'),
      }),
    );
    navigate(`/page/${row.id}`);
  };

  const pageDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    pagesService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const onChangePagination = (pageNumber) => {
    const { current } = pageNumber;
    handleFiltersChange({ page: current });
  };

  const fetch = () => {
    dispatch(fetchPages(params));
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
      title={t('pages')}
      extra={
        <Space wrap>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddBanners}
          >
            {t('add.pages')}
          </Button>

          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: true }}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={pages}
        loading={loading}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          current: meta?.current_page || 1,
          total: meta?.total || 0,
        }}
        rowKey={(record) => record.id}
        locale={{
          emptyText: <RiveResult />,
        }}
        onChange={onChangePagination}
      />
      <CustomModal
        click={pageDelete}
        text={t('delete')}
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
};

export default Page;
