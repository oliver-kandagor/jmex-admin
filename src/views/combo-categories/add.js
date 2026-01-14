import React from 'react';
import { Card, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import categoryService from 'services/category';
import LanguageList from 'components/language-list';
import ComboCategoryForm from './form';

function AddComboCategory() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onSubmit = (body) => categoryService.create(body);

  return (
    <Card title={t('add.combo.category')} extra={<LanguageList />}>
      <ComboCategoryForm form={form} onSubmit={onSubmit} />
    </Card>
  );
}

export default AddComboCategory;
