export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_frequency: string
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
          is_active: boolean
          color_theme: string
          icon: string
          difficulty_level: number
          estimated_time: number
          target_days_per_week: number
          reminder_time: string
          reminder_enabled: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          target_frequency?: string
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
          color_theme?: string
          icon?: string
          difficulty_level?: number
          estimated_time?: number
          target_days_per_week?: number
          reminder_time?: string
          reminder_enabled?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_frequency?: string
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
          color_theme?: string
          icon?: string
          difficulty_level?: number
          estimated_time?: number
          target_days_per_week?: number
          reminder_time?: string
          reminder_enabled?: boolean
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completion_date: string
          completion_time: string
          mood_rating: number | null
          notes: string | null
          points_earned: number
          completion_method: string
          streak_length_at_completion: number
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completion_date: string
          completion_time?: string
          mood_rating?: number | null
          notes?: string | null
          points_earned?: number
          completion_method?: string
          streak_length_at_completion?: number
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completion_date?: string
          completion_time?: string
          mood_rating?: number | null
          notes?: string | null
          points_earned?: number
          completion_method?: string
          streak_length_at_completion?: number
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string
          challenge_type: string
          max_members: number
          current_members: number
          start_date: string
          end_date: string | null
          entry_fee: number
          reward_pool: number
          is_public: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          creator_id: string
          challenge_type?: string
          max_members?: number
          current_members?: number
          start_date?: string
          end_date?: string | null
          entry_fee?: number
          reward_pool?: number
          is_public?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          creator_id?: string
          challenge_type?: string
          max_members?: number
          current_members?: number
          start_date?: string
          end_date?: string | null
          entry_fee?: number
          reward_pool?: number
          is_public?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
          role: string
          is_active: boolean
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
          role?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
          role?: string
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          timezone: string
          subscription_status: string
          subscription_start_date: string | null
          subscription_end_date: string | null
          longest_overall_streak: number
          total_habits_completed: number
          joined_at: string
          last_active: string
          notification_preferences: Json
          privacy_settings: Json
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          longest_overall_streak?: number
          total_habits_completed?: number
          joined_at?: string
          last_active?: string
          notification_preferences?: Json
          privacy_settings?: Json
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          timezone?: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          longest_overall_streak?: number
          total_habits_completed?: number
          joined_at?: string
          last_active?: string
          notification_preferences?: Json
          privacy_settings?: Json
        }
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          points_this_month: number
          points_this_week: number
          level: number
          experience_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          points_this_month?: number
          points_this_week?: number
          level?: number
          experience_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_points?: number
          points_this_month?: number
          points_this_week?: number
          level?: number
          experience_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: Json | null
          is_read: boolean
          scheduled_for: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: Json | null
          is_read?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: Json | null
          is_read?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement_type: string
          requirement_value: number
          points_reward: number
          rarity: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string
          category: string
          requirement_type: string
          requirement_value: number
          points_reward?: number
          rarity?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          requirement_type?: string
          requirement_value?: number
          points_reward?: number
          rarity?: string
          is_active?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          habit_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          habit_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          habit_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
