import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from 'components/language-list';
import branchService from 'services/seller/branch';
import BranchForm from './branch-form';

const SellerBranchAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (body) => {
    const nextUrl = 'seller/branch';
    return branchService.create(body).then(() => {
      toast.success(t('successfully.created'));
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.branch')} extra={<LanguageList />}>
      <BranchForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default SellerBranchAdd;
