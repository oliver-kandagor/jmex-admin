import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/category';

const initialState = {
  loading: false,
  categories: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    type: 'shop',
  },
  meta: {},
};

export const fetchShopCategories = createAsyncThunk(
  'category/fetchShopCategories',
  (params = {}) => {
    return categoryService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

const shopCategorySlice = createSlice({
  name: 'shop-category',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchShopCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShopCategories.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.categories = payload?.data;
      state.meta = payload?.meta;
      state.params.page = payload?.meta?.current_page;
      state.params.perPage = payload?.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchShopCategories.rejected, (state, action) => {
      state.loading = false;
      state.categories = [];
      state.error = action?.error?.message;
    });
  },
});

export default shopCategorySlice.reducer;
