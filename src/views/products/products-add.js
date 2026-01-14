import { useState } from 'react';
import { Card, Steps } from 'antd';
import LanguageList from 'components/language-list';
import { useTranslation } from 'react-i18next';
import { steps } from './steps';
import ProductsIndex from './products-index';

const { Step } = Steps;

const ProductsAdd = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const next = () => {
    const step = current + 1;
    setCurrent(step);
  };

  return (
    <>
      <Card title={t('add.product')} extra={<LanguageList />}>
        <Steps current={current} style={{ marginBottom: '66px' }}>
          {steps.map((item) => (
            <Step title={t(item.title)} key={item.title} />
          ))}
        </Steps>
        {steps[current].content === 'First-content' && (
          <ProductsIndex next={next} />
        )}
      </Card>
    </>
  );
};
export default ProductsAdd;
