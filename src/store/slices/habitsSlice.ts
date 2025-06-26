import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: 'health' | 'education' | 'fitness' | 'mindfulness' | 'productivity' | 'other';
  description?: string;
  targetFrequency: 'daily' | 'weekly';
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
  isActive: boolean;
  color: string;
  reminderTime?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  notes?: string;
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
    
    // Mock habits data
    const mockHabits: Habit[] = [
      {
        id: '1',
        userId,
        title: 'Morning Exercise',
        description: 'Do 30 minutes of exercise every morning',
        color: '#FF6B6B',
        targetFrequency: 'daily',
        reminderTime: '07:00',
        category: 'health',
        currentStreak: 5,
        longestStreak: 12,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId,
        title: 'Read Books',
        description: 'Read for at least 20 minutes',
        color: '#4ECDC4',
        targetFrequency: 'daily',
        reminderTime: '20:00',
        category: 'education',
        currentStreak: 3,
        longestStreak: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    
    return mockHabits;
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'createdAt'>, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const newHabit: Habit = {
      id: Date.now().toString(), // Mock ID
      ...habitData,
      userId,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    return newHabit;
  }
);

export const completeHabit = createAsyncThunk(
  'habits/completeHabit',
  async ({ habitId, notes }: { habitId: string; notes?: string }, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    const habit = state.habits.habits.find(h => h.id === habitId);
    
    if (!userId || !habit) throw new Error('Invalid request');
    
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = habit.lastCompletedDate;
    
    // Check if already completed today
    if (lastCompleted === today) {
      throw new Error('Habit already completed today');
    }
    
    // Calculate new streak
    let newStreak = 1;
    if (lastCompleted) {
      const lastDate = new Date(lastCompleted);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = habit.currentStreak + 1;
      }
    }
    
    const longestStreak = Math.max(newStreak, habit.longestStreak);
    
    // Mock completion record
    const completion: HabitCompletion = {
      id: Date.now().toString(),
      habitId,
      userId,
      completedAt: new Date(),
      notes,
    };
    
    return {
      habit: {
        ...habit,
        currentStreak: newStreak,
        longestStreak,
        lastCompletedDate: today,
      },
      completion,
    };
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (habitId: string) => {
    // Mock implementation
    console.log('Deleting habit:', habitId);
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
