import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '@/data';
import {
  fetchTracks as requestTracks,
} from '@/lib/api';
import type {
  TrackFilterKey,
  TrackFilterSelection,
  TrackSortOption,
} from '@/lib/trackFilters';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TracksState {
  items: Track[];
  status: RequestStatus;
  error: string | null;
  search: string;
  filters: TrackFilterSelection;
  sortOption: TrackSortOption;
}

const initialState: TracksState = {
  items: [],
  status: 'idle',
  error: null,
  search: '',
  filters: { author: null, year: null, genre: null },
  sortOption: 'default',
};

export const loadTracks = createAsyncThunk<
  Track[],
  void,
  { rejectValue: string }
>('tracks/load', async (_, { rejectWithValue }) => {
  try {
    return await requestTracks();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Не удалось загрузить треки.',
    );
  }
});

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setTrackItems(state, action: PayloadAction<Track[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilter(
      state,
      action: PayloadAction<{ key: TrackFilterKey; value: string | null }>,
    ) {
      state.filters[action.payload.key] = action.payload.value;
    },
    clearFilters(state) {
      state.filters = { author: null, year: null, genre: null };
    },
    setSortOption(state, action: PayloadAction<TrackSortOption>) {
      state.sortOption = action.payload;
    },
    updateTrackFavorite(
      state,
      action: PayloadAction<{
        trackId: number;
        userId: number;
        shouldBeFavorite: boolean;
      }>,
    ) {
      const { trackId, userId, shouldBeFavorite } = action.payload;
      const track = state.items.find((item) => item._id === trackId);
      if (!track) return;

      const likedUsers = track.staredUser ?? [];
      const alreadyLiked = likedUsers.includes(userId);
      if (alreadyLiked === shouldBeFavorite) return;

      track.staredUser = shouldBeFavorite
        ? [...likedUsers, userId]
        : likedUsers.filter((likedUserId) => likedUserId !== userId);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadTracks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadTracks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadTracks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка загрузки';
      });
  },
});

export const {
  clearFilters,
  setFilter,
  setSearch,
  setSortOption,
  setTrackItems,
  updateTrackFavorite,
} = tracksSlice.actions;
export default tracksSlice.reducer;
