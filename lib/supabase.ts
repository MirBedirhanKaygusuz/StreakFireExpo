import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          target_frequency: string;
          current_streak: number;
          longest_streak: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          color_theme: string;
          icon: string;
          difficulty_level: number;
          estimated_time: number;
          target_days_per_week: number;
          reminder_time: string;
          reminder_enabled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          target_frequency?: string;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          color_theme?: string;
          icon?: string;
          difficulty_level?: number;
          estimated_time?: number;
          target_days_per_week?: number;
          reminder_time?: string;
          reminder_enabled?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          target_frequency?: string;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          color_theme?: string;
          icon?: string;
          difficulty_level?: number;
          estimated_time?: number;
          target_days_per_week?: number;
          reminder_time?: string;
          reminder_enabled?: boolean;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completion_date: string;
          completion_time: string;
          mood_rating: number | null;
          notes: string | null;
          points_earned: number;
          completion_method: string;
          streak_length_at_completion: number;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completion_date: string;
          completion_time?: string;
          mood_rating?: number | null;
          notes?: string | null;
          points_earned?: number;
          completion_method?: string;
          streak_length_at_completion?: number;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completion_date?: string;
          completion_time?: string;
          mood_rating?: number | null;
          notes?: string | null;
          points_earned?: number;
          completion_method?: string;
          streak_length_at_completion?: number;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          timezone: string;
          subscription_status: string;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          longest_overall_streak: number;
          total_habits_completed: number;
          joined_at: string;
          last_active: string;
          notification_preferences: any;
          privacy_settings: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string;
          subscription_status?: string;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          longest_overall_streak?: number;
          total_habits_completed?: number;
          joined_at?: string;
          last_active?: string;
          notification_preferences?: any;
          privacy_settings?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string;
          subscription_status?: string;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          longest_overall_streak?: number;
          total_habits_completed?: number;
          joined_at?: string;
          last_active?: string;
          notification_preferences?: any;
          privacy_settings?: any;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          creator_id: string;
          challenge_type: string;
          max_members: number;
          current_members: number;
          start_date: string;
          end_date: string | null;
          entry_fee: number;
          reward_pool: number;
          is_public: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          creator_id: string;
          challenge_type?: string;
          max_members?: number;
          current_members?: number;
          start_date?: string;
          end_date?: string | null;
          entry_fee?: number;
          reward_pool?: number;
          is_public?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          creator_id?: string;
          challenge_type?: string;
          max_members?: number;
          current_members?: number;
          start_date?: string;
          end_date?: string | null;
          entry_fee?: number;
          reward_pool?: number;
          is_public?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      group_memberships: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
          role: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          joined_at?: string;
          role?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          joined_at?: string;
          role?: string;
          is_active?: boolean;
        };
      };
    };
  };
}