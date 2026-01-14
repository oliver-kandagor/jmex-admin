import { InfiniteSelect } from 'components/infinite-select';
import extraService from 'services/extra';
import sellerExtraService from 'services/seller/extras';
import { useState } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';

const localExtraService = (role) => {
  switch (role) {
    case 'seller':
      return sellerExtraService;
    default:
      return extraService;
  }
};

export const ProductExtraGroups = ({ role = 'admin', onChange }) => {
  const { t } = useTranslation();

  const [hasMore, setHasMore] = useState(false);

  const fetchExtraGroups = ({ search, page }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return localExtraService(role)
      .getAllGroups(params)
      .then((res) => {
        setHasMore(res?.meta?.current_page < res?.meta?.last_page);
        return res?.data?.map((item) => ({
          label: item?.translation?.title,
          value: item?.id,
          key: JSON.stringify({ shop_id: item?.shop_id, id: item?.id }),
        }));
      });
  };

  return (
    <Form.Item name='extra-groups' label={t('extra.groups')}>
      <InfiniteSelect
        mode='multiple'
        hasMore={hasMore}
        fetchOptions={fetchExtraGroups}
        onChange={onChange}
      />
    </Form.Item>
  );
};
