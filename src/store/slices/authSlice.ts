import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  streakProtections: number;
  referralCode: string;
  createdAt: string; 
}


interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    // Mock implementation
    const userData: User = {
      id: 'mock-user-id',
      email,
      displayName,
      isPremium: false,
      streakProtections: 3,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('userId', userData.id);
    return userData;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    // Mock implementation
    const userData: User = {
      id: 'mock-user-id',
      email,
      displayName: 'Mock User',
      isPremium: false,
      streakProtections: 3,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('userId', userData.id);
    return userData;
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await AsyncStorage.removeItem('userId');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const { updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
