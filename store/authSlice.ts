import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest, getRequestError } from '@/lib/api';
import type { ApiResponse, AuthUser } from '@/lib/types';

interface Credentials {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const signIn = createAsyncThunk<
  AuthUser,
  Credentials,
  { rejectValue: string }
>('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiRequest<ApiResponse<AuthUser>>('/user/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (!response.success || !response.data) {
      return rejectWithValue('Не удалось войти в аккаунт');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(getRequestError(error));
  }
});

export const signUp = createAsyncThunk<
  AuthUser,
  Credentials,
  { rejectValue: string }
>('auth/signUp', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiRequest<ApiResponse<AuthUser>>('/user/signup/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (!response.success || !response.data) {
      return rejectWithValue('Не удалось создать аккаунт');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(getRequestError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка входа';
      })
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка регистрации';
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
