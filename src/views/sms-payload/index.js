import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Space, Table } from 'antd';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fetchSms } from 'redux/slices/sms-geteways';
import { useNavigate } from 'react-router-dom';
import { addMenu } from 'redux/slices/menu';
import DeleteButton from 'components/delete-button';
import CustomModal from 'components/modal';
import { toast } from 'react-toastify';
import smsService from 'services/smsPayloads';
import { Context } from 'context/context';

export default function SmsGateways() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { smsGatewaysList, loading } = useSelector(
    (state) => state.sms,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const goToEdit = (type) => {
    dispatch(
      addMenu({
        id: 'sms-payload-edit',
        url: `settings/sms-payload/${type}`,
        name: t('edit.sms.payload'),
      }),
    );
    navigate(`/settings/sms-payload/${type}`);
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'sms-payload-add',
        url: 'settings/sms-payload/add',
        name: t('add.sms.payload'),
      }),
    );
    navigate('/settings/sms-payload/add');
  };

  const handleDelete = () => {
    if (!id) {
      toast.warning(t('select.sms.payload'));
      return;
    }
    setIsDeleting(true);
    const params = {
      'ids[0]': id,
    };
    smsService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsModalVisible(false);
        setIsDeleting(false);
        setId(null);
      });
  };

  const columns = [
    {
      title: t('type'),
      dataIndex: 'type',
      width: '80%',
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row?.type)}
              disabled={row?.deleted_at}
            />
            <DeleteButton
              onClick={() => {
                setId(row?.type);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSms());
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <>
      <Card
        title={t('sms.payload')}
        extra={
          <Space>
            <Button
              type='primary'
              icon={<PlusCircleOutlined />}
              onClick={goToAdd}
            >
              {t('add.sms.payload')}
            </Button>
          </Space>
        }
      >
        <Table
          scroll={{ x: true }}
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={smsGatewaysList}
          pagination={false}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={handleDelete}
        text={t('delete')}
        loading={isDeleting}
      />
    </>
  );
}
