import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, User } from '@/data';
import { loginUser, registerUser } from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface Credentials {
  email: string;
  password: string;
}

interface RegistrationData extends Credentials {
  username: string;
}

interface AuthState {
  user: User | null;
  loginStatus: RequestStatus;
  registrationStatus: RequestStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loginStatus: 'idle',
  registrationStatus: 'idle',
  error: null,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Не удалось выполнить запрос. Попробуйте ещё раз.';
}

export const logIn = createAsyncThunk<
  AuthSession,
  Credentials,
  { rejectValue: string }
>('auth/logIn', async (credentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials.email, credentials.password);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const register = createAsyncThunk<
  User,
  RegistrationData,
  { rejectValue: string }
>('auth/register', async (registrationData, { rejectWithValue }) => {
  try {
    return await registerUser(registrationData);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    logOut(state) {
      state.user = null;
      state.loginStatus = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(logIn.pending, (state) => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.user = action.payload.user;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Ошибка входа';
      })
      .addCase(register.pending, (state) => {
        state.registrationStatus = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.registrationStatus = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.registrationStatus = 'failed';
        state.error =
          action.payload ?? action.error.message ?? 'Ошибка регистрации';
      });
  },
});

export const { clearAuthError, logOut, setUser } = authSlice.actions;
export default authSlice.reducer;
