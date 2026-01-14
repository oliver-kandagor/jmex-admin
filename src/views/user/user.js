import React, { useEffect, useState, useContext } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Space, Table, Tabs, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaTrashRestoreAlt, FaUserCog } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
  setRefetch,
} from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../helpers/formatSortType';
import useDidUpdate from '../../helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';
import { fetchClients } from '../../redux/slices/client';
import SearchInput from '../../components/search-input';
import FilterColumns from '../../components/filter-column';
import DeleteButton from '../../components/delete-button';
import { toast } from 'react-toastify';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import deliveryService from '../../services/delivery';
import ResultModal from '../../components/result-modal';
import userService from '../../services/user';
import useDemo from '../../helpers/useDemo';
import hideEmail from '../../components/hideEmail';

const { TabPane } = Tabs;
const roles = ['published', 'deleted_at'];

const User = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta } = useSelector(
    (state) => state.client,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    status: roles[0],
  });

  const params = {
    perPage: 10,
    page: filters.page,
    search: filters.search || undefined,
    status: filters.status !== 'deleted_at' ? filters.status : undefined,
    deleted_at: filters.status === 'deleted_at' ? filters.status : undefined,
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
      key: 'firstname',
      is_show: true,
      render: (firstname) => firstname || t('N/A'),
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      key: 'lastname',
      is_show: true,
      render: (lastname) => lastname || t('N/A'),
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      is_show: true,
      render: (email) => email || t('N/A'),
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      is_show: true,
      render: (role) => t(role),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (row) => (
        <Space>
          <Button
            disabled={row?.deleted_at}
            icon={<EyeOutlined />}
            onClick={() => goToDetail(row)}
          />
          <Button
            disabled={row?.deleted_at}
            icon={<ExpandOutlined />}
            onClick={() => setUuid(row.uuid)}
          />
          <Button
            type='primary'
            disabled={row?.deleted_at}
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <Tooltip title={t('change.user.role')}>
            <Button
              disabled={row?.deleted_at}
              onClick={() => setUserRole(row)}
              icon={<FaUserCog />}
            />
          </Tooltip>
          <DeleteButton
            disabled={row?.deleted_at}
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

  const goToAddClient = () => {
    dispatch(
      addMenu({
        id: 'user-add',
        url: 'user/add',
        name: t('add.client'),
      }),
    );
    navigate('/user/add');
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row.uuid}`,
        id: 'user_edit',
        name: 'User edit',
      }),
    );
    navigate(`/user/${row.uuid}`, { state: 'user' });
  };

  const goToDetail = (row) => {
    dispatch(
      addMenu({
        url: `users/user/${row.uuid}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${row.uuid}`, { state: { user_id: row.id } });
  };

  const handleFiltersChange = (values = {}) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { current: page } = pagination;
    handleFiltersChange({ page });
  };

  const userDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    deliveryService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
        setText([]);
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const clientDropAll = () => {
    setLoadingBtn(true);
    userService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const clientRestoreAll = () => {
    setLoadingBtn(true);
    userService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
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
      toast.warning(t('select.user'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const fetch = () => {
    dispatch(fetchClients(params));
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
    <Card>
      <Space wrap>
        <SearchInput
          placeholder={t('search')}
          style={{ width: '250px' }}
          defaultValue={filters.search}
          resetSearch={!filters.search}
          handleChange={(search) => handleFiltersChange({ search, page: 1 })}
        />
        <FilterColumns columns={columns} setColumns={setColumns} />
        {filters.status !== 'deleted_at' ? (
          <>
            <DeleteButton onClick={allDelete}>
              {t('delete.selected')}
            </DeleteButton>
            <DeleteButton onClick={() => setRestore({ delete: true })}>
              {t('delete.all')}
            </DeleteButton>
            <Button
              type='primary'
              icon={<PlusCircleOutlined />}
              onClick={goToAddClient}
            >
              {t('add.client')}
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
        dataSource={clients}
        loading={loading}
        pagination={{
          showSizeChanger: false,
          pageSize: meta?.per_page || 10,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        rowKey={(record) => record?.id}
        onChange={onChangePagination}
      />
      <CustomModal
        click={userDelete}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
      />
      {Boolean(uuid) && (
        <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />
      )}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? clientRestoreAll : clientDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setText}
        />
      )}
    </Card>
  );
};

export default User;
