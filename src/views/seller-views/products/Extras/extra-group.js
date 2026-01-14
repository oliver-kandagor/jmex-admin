import { useEffect, useState, useContext } from 'react';
import { Button, Card, Space, Table } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import extraService from 'services/seller/extras';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSelletExtraGroups } from 'redux/slices/extraGroup';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import useDidUpdate from 'helpers/useDidUpdate';
import ExtraGroupShowModal from './extra-group-show-modal';
import ExtraGroupModal from './extra-group-modal';

export default function SellerExtraGroup() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { extraGroups, loading, meta } = useSelector(
    (state) => state.extraGroup,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [show, setShow] = useState(null);
  const [modal, setModal] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
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
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => translation?.title,
    },
    {
      title: t('created.by'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => (shop ? t('this.shop') : t('admin')),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (record, row) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setShow(record.id)} />
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => setModal(record)}
            disabled={!row?.shop_id}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId([record.id]);
              setText(true);
            }}
            disabled={!row?.shop_id}
          />
        </Space>
      ),
    },
  ]);

  const paramsData = {
    page: filters.page,
  };

  const handleFiltersChange = (value = {}) => {
    setFilters((prev) => ({ ...prev, ...value }));
  };

  const handleCancel = () => {
    setShow(null);
    setModal(null);
  };

  const onDeleteExtra = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    extraService
      .deleteGroup(params)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        setId(null);
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.extra.group'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const fetch = () => {
    dispatch(fetchSelletExtraGroups(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetch();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('extra.group')}
      extra={
        <Space wrap>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={() => setModal({})}
          >
            {t('add.extra')}
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
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={extraGroups}
        rowKey={(record) => record.id}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          current: meta?.current_page || 1,
          total: meta?.total || 0,
        }}
        onChange={onChangePagination}
      />
      {Boolean(modal) && (
        <ExtraGroupModal modal={modal} handleCancel={handleCancel} />
      )}
      <CustomModal
        click={onDeleteExtra}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
      />
      {Boolean(show) && (
        <ExtraGroupShowModal open={show} handleClose={handleCancel} />
      )}
    </Card>
  );
}
