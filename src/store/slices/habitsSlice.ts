import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { habitService } from '../../services/habitService';
import { notificationService } from '../../services/notificationService';
import { RootState } from '../store';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'health' | 'education' | 'fitness' | 'mindfulness' | 'productivity' | 'custom' | string;
  target_frequency: 'daily' | 'weekly' | string;
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
  // Calculated fields from related tables
  lastCompletedDate?: string;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completion_time: string;
  mood_rating?: number;
  notes?: string;
  points_earned: number;
  completion_method: string;
  streak_length_at_completion: number;
}

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HabitsState = {
  habits: [],
  completions: [],
  isLoading: false,
  error: null,
};

export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await habitService.getHabits(userId);
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData: any, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const newHabit = await habitService.createHabit({
      ...habitData,
      user_id: userId,
    });
    
    // Reminder kurulumu
    if (habitData.reminder_enabled && habitData.reminder_time) {
      await notificationService.scheduleHabitReminder(newHabit);
    }
    
    return newHabit;
  }
);

export const completeHabit = createAsyncThunk(
  'habits/completeHabit',
  async ({ habitId, notes }: { habitId: string; notes?: string }, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const result = await habitService.completeHabit(habitId, userId, notes);
    
    // Streak milestone kontrolü
    if (result.habit.current_streak > 0 && result.habit.current_streak % 7 === 0) {
      // Bildirim gönder - bu fonksiyon notificationService'te olmalı
      await notificationService.createNotification({
        user_id: userId,
        title: '🔥 Streak Milestone!',
        message: `${result.habit.title} için ${result.habit.current_streak} günlük streak tamamladınız!`,
        type: 'streak_milestone',
        data: {
          habitId: result.habit.id,
          streakCount: result.habit.current_streak
        }
      });
    }
    
    return result;
  }
);

export const uncompleteHabit = createAsyncThunk(
  'habits/uncompleteHabit',
  async (habitId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await habitService.uncompleteHabit(habitId, userId);
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ habitId, updates }: { habitId: string; updates: any }) => {
    return await habitService.updateHabit(habitId, updates);
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (habitId: string) => {
    await habitService.deleteHabit(habitId);
    return habitId;
  }
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    resetStreak: (state, action: PayloadAction<string>) => {
      const habit = state.habits.find(h => h.id === action.payload);
      if (habit) {
        habit.current_streak = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Habits
      .addCase(fetchHabits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch habits';
      })
      // Create Habit
      .addCase(createHabit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.habits.push(action.payload);
      })
      .addCase(createHabit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create habit';
      })
      // Complete Habit
      .addCase(completeHabit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeHabit.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.habits.findIndex(h => h.id === action.payload.habit.id);
        if (index !== -1) {
          state.habits[index] = action.payload.habit;
        }
        state.completions.push(action.payload.completion);
      })
      .addCase(completeHabit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to complete habit';
      })
      // Uncomplete Habit
      .addCase(uncompleteHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      // Update Habit
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      // Delete Habit
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(h => h.id !== action.payload);
      });
  },
});

export const { resetStreak } = habitsSlice.actions;
export default habitsSlice.reducer;
