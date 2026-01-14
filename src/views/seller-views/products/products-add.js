import { useState } from 'react';
import { Card, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { steps } from './steps';
import ProductsIndex from './products-index';

const { Step } = Steps;

const SellerProductAdd = () => {
  const { t } = useTranslation();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [current, setCurrent] = useState(activeMenu.data?.step || 0);

  const next = () => {
    const step = current + 1;
    setCurrent(step);
  };

  return (
    <Card title={t('add.product')} extra={<LanguageList />}>
      <Steps current={current} style={{ marginBottom: '66px' }}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>

      <div>
        {steps[current].content === 'First-content' && (
          <ProductsIndex next={next} />
        )}
      </div>
    </Card>
  );
};
export default SellerProductAdd;
