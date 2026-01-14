import { useState, useEffect } from 'react';
import { Card, Form, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LanguageList from 'components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu, setMenuData } from 'redux/slices/menu';
import categoryService from 'services/category';
import { useTranslation } from 'react-i18next';
import getTranslationFields from 'helpers/getTranslationFields';
import createImage from 'helpers/createImage';
import getLanguageFields from 'helpers/getLanguageFields';
import useDidUpdate from 'helpers/useDidUpdate';
import RecipeCategoryForm from './category-form';

const RecipeCategoryClone = () => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);

  const getCategory = () => {
    setLoading(true);
    categoryService
      .getById(uuid)
      .then((res) => {
        const category = res?.data;
        const body = {
          ...category,
          ...getLanguageFields(languages, category, ['title', 'description']),
          image: category?.img?.length ? [createImage(category?.img)] : [],
          keywords: category?.keywords?.split(','),
          input: category?.input ?? 32767,
          active: !!category?.active,
        };
        dispatch(setMenuData({ activeMenu, data: body }));
        form.setFieldsValue(body);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (values, image) => {
    const body = {
      type: 'receipt',
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      keywords: values?.keywords?.join(','),
      input: values?.input ?? 0,
      images: image?.map((item) => item?.name),
      active: values?.active ? 1 : 0,
      parent_id: undefined,
    };
    const nextUrl = 'catalog/recipe-categories';

    return categoryService.create(body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      });
      navigate(`/${nextUrl}`);
    });
  };

  const fetch = () => {
    getCategory();
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('clone.recipe.category')} extra={<LanguageList />}>
      {!loading ? (
        <RecipeCategoryForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' className='mt-5 pt-5' />
        </div>
      )}
    </Card>
  );
};
export default RecipeCategoryClone;
