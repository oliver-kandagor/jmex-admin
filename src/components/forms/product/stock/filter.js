import { Button, Col, Form, Row, Select } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  setFilters,
  setFilteredStocks,
  resetFilters,
  resetFilteredStocks,
  deleteFilter,
  updateFormStocks,
} from 'redux/slices/product';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';

const ProductStockFilter = ({ extraGroups, extraValues, form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { filters, stocks, filteredStocks } = useSelector(
    (state) => state.product.form,
    shallowEqual,
  );
  // handles reset set all form fields
  const handleClearSetAll = () => {
    form.setFieldsValue({
      all_sku: null,
      all_quantity: null,
      all_price: null,
      all_addon: [],
    });
  };
  // handle filter changes
  const handleChange = (group, value) => {
    // updating form changes to stocks state
    const fieldValues = form.getFieldsValue()?.stocks;
    if (fieldValues?.length) {
      dispatch(updateFormStocks(fieldValues));
    }
    // filtering
    if (!value) {
      if (Object.values(filters)?.length === 1) {
        handleClearFilter(false);
        return;
      }
      dispatch(deleteFilter(group?.value));
      return;
    }
    dispatch(setFilters({ [group?.value]: value }));
    handleClearSetAll();
  };
  // reset filters to initial state
  const handleClearFilter = (withUpdateStocks = true) => {
    const fieldValues = form.getFieldsValue()?.stocks;
    batch(() => {
      if (fieldValues?.length && withUpdateStocks) {
        dispatch(updateFormStocks(fieldValues));
      }
      dispatch(resetFilters());
      dispatch(resetFilteredStocks());
    });
    // reset set all form fields
    handleClearSetAll();
  };
  // updating filtered stocks
  useDidUpdate(() => {
    if (!Object.values(filters)?.length) {
      return;
    }
    const localeFilteredStocks = stocks?.filter((stock) =>
      Object.values(filters)?.every((filter) =>
        stock?.extras?.find((extra) => extra?.value === filter?.value),
      ),
    );
    dispatch(setFilteredStocks(localeFilteredStocks));
  }, [filters, stocks]);

  // setting filtered stocks data to form to show user
  useDidUpdate(() => {
    form.setFieldsValue({
      stocks: Object.values(filters)?.length ? filteredStocks : stocks,
    });
  }, [filteredStocks]);

  return (
    <>
      <Row gutter={12}>
        {extraGroups?.map((group) => (
          <Col style={{ width: 250 }} key={group?.value}>
            <Form.Item label={group?.label}>
              <Select
                allowClear
                labelInValue
                options={extraValues?.[group?.value] || []}
                value={filters?.[group?.value]?.value}
                onChange={(value) => handleChange(group, value)}
              />
            </Form.Item>
          </Col>
        ))}
        <Col>
          <Form.Item label=' '>
            <Button onClick={handleClearFilter}>{t('clear.filter')}</Button>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default ProductStockFilter;
