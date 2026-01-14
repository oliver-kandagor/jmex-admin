import React, { useEffect, useState } from 'react';
import { Card, Form, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import categoryService from 'services/category';
import LanguageList from 'components/language-list';
import ComboCategoryForm from './form';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { IMG_URL } from 'configs/app-global';
import { disableRefetch, setMenuData } from 'redux/slices/menu';

function EditComboCategory() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const [loading, setLoading] = useState(false);

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.description,
    }));
    return Object.assign({}, ...result);
  }

  const getCategory = (alias) => {
    setLoading(true);
    categoryService
      .getById(alias)
      .then((res) => {
        let category = res.data;

        const body = {
          ...category,
          ...getLanguageFields(category),
          image: createImage(category.img),
          keywords: category.keywords.split(','),
        };

        form.setFieldsValue(body);
        dispatch(setMenuData({ activeMenu, data: body }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getCategory(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const onSubmit = (body) => categoryService.update(uuid, body);
  return (
    <Spin spinning={loading}>
      <Card title={t('edit.combo.category')} extra={<LanguageList />}>
        <ComboCategoryForm key={loading} form={form} onSubmit={onSubmit} />
      </Card>
    </Spin>
  );
}

export default EditComboCategory;
