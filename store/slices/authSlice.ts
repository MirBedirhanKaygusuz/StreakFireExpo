import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, User } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const user = await authService.getCurrentUser();
    return user;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const { data } = await authService.signUp(email, password, displayName);
    return await authService.getCurrentUser();
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    await authService.signIn(email, password);
    return await authService.getCurrentUser();
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authService.signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to initialize auth';
        state.isInitialized = true;
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;