import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

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

// Referral kodu oluştur
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Kullanıcı profili oluştur
    if (authData.user) {
      const referralCode = generateReferralCode();
      
      const { error: profileError } = await supabase.from('user_profiles').insert([{
        user_id: authData.user.id,
        username: email.split('@')[0],
        display_name: displayName,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      }]);

      if (profileError) throw profileError;

      // Kullanıcı puanları oluştur
      const { error: pointsError } = await supabase.from('user_points').insert([{
        user_id: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      if (pointsError) throw pointsError;

      return {
        id: authData.user.id,
        email: authData.user.email || email,
        displayName,
        isPremium: false,
        streakProtections: 3,
        referralCode,
        createdAt: authData.user.created_at,
      };
    }

    throw new Error('Kullanıcı oluşturulamadı');
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Profil bilgilerini getir
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user?.id)
      .single();
    
    if (profileError) throw profileError;

    return { 
      id: data.user?.id || '',
      email: data.user?.email || email,
      displayName: profile.display_name || '',
      photoURL: profile.avatar_url,
      isPremium: profile.subscription_status === 'premium',
      streakProtections: 3, // Bu değer gerçekte hesaplanabilir
      referralCode: profile.username || '',
      createdAt: data.user?.created_at || '',
    };
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return null;
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
    authStateChanged: (state, action: PayloadAction<{ user: User } | null>) => {
      if (action.payload) {
        state.user = action.payload.user;
      } else {
        state.user = null;
      }
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

export const { updateUser, clearError, authStateChanged } = authSlice.actions;
export default authSlice.reducer;
