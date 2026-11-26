import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playerReducer from './playerSlice';
import tracksReducer from './tracksSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      player: playerReducer,
      tracks: tracksReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
