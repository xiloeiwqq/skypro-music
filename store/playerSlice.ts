import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '@/data';

interface PlayerState {
  currentTrack: Track | null;
  currentPlaylist: Track[];
  isPlaying: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackError: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  currentPlaylist: [],
  isPlaying: false,
  isLoop: false,
  isShuffle: false,
  volume: 0.5,
  currentTime: 0,
  duration: 0,
  playbackError: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack(state, action: PayloadAction<Track | null>) {
      state.currentTrack = action.payload;
    },
    setCurrentPlaylist(state, action: PayloadAction<Track[]>) {
      state.currentPlaylist = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setIsLoop(state, action: PayloadAction<boolean>) {
      state.isLoop = action.payload;
    },
    setIsShuffle(state, action: PayloadAction<boolean>) {
      state.isShuffle = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setPlaybackError(state, action: PayloadAction<string | null>) {
      state.playbackError = action.payload;
    },
    updateCurrentTrackFavorite(
      state,
      action: PayloadAction<{
        trackId: number;
        userId: number;
        shouldBeFavorite: boolean;
      }>,
    ) {
      const { trackId, userId, shouldBeFavorite } = action.payload;
      if (state.currentTrack?._id !== trackId) return;

      const likedUsers = state.currentTrack.staredUser ?? [];
      const alreadyLiked = likedUsers.includes(userId);
      if (alreadyLiked === shouldBeFavorite) return;

      state.currentTrack.staredUser = shouldBeFavorite
        ? [...likedUsers, userId]
        : likedUsers.filter((likedUserId) => likedUserId !== userId);
    },
  },
});

export const {
  setCurrentPlaylist,
  setCurrentTime,
  setCurrentTrack,
  setDuration,
  setIsLoop,
  setIsPlaying,
  setIsShuffle,
  setPlaybackError,
  setVolume,
  updateCurrentTrackFavorite,
} = playerSlice.actions;
export default playerSlice.reducer;
