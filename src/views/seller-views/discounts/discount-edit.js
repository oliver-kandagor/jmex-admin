import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form } from 'antd';
import moment from 'moment';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import discountService from 'services/seller/discount';
import { useTranslation } from 'react-i18next';
import createImage from 'helpers/createImage';
import Loading from 'components/loading';
import useDidUpdate from 'helpers/useDidUpdate';
import DiscountForm from './discount-form';

export default function DiscountEdit() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { id } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);

  const fetchDiscount = () => {
    setLoading(true);
    discountService
      .getById(id)
      .then(({ data }) => {
        const values = {
          price: data?.price,
          type: data?.type,
          products: data?.products.map((item) => ({
            label: item?.translation?.title,
            value: item?.id,
            key: item?.id,
          })),
          duration: [
            moment(data?.start, 'YYYY-MM-DD'),
            moment(data?.end, 'YYYY-MM-DD'),
          ],
          image: data?.img ? [createImage(data?.img)] : [],
        };
        form.setFieldsValue(values);
        dispatch(
          setMenuData({
            activeMenu,
            data: values,
          }),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (body) => discountService.update(id, body);

  const fetch = () => {
    fetchDiscount();
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
  }, [activeMenu.refetch, id]);

  return (
    <Card title={t('edit.discount')}>
      {!loading ? (
        <DiscountForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <Loading />
      )}
    </Card>
  );
}
