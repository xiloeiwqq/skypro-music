import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Selection } from '@/data';
import { fetchSelections as requestSelections } from '@/lib/api';

interface CollectionsState {
  items: Selection[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CollectionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const loadSelections = createAsyncThunk<
  Selection[],
  void,
  { rejectValue: string }
>('collections/load', async (_, { rejectWithValue }) => {
  try {
    const selections = await requestSelections();
    return selections.filter(
      (selection) => selection.name && selection.items.length > 0,
    );
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Не удалось загрузить подборки.',
    );
  }
});

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadSelections.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadSelections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadSelections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка загрузки';
      });
  },
});

export default collectionsSlice.reducer;
