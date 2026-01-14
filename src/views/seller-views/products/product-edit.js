import { lazy, Suspense, useEffect, useState } from 'react';
import { Card, Spin, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { useParams } from 'react-router-dom';
import productService from 'services/seller/product';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import useDidUpdate from 'helpers/useDidUpdate';
import Loading from 'components/loading';
import { steps } from './steps';

const { Step } = Steps;

const ProductsIndex = lazy(() => import('./products-index'));
const ProductStock = lazy(() => import('components/forms/product/stock'));
const ProductFinish = lazy(() => import('./product-finish'));

const SellerProductEdit = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryParams = useQueryParams();
  const { uuid } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [mainInfoChangedData, setMainInfoChangedData] = useState({
    isMainInfoChanged: false,
    isExtrasChanged: false,
  });

  const current = Number(queryParams.values?.step || 0);

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

  useEffect(() => {
    fetchProduct();
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchProduct();
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.product')} extra={<LanguageList />}>
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
              actionType='edit'
              data={data}
              mainInfoChangedData={mainInfoChangedData}
              onMainInfoChanged={(data) =>
                setMainInfoChangedData((prev) => ({ ...(prev || {}), ...data }))
              }
              next={next}
            />
          )}
          {steps[current].content === 'Third-content' && (
            <ProductStock
              userRole='seller'
              data={data}
              mainInfoChangedData={mainInfoChangedData}
              next={next}
              prev={prev}
              onMainInfoChanged={(data) =>
                setMainInfoChangedData((prev) => ({ ...(prev || {}), ...data }))
              }
            />
          )}
          {steps[current].content === 'Finish-content' && (
            <ProductFinish
              actionType='edit'
              data={data}
              mainInfoChangedData={mainInfoChangedData}
              prev={prev}
            />
          )}
        </Spin>
      </Suspense>
    </Card>
  );
};
export default SellerProductEdit;
