import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Spin, Steps } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from 'components/language-list';
import recipeService from 'services/seller/reciept';
import getLanguageFields from 'helpers/getLanguageFields';
import useDidUpdate from 'helpers/useDidUpdate';
import getTranslationFields from 'helpers/getTranslationFields';
import { steps } from './steps';

const { Step } = Steps;

const createImage = (name) => {
  return {
    name,
    url: name,
  };
};

const ReceiptEdit = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.galleries?.[0]
      ? [createImage(activeMenu.data?.galleries?.[0]?.path)]
      : [],
  );
  const [back, setBack] = useState(
    activeMenu.data?.galleries?.[1]
      ? [createImage(activeMenu.data?.galleries?.[1]?.path)]
      : [],
  );

  const next = () => {
    const step = current + 1;
    setCurrent(step);
  };

  const prev = () => {
    const step = current - 1;
    setCurrent(step);
  };

  const fetchBox = () => {
    setLoading(true);
    recipeService
      .getById(id)
      .then((res) => {
        let recept = res.data;
        form.setFieldsValue({
          ...recept,
          ...getLanguageFields(languages, recept, ['title', 'description']),
          instruction: Object.assign(
            {},
            ...recept.instructions.map((ins) => ({
              [ins.locale]: ins.title,
            })),
          ),
          ingredient: Object.assign(
            {},
            ...recept?.ingredients.map((ing) => ({
              [ing.locale]: ing.title,
            })),
          ),
          nutrition: recept?.nutritions?.map((nutrition) => ({
            percentage: Number(nutrition?.percentage),
            weight: Number(nutrition?.weight),
            ...Object.assign(
              {},
              ...nutrition?.translations?.flatMap((translation) => ({
                [translation?.locale]: translation?.title,
              })),
            ),
          })),
          category_id: {
            value: recept?.category?.id,
            label: recept?.category?.translation?.title,
          },
          stocks: recept?.stocks?.map((item) => ({
            ...item,
            stock_id: {
              value: item?.id,
              label: item?.product?.translation?.title,
            },
          })),
        });
        setImage(
          recept?.galleries?.[0]?.path?.length
            ? [createImage(recept?.galleries?.[0]?.path)]
            : [],
        );
        setBack(
          recept?.galleries?.[1]?.path?.length
            ? [createImage(recept?.galleries?.[1]?.path)]
            : [],
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinish = (values) => {
    form.validateFields();
    const body = {
      ...values,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      category_id: values?.category_id?.value,
      images: [...(image || []), ...(back || [])]?.map((img) => img?.name),
      active_time: values?.active_time?.toString(),
      total_time: values?.total_time?.toString(),
      nutrition: values?.nutrition?.map((item) => ({
        ...item,
        percentage: String(item?.percentage),
        weight: String(item?.weight),
      })),
      stocks: values?.stocks?.map((stock) => ({
        min_quantity: stock?.min_quantity,
        stock_id: stock?.stock_id?.value,
      })),
    };

    setLoadingBtn(true);
    const nextUrl = 'seller/recept';
    recipeService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        navigate(`/${nextUrl}`);
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetch = () => {
    fetchBox();
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    if (id) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && id) {
      fetch();
    }
  }, [id, activeMenu.refetch]);

  return (
    <Card title={t('edit.recipe')} extra={<LanguageList />}>
      {!loading ? (
        <Form
          layout='vertical'
          onFinish={onFinish}
          form={form}
          initialValues={{ active: true, ...activeMenu.data }}
        >
          <Steps current={current} onChange={(item) => setCurrent(item)}>
            {steps.map((item) => (
              <Step title={t(item.title)} key={item.title} />
            ))}
          </Steps>
          {steps.map((item) => {
            const Component = item.content;
            return (
              <div
                key={item.title}
                className={`steps-content ${
                  item.step !== current + 1 && 'hidden'
                }`}
              >
                <Component
                  next={next}
                  prev={prev}
                  loading={loadingBtn}
                  image={image}
                  setImage={setImage}
                  back={back}
                  setBack={setBack}
                />
              </div>
            );
          })}
        </Form>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default ReceiptEdit;
