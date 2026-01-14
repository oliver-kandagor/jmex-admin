import { useEffect, useState } from 'react';
import { Card, Spin, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { useParams } from 'react-router-dom';
import productService from 'services/seller/product';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import getLanguageFields from 'helpers/getLanguageFields';
import useDidUpdate from 'helpers/useDidUpdate';
import { steps } from './steps';
import AddonStock from './addons-stock';
import AddonIndex from './addons-index';

const { Step } = Steps;

const AddonEdit = () => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const queryParams = useQueryParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const current = Number(queryParams.values?.step || 0);

  const [loading, setLoading] = useState(activeMenu.refetch);

  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };
  const prev = () => {
    const step = current - 1;
    queryParams.set('step', step);
  };

  const fetchProduct = () => {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        const body = {
          ...getLanguageFields(languages, res?.data, ['title', 'description']),
          unit: {
            label: res?.data?.unit?.translation?.title || t('N/A'),
            value: res?.data?.unit?.id,
            key: res?.data?.unit?.id,
          },
          interval: res?.data?.interval || 1,
          tax: res?.data?.tax,
          min_qty: res?.data?.min_qty,
          max_qty: res?.data?.max_qty,
          active: Boolean(res?.data?.active),
          stocks: res?.data?.stocks || [],
        };
        dispatch(setMenuData({ activeMenu, data: body }));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChange = (step) => {
    dispatch(setMenuData({ activeMenu, data: { ...activeMenu.data, step } }));
    queryParams.set('step', step);
  };

  const fetch = () => {
    fetchProduct();
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    if (uuid) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useDidUpdate(() => {
    if (activeMenu.refetch && uuid) {
      fetch();
    }
  }, [activeMenu.refetch, uuid]);

  return (
    <Card title={t('edit.addon')} extra={<LanguageList />}>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      {!loading ? (
        <div className='steps-content'>
          {steps[current].content === 'First-content' && (
            <AddonIndex next={next} action_type={'edit'} />
          )}

          {steps[current].content === 'Third-content' && (
            <AddonStock prev={prev} current={current} />
          )}
        </div>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};
export default AddonEdit;
