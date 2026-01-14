import { Button, Collapse, Divider, Form, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService from 'services/product';
import sellerProductService from 'services/seller/product';
import cartesian from 'helpers/cartesian';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import useDidUpdate from 'helpers/useDidUpdate';
import {
  resetDeletedIds,
  resetFilteredStocks,
  resetFilters,
  resetFormStocks,
  setFormStocks,
} from 'redux/slices/product';
import { useTranslation } from 'react-i18next';
import { getUpdatedStocks } from 'helpers/product-stock';
import { setRefetch } from 'redux/slices/menu';
import { checkIsTrueValue } from 'helpers/checkIsTrueValue';
import requestModelsService from 'services/request-models';
import sellerRequestModelsService from 'services/seller/request-models';
import SetAll from './set-all';
import ProductStockFilter from './filter';
import { ProductStockTable } from './table';
import { ProductExtraGroups } from './extra-groups';
import { ProductExtraValues } from './extra-values';

const localProductService = (userRole) => {
  switch (userRole) {
    case 'seller':
      return sellerProductService;
    default:
      return productService;
  }
};

const localRequestModelsService = (userRole) => {
  switch (userRole) {
    case 'seller':
      return sellerRequestModelsService;
    default:
      return requestModelsService;
  }
};

const StockForm = ({
  data,
  mainInfoChangedData,
  isRequest,
  requestData,
  userRole = 'admin',
  next,
  prev,
  onMainInfoChanged,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const [form] = Form.useForm();

  const { stocks, filters } = useSelector(
    (state) => state.product.form,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { settings } = useSelector((state) => state.globalSettings);

  const [loadingBtn, setLoadingBtn] = useState(false);

  const groupedExtras = useMemo(() => {
    if (data?.stocks) {
      return data?.stocks?.reduce((acc, stock) => {
        stock?.extras?.forEach((extra) => {
          if (
            extra?.group &&
            acc.every((item) => item?.group?.id !== extra?.group?.id)
          ) {
            acc.push({ group: extra?.group, values: [] });
          }
          const groupIndex = acc.findIndex(
            (item) => item?.group?.id === extra?.group?.id,
          );
          if (
            acc[groupIndex]?.values?.every((value) => value?.id !== extra?.id)
          ) {
            acc[groupIndex]?.values?.push({
              id: extra?.id,
              value: extra?.value,
            });
          }
        });
        return acc;
      }, []);
    }
    return [];
  }, [data?.stocks]);

  const selectedStocks = Form.useWatch('stocks', form);
  const selectedExtraGroups = Form.useWatch('extra-groups', form);
  const selectedExtraValues = Form.useWatch('extra-values', form);

  const fetchAddonOptions = async (search) => {
    const params = {
      search: search || undefined,
      addon: 1,
      shop_id: data?.shop?.id,
      'statuses[0]': 'published',
      'statuses[1]': 'pending',
      active: 1,
    };
    const addons =
      (await localProductService(userRole)
        .getAll(params)
        .then((res) =>
          res?.data?.map((item) => ({
            label: item?.translation?.title,
            value: item?.id,
            key: item?.id,
          })),
        )) || [];

    return addons?.length
      ? [{ label: t('all.addons'), value: 'all', key: 'all' }, ...addons]
      : [];
  };

  const handleExtraGroupsChange = (value) => {
    batch(() => {
      dispatch(resetFilters());
      dispatch(resetFilteredStocks());
      dispatch(resetFormStocks());
      dispatch(resetDeletedIds());
    });
    form.setFieldsValue({
      'extra-groups': value,
      'extra-values': [],
      stocks: [{}],
    });
  };

  const handleGenerateVariations = () => {
    const extras = selectedExtraGroups?.map((extraGroup) =>
      selectedExtraValues?.[extraGroup?.value]?.map((item) => ({
        id: item?.value,
        value: item?.label,
      })),
    );
    const extraVariations = cartesian(extras);
    const isExtrasLengthSame =
      extraVariations?.[0]?.length === selectedStocks?.[0]?.extras?.length;

    const variations = extraVariations?.map((extraVariation) => {
      const variation = {
        addons: [],
        extras: extraVariation?.map((item) => ({
          label: item?.value,
          value: item?.id,
          key: item?.id,
        })),
        price: 0,
        quantity: 0,
        sku: '',
        tax: selectedStocks?.[0]?.tax || 0,
        total_price: 0,
      };
      if (isExtrasLengthSame) {
        const existingStock = selectedStocks?.find((stock) =>
          stock?.extras?.every((extra) =>
            extraVariation?.some((item) => item?.id === extra?.value),
          ),
        );
        if (existingStock) {
          return existingStock;
        }
      }
      return variation;
    });
    dispatch(setFormStocks(variations));
    form.setFieldsValue({ stocks: variations });
  };

  const onUpdateSuccess = () => {
    next();
    dispatch(setRefetch(activeMenu));
    batch(() => {
      dispatch(resetFilters());
      dispatch(resetFilteredStocks());
      dispatch(resetFormStocks());
      dispatch(resetDeletedIds());
    });
  };

  const productRequestUpdate = (body) =>
    localRequestModelsService(userRole).requestChangeUpdate(requestData?.id, {
      id: requestData?.model_id,
      type: 'product',
      data: body,
    });

  const onFinish = (values) => {
    const actualStocks = Boolean(Object.values(filters)?.length)
      ? getUpdatedStocks(values?.stocks, stocks, [])
      : values?.stocks;
    const body = {
      delete_ids: [],
      extras: actualStocks?.map((stock) => ({
        addons: stock?.addons?.map((addon) => addon?.value),
        ids: stock?.extras?.map((extra) => extra?.value),
        price: stock?.price || 0,
        quantity: stock?.quantity || 0,
        sku: stock?.sku,
      })),
    };
    if (isRequest) {
      setLoadingBtn(true);
      productRequestUpdate({
        ...(requestData?.data || {}),
        ...(values || {}),
      })
        .then(() => {
          onUpdateSuccess();
        })
        .finally(() => {
          setLoadingBtn(false);
        });
      return;
    }
    // START CHECKING IF EXTRAS CHANGED
    if (
      userRole === 'seller' &&
      !checkIsTrueValue(settings?.product_auto_approve)
    ) {
      const allExtrasInServer = groupedExtras?.flatMap((item) => item?.values);
      const allExtrasInForm = values?.['extra-values']?.flat(1);
      const isExtrasChanged =
        allExtrasInServer?.length !== allExtrasInForm?.length ||
        allExtrasInServer?.some((extra) =>
          allExtrasInForm?.every((item) => item?.value !== extra?.id),
        );
      const requestBody = {
        isExtrasChanged,
        'extra-groups': values?.['extra-groups'],
        'extra-values': values?.['extra-values'],
        stocks: values?.stocks,
        ...body,
      };
      onMainInfoChanged(requestBody);
      if (isExtrasChanged) {
        next();
        return;
      }
    }
    // END CHECKING IF EXTRAS CHANGED
    setLoadingBtn(true);
    localProductService(userRole)
      .stocks(uuid, body)
      .then(() => {
        onUpdateSuccess();
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  useEffect(() => {
    if (isRequest) {
      const mainData =
        requestData?.data?.stocks?.length &&
        requestData?.data?.['extra-groups']?.length &&
        requestData?.data?.['extra-values']?.length
          ? requestData?.data
          : null;
      if (mainData) {
        batch(() => {
          dispatch(setFormStocks(mainData?.stocks || []));
          dispatch(resetDeletedIds());
          dispatch(resetFilters());
          dispatch(resetFilteredStocks());
        });
        form.setFieldsValue({
          'extra-groups': mainData?.['extra-groups'],
          'extra-values': mainData?.['extra-values'],
          stocks: mainData?.stocks || [],
        });
        return;
      }
    }
    if (
      mainInfoChangedData?.stocks?.length &&
      mainInfoChangedData?.['extra-groups']?.length &&
      mainInfoChangedData?.['extra-values']?.length
    ) {
      batch(() => {
        dispatch(setFormStocks(mainInfoChangedData?.stocks || []));
        dispatch(resetDeletedIds());
        dispatch(resetFilters());
        dispatch(resetFilteredStocks());
      });
      form.setFieldsValue({
        'extra-groups': mainInfoChangedData?.['extra-groups'],
        'extra-values': mainInfoChangedData?.['extra-values'],
        stocks: mainInfoChangedData?.stocks || [],
      });
      return;
    }
    if (data) {
      const extraVariations = cartesian(
        groupedExtras?.map((groupedExtra) => groupedExtra?.values || []),
      );
      const variations = extraVariations?.length
        ? extraVariations?.map((extraVariation) => {
            const existingStock = data?.stocks?.find(
              (stock) =>
                extraVariation?.length === stock?.extras?.length &&
                stock?.extras?.every((extra) =>
                  extraVariation?.some((item) => item?.id === extra?.id),
                ),
            );
            return {
              addons: existingStock?.addons?.length
                ? existingStock?.addons?.map((addon) => ({
                    label: addon?.product?.translation?.title,
                    value: addon?.addon_id,
                    key: addon?.addon_id,
                  }))
                : [],
              sku: existingStock?.sku || '',
              quantity: existingStock?.quantity || 0,
              price: existingStock?.price || 0,
              tax: data?.tax || 0,
              total_price: existingStock?.total_price || 0,
              extras: extraVariation?.length
                ? extraVariation?.map((item) => ({
                    label: item?.value,
                    value: item?.id,
                    key: item?.id,
                  }))
                : [],
            };
          })
        : data?.stocks?.map((stock) => ({
            addons: stock?.addons?.length
              ? stock?.addons?.map((addon) => ({
                  label: addon?.product?.translation?.title || t('N/A'),
                  value: addon?.addon_id,
                  key: addon?.addon_id,
                }))
              : [],
            quantity: stock?.quantity || 0,
            price: stock?.price || 0,
            sku: stock?.sku || '',
            tax: data?.tax || 0,
            total_price: stock?.total_price || 0,
            extras: stock?.extras?.length
              ? stock?.extras?.map((extra) => ({
                  label: extra?.value,
                  value: extra?.id,
                  key: extra?.id,
                }))
              : [],
          }));
      batch(() => {
        dispatch(setFormStocks(variations));
        dispatch(resetDeletedIds());
        dispatch(resetFilters());
        dispatch(resetFilteredStocks());
      });
      form.setFieldsValue({
        'extra-groups': groupedExtras?.map((item) => ({
          label: item?.group?.translation?.title,
          value: item?.group?.id,
          key: item?.group?.id,
        })),
        'extra-values': groupedExtras?.reduce((acc, groupedExtra) => {
          acc[groupedExtra?.group?.id] = groupedExtra?.values?.map((value) => ({
            label: value?.value,
            value: value?.id,
            key: value?.id,
          }));
          return acc;
        }, {}),
        stocks: variations?.length
          ? variations
          : [
              {
                extras: [],
                addons: [],
                sku: data?.sku || '',
                quantity: 0,
                price: 0,
                tax: data?.tax || 0,
                total_price: 0,
              },
            ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mainInfoChangedData]);

  useDidUpdate(() => {
    if (selectedExtraGroups?.length) {
      handleGenerateVariations();
    }
  }, [selectedExtraValues]);

  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <div className='d-flex flex-column' style={{ gap: 20 }}>
        <Collapse>
          <Collapse.Panel key='set.input.fields' header={t('set.input.fields')}>
            <SetAll
              data={data}
              form={form}
              fetchAddonOptions={fetchAddonOptions}
            />
          </Collapse.Panel>
        </Collapse>
        <Collapse>
          <Collapse.Panel key='filters' header={t('filters')}>
            <ProductStockFilter
              form={form}
              extraGroups={selectedExtraGroups}
              extraValues={selectedExtraValues}
            />
          </Collapse.Panel>
        </Collapse>
        <ProductExtraGroups
          role={userRole}
          onChange={handleExtraGroupsChange}
        />
        <ProductExtraValues groups={selectedExtraGroups} role={userRole} />
        <Form.List name='stocks'>
          {(fields) => (
            <ProductStockTable
              data={data}
              fields={fields}
              onFetchAddons={fetchAddonOptions}
            />
          )}
        </Form.List>
      </div>
      <Divider />
      <Space className='w-100 justify-content-end'>
        <Button onClick={prev}>{t('prev')}</Button>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};

export default StockForm;
