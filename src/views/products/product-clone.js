import { useEffect, useState } from 'react';
import { Card, Spin, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { useParams } from 'react-router-dom';
import productService from 'services/product';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import useDidUpdate from 'helpers/useDidUpdate';
import { steps } from './steps';
import ProductsIndex from './products-index';

const { Step } = Steps;

const ProductsClone = () => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const queryParams = useQueryParams();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const current = Number(queryParams.values?.step || 0);

  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };

  const fetchProduct = (uuid) => {
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

  useEffect(() => {
    fetchProduct(uuid);
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchProduct(uuid);
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  return (
    <>
      <Card title={t('clone.product')} extra={<LanguageList />}>
        <Steps current={current} style={{ marginBottom: '66px' }}>
          {steps.map((item) => (
            <Step title={t(item.title)} key={item.title} />
          ))}
        </Steps>

        <Spin spinning={loading}>
          {steps[current].content === 'First-content' && (
            <ProductsIndex data={data} next={next} />
          )}
        </Spin>
      </Card>
    </>
  );
};
export default ProductsClone;
