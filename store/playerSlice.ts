import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '@/lib/types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack(state, action: PayloadAction<Track>) {
      state.currentTrack = action.payload;
      state.error = null;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
      state.error = null;
    },
    setPlaybackError(state, action: PayloadAction<string>) {
      state.isPlaying = false;
      state.error = action.payload;
    },
  },
});

export const { setCurrentTrack, setIsPlaying, setPlaybackError } =
  playerSlice.actions;
export default playerSlice.reducer;
