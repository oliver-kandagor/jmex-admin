import { Card, Form } from 'antd';
import discountService from 'services/seller/discount';
import { useTranslation } from 'react-i18next';
import DiscountForm from './discount-form';

export default function DiscountAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = (body) => discountService.create(body);

  return (
    <Card title={t('add.discount')}>
      <DiscountForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
