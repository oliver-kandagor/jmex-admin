import { Form } from 'antd';
import { DebounceSelect } from 'components/search';
import extraService from 'services/extra';
import sellerExtraService from 'services/seller/extras';

const localExtraService = (role) => {
  switch (role) {
    case 'seller':
      return sellerExtraService;
    default:
      return extraService;
  }
};

export const ProductExtraValues = ({ groups = [], role = 'admin' }) => {
  const fetchExtraValueByGroupId = ({ search, groupId }) => {
    const params = { search: search || undefined, perPage: 20 };
    return localExtraService(role)
      .getGroupById(groupId, params)
      .then((res) =>
        res?.data?.extra_values?.map((item) => ({
          label: item?.value,
          value: item?.id,
          key: item?.id,
        })),
      );
  };

  return (
    <div
      style={{ width: '100%', overflowX: 'auto', display: 'flex', gap: '12px' }}
    >
      {groups?.map((group) => (
        <Form.Item
          label={group?.label}
          name={['extra-values', group?.value]}
          key={group?.value}
          style={{ flex: '1', minWidth: '200px' }}
        >
          <DebounceSelect
            mode='multiple'
            fetchOptions={(props) =>
              fetchExtraValueByGroupId({
                ...(props || {}),
                groupId: group?.value,
              })
            }
          />
        </Form.Item>
      ))}
    </div>
  );
};
