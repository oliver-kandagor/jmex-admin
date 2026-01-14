import { lazy, Suspense, useEffect, useState } from 'react';
import { Card, Spin, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import requestModelsService from 'services/seller/request-models';
import useDidUpdate from 'helpers/useDidUpdate';
import Loading from 'components/loading';
import { steps } from './steps';

const { Step } = Steps;

const ProductsIndex = lazy(() => import('./products-index'));
const ProductStock = lazy(() => import('components/forms/product/stock'));
const ProductFinish = lazy(() => import('./product-finish'));

const SellerProductRequestEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryParams = useQueryParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();

  const current = Number(queryParams.values?.step || 0);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };
  const prev = () => {
    const step = current - 1;
    queryParams.set('step', step);
  };

  const fetchProductRequest = () => {
    setLoading(true);
    requestModelsService
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChange = (step) => {
    dispatch(
      setMenuData({ activeMenu, data: { ...(activeMenu.data || {}), step } }),
    );
    queryParams.set('step', step);
  };

  const fetch = () => {
    fetchProductRequest();
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
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.product.request')} extra={<LanguageList />}>
      <Steps
        current={current}
        style={{ marginBottom: '66px' }}
        onChange={onChange}
      >
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      <Suspense fallback={<Loading />}>
        <Spin spinning={loading}>
          {steps[current].content === 'First-content' && (
            <ProductsIndex
              isRequest
              requestData={data}
              actionType='edit'
              next={next}
            />
          )}
          {steps[current].content === 'Third-content' && (
            <ProductStock
              isRequest
              userRole='seller'
              requestData={data}
              data={data?.model}
              next={next}
              prev={prev}
            />
          )}
          {steps[current].content === 'Finish-content' && (
            <ProductFinish
              isRequest
              data={data?.model}
              mainInfoChangedData={data?.data}
              prev={prev}
            />
          )}
        </Spin>
      </Suspense>
    </Card>
  );
};
export default SellerProductRequestEdit;
