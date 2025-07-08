import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  streakProtections: number;
  referralCode: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  subscription_status: string;
  longest_overall_streak: number;
  total_habits_completed: number;
  joined_at: string;
  last_active: string;
  notification_preferences: any;
  privacy_settings: any;
}

export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          display_name: displayName,
          username: displayName.toLowerCase().replace(/\s+/g, '_'),
          timezone: 'UTC',
          subscription_status: 'free',
          longest_overall_streak: 0,
          total_habits_completed: 0,
          notification_preferences: {
            social: false,
            achievement: true,
            daily_reminder: true,
            streak_warning: true,
          },
          privacy_settings: {
            profile_visible: true,
            streaks_visible: true,
            achievements_visible: true,
          },
        });

      if (profileError) throw profileError;

      // Initialize user points
      const { error: pointsError } = await supabase
        .from('user_points')
        .insert({
          user_id: data.user.id,
          total_points: 0,
          points_this_month: 0,
          points_this_week: 0,
          level: 1,
          experience_points: 0,
        });

      if (pointsError) throw pointsError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      displayName: profile.display_name || user.user_metadata?.display_name || '',
      photoURL: profile.avatar_url || undefined,
      isPremium: profile.subscription_status === 'premium',
      streakProtections: 3, // Default value, could be fetched from another table
      referralCode: user.id.slice(0, 8).toUpperCase(),
      createdAt: user.created_at,
    };
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};