import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { AppDispatch, RootState } from '@/store/store';
import { initializeAuth, setUser } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize auth state
    dispatch(initializeAuth());

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      dispatch(setUser(user));
      
      if (user && !user) {
        // User signed out, redirect to login
        router.replace('/(auth)/login');
      } else if (user && router.canGoBack()) {
        // User signed in, redirect to main app if coming from auth
        router.replace('/(tabs)');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  // Redirect based on auth state once initialized
  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, isInitialized]);

  return <>{children}</>;
}