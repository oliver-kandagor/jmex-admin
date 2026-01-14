import { Descriptions, Modal, Image, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import extraService from 'services/seller/extras';

export default function ExtraGroupShowModal({ open, handleClose }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExtraValue = () => {
    setLoading(true);
    extraService
      .getGroupById(open)
      .then((res) => {
        setData(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExtraValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      closable={false}
      visible={open}
      footer={null}
      centered
      onCancel={handleClose}
    >
      {!loading ? (
        <Descriptions title={`${t('extra.group.value')}`} bordered>
          {data?.extra_values?.length ? (
            data?.extra_values?.map((item, index) => (
              <Descriptions.Item
                key={index}
                label={data.translation?.title}
                span={3}
              >
                {data?.type === 'text' ? (
                  item?.value
                ) : data.type === 'image' ? (
                  <Image
                    src={item?.value}
                    alt='images'
                    width={100}
                    height={80}
                  />
                ) : (
                  <Space>
                    <div
                      className='extra-color-wrapper-contain'
                      style={{ backgroundColor: item?.value }}
                    />
                    {item?.value}
                  </Space>
                )}
              </Descriptions.Item>
            ))
          ) : (
            <Typography.Text>{t('not.used')}</Typography.Text>
          )}
        </Descriptions>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
