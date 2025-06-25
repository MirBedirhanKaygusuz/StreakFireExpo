import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import * as Notifications from 'expo-notifications';
import { 
  scheduleStreakReminder as scheduleNotification,
  cancelStreakReminder as cancelNotification,
  requestNotificationPermissions,
  sendLocalNotification
} from '../../services/notifications';

export interface Notification {
  id: string;
  userId: string;
  type: 'streak_reminder' | 'group_invite' | 'achievement' | 'social_interaction' | 'system';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pushEnabled: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pushEnabled: true,
};

// Mock notifications data
let mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'mock-user-id',
    type: 'streak_reminder',
    title: 'Streak Reminder! 🔥',
    body: 'Don\'t forget to complete your morning exercise!',
    read: false,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '2',
    userId: 'mock-user-id',
    type: 'achievement',
    title: 'Milestone Achieved! 🎉',
    body: 'You\'ve reached a 7-day streak!',
    read: true,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
];

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const notifications = mockNotifications.filter(n => n.userId === userId);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return { notifications, unreadCount };
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  }
);

export const scheduleStreakReminder = createAsyncThunk(
  'notifications/scheduleStreakReminder',
  async ({ habitId, habitName, time }: { habitId: string; habitName: string; time: Date }) => {
    await scheduleNotification(habitId, habitName, time);
    return { habitId, time };
  }
);

export const cancelStreakReminder = createAsyncThunk(
  'notifications/cancelStreakReminder',
  async (habitId: string) => {
    await cancelNotification(habitId);
    return habitId;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    togglePushNotifications: (state) => {
      state.pushEnabled = !state.pushEnabled;
      if (!state.pushEnabled) {
        // Cancel all notifications using Expo notifications
        Notifications.cancelAllScheduledNotificationsAsync();
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { togglePushNotifications, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
