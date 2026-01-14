import { useState } from 'react';
import { Form, Button, Space, Divider, Tooltip } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/seller/product';
import { setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IoCloseOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { CustomCard } from 'components/custom-card';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ExtraValueSelectModal from './extra-value-select-modal';
import ExtraSelectModal from './extra-select-modal';

const ProductExtras = ({ prev, isRequest, mode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { uuid, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [extraSelectModalOpen, setExtraSelectModalOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState(
    activeMenu.data?.extras || [],
  );
  const [currentExtra, setCurrentExtra] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const { settings } = useSelector((state) => state.globalSettings);

  const onFinish = () => {
    if (
      selectedExtras.some(
        (selectedExtra) =>
          selectedExtra.values?.length === 0 || !selectedExtra.values,
      )
    ) {
      toast.error(t('please.select.at.least.1.extra.value.for.each.extra'));
      return;
    }
    const extras = selectedExtras.map((selectedExtra) => selectedExtra.value);
    extras.sort((a, b) => a - b);
    let tempState = location.state;
    if (isRequest) {
      dispatch(
        setMenuData({
          activeMenu,
          data: { ...activeMenu.data, extras: selectedExtras },
        }),
      );
      navigate(`/seller/product-request/${id}?step=2`, {
        state: { generate: isChanged },
      });
      return;
    }
    if (
      (isChanged || location.state) &&
      mode === 'edit' &&
      !location.state?.create &&
      settings?.product_auto_approve === '0'
    ) {
      if (location.state) {
        tempState.extras = selectedExtras;
      } else {
        tempState = { ...activeMenu.data, extras: selectedExtras };
      }
      dispatch(
        setMenuData({
          activeMenu,
          data: { ...activeMenu.data, extras: selectedExtras },
        }),
      );
      navigate(`/seller/product/${uuid}?step=2`, { state: tempState });
      return;
    }
    setLoadingBtn(true);
    productService
      .extras(uuid, { extras })
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...activeMenu.data, extras: selectedExtras },
          }),
        );
        navigate(`/seller/product/${uuid}?step=2`, {
          state: { create: location.state?.create },
        });
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleDeleteSelectedExtra = (extra) => {
    setIsChanged(true);
    setSelectedExtras((oldExtras) =>
      oldExtras.filter((oldExtra) => oldExtra.id !== extra.id),
    );
  };

  const handleSelectExtraValue = (extraId, values) => {
    setIsChanged(true);
    setSelectedExtras((oldExtras) =>
      oldExtras.map((oldExtra) => {
        if (oldExtra.value === extraId) {
          const tempValues = values.map((value) => {
            const prevExtras = activeMenu.data?.extras
              ?.flatMap((extra) => extra.values)
              .find((extra) => extra.value === value.value);
            return { ...value, stock_id: prevExtras?.stock_id };
          });
          return { ...oldExtra, values: tempValues };
        }
        return oldExtra;
      }),
    );
  };

  const handleDeleteSelectedExtraValue = (extraId, value) => {
    setIsChanged(true);
    setSelectedExtras((oldExtras) => {
      return oldExtras.map((oldExtra) => {
        if (oldExtra.value === extraId) {
          return {
            ...oldExtra,
            values:
              oldExtra?.values.filter((oldValue) => oldValue.value !== value) ||
              [],
          };
        }
        return oldExtra;
      });
    });
  };

  return (
    <Form
      layout='vertical'
      initialValues={{ ...activeMenu.data }}
      onFinish={onFinish}
    >
      <ExtraSelectModal
        open={extraSelectModalOpen}
        onClose={() => setExtraSelectModalOpen(false)}
        selectedExtras={selectedExtras}
        onSelect={(item) => {
          setIsChanged(true);
          setSelectedExtras((oldExtras) => [...oldExtras, item]);
          setExtraSelectModalOpen(false);
        }}
      />
      <ExtraValueSelectModal
        extra={currentExtra}
        onClose={() => setCurrentExtra(null)}
        onSelect={handleSelectExtraValue}
      />
      <Space className='w-100' size='middle' direction='vertical'>
        {selectedExtras.map((selectedExtra) => (
          <CustomCard key={selectedExtra.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Tooltip title={t('add.more.extra.values')}>
                <Button
                  ghost
                  type='primary'
                  onClick={() => setCurrentExtra(selectedExtra)}
                >
                  {selectedExtra?.label}
                  <PlusOutlined />
                </Button>
              </Tooltip>
              <div
                style={{
                  flex: '1',
                  width: '100%',
                  overflowX: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {selectedExtra?.values?.map((item) => (
                  <div className='extra-value' key={item.value}>
                    <span>{item?.label}</span>
                    <button
                      onClick={() =>
                        handleDeleteSelectedExtraValue(
                          selectedExtra.value,
                          item.value,
                        )
                      }
                      type='button'
                      className='extra-clear'
                    >
                      <IoCloseOutline />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                danger
                type='ghost'
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteSelectedExtra(selectedExtra)}
              />
            </div>
          </CustomCard>
        ))}
      </Space>
      <Button
        onClick={() => setExtraSelectModalOpen(true)}
        className='w-100 my-3'
        type='dashed'
      >
        {t('add.extra')}
      </Button>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={prev}>{t('prev')}</Button>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};
export default ProductExtras;
