import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiRequest, getRequestError } from '@/lib/api';
import type { ApiResponse, Track } from '@/lib/types';

interface TracksState {
  items: Track[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
  filters: {
    author: string;
    year: string;
    genre: string;
  };
}

const initialState: TracksState = {
  items: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  filters: {
    author: '',
    year: '',
    genre: '',
  },
};

export const fetchTracks = createAsyncThunk<
  Track[],
  void,
  { rejectValue: string }
>('tracks/fetchTracks', async (_, { rejectWithValue }) => {
  try {
    const response = await apiRequest<ApiResponse<Track[]>>(
      '/catalog/track/all/',
    );
    if (!response.success || !Array.isArray(response.data)) {
      return rejectWithValue('Не удалось загрузить список треков');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(getRequestError(error));
  }
});

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setFilter(
      state,
      action: PayloadAction<{ key: keyof TracksState['filters']; value: string }>,
    ) {
      state.filters[action.payload.key] = action.payload.value;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка загрузки';
      });
  },
});

export const { setSearchTerm, setFilter } = tracksSlice.actions;
export default tracksSlice.reducer;
