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
  completedAt: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
}

export interface HabitCalendarData {
  date: string; // YYYY-MM-DD format
  completedHabits: string[]; // Array of habit IDs
  totalHabits: number;
  completionRate: number;
}

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to generate mock completion data for the last 30 days
const generateMockCompletions = (habits: Habit[], userId: string): HabitCompletion[] => {
  const completions: HabitCompletion[] = [];
  const today = new Date();
  
  // Generate completions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    habits.forEach(habit => {
      // Random completion (70% chance for each habit each day)
      if (Math.random() > 0.3) {
        completions.push({
          id: `${habit.id}-${dateString}`,
          habitId: habit.id,
          userId,
          completedAt: dateString,
        });
      }
    });
  }
  
  return completions;
};

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
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
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
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
      {
        id: '3',
        userId,
        title: 'Meditation',
        description: 'Practice mindfulness for 10 minutes',
        color: '#45B7D1',
        targetFrequency: 'daily',
        reminderTime: '06:30',
        category: 'mindfulness',
        currentStreak: 7,
        longestStreak: 15,
        isActive: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      },
      {
        id: '4',
        userId,
        title: 'Drink Water',
        description: 'Drink 8 glasses of water daily',
        color: '#96CEB4',
        targetFrequency: 'daily',
        reminderTime: '08:00',
        category: 'health',
        currentStreak: 2,
        longestStreak: 6,
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
    ];
    
    // Generate mock completion data
    const mockCompletions = generateMockCompletions(mockHabits, userId);
    
    return { habits: mockHabits, completions: mockCompletions };
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
      completedAt: today,
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
        state.habits = action.payload.habits;
        state.completions = action.payload.completions;
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
