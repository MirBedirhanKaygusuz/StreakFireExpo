import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { habitsService, Habit, HabitCompletion } from '@/services/habits';

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
    
    return await habitsService.getUserHabits(userId);
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastCompletedDate'>, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await habitsService.createHabit(userId, habitData);
  }
);

export const completeHabit = createAsyncThunk(
  'habits/completeHabit',
  async ({ habitId, notes, moodRating }: { habitId: string; notes?: string; moodRating?: number }, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await habitsService.completeHabit(userId, habitId, notes, moodRating);
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (habitId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    await habitsService.deleteHabit(userId, habitId);
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
        habit.currentStreak = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Habits
      .addCase(fetchHabits.pending, (state) => {
        state.isLoading = true;
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
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload);
      })
      // Complete Habit
      .addCase(completeHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(h => h.id === action.payload.habit.id);
        if (index !== -1) {
          state.habits[index] = action.payload.habit;
        }
        state.completions.push(action.payload.completion);
      })
      // Delete Habit
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(h => h.id !== action.payload);
      });
  },
});

export const { resetStreak } = habitsSlice.actions;
export default habitsSlice.reducer;