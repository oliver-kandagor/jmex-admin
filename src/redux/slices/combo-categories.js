import categoryService from 'services/category';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  categories: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    type: 'combo',
  },
  meta: {},
};

export const fetchComboCategories = createAsyncThunk(
  'comboCategories/fetchComboCategories',
  (params = {}) => {
    return categoryService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

const comboCategoriesSlice = createSlice({
  name: 'comboCategories',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchComboCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchComboCategories.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.categories = payload?.data;
      state.meta = payload?.meta;
      state.params.page = payload?.meta?.current_page;
      state.params.perPage = payload?.meta?.per_page;
      state.error = '';
    });
    builder.addCase(fetchComboCategories.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action?.error?.message || 'Failed to fetch combo categories';
      state.categories = [];
    });
  },
});

export default comboCategoriesSlice.reducer;
