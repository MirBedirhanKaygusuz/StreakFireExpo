import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'habit_reminder' | 'streak_warning' | 'achievement' | 'social' | 'group';
  data?: any;
  isRead: boolean;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  pushEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  pushEnabled: true,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: 'current-user',
        title: 'Daily Reminder',
        message: 'Time for your morning meditation! 🧘‍♂️',
        type: 'habit_reminder',
        data: { habitId: 'habit1' },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId: 'current-user',
        title: 'Streak Achievement!',
        message: 'Congratulations! You\'ve reached a 7-day streak! 🔥',
        type: 'achievement',
        data: { habitId: 'habit2', streakLength: 7 },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    
    return mockNotifications;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
);

export const togglePushNotifications = createAsyncThunk(
  'notifications/togglePushNotifications',
  async (_, { getState }) => {
    const state = getState() as any;
    const newState = !state.notifications.pushEnabled;
    
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return newState;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
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
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount -= 1;
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      // Toggle Push Notifications
      .addCase(togglePushNotifications.fulfilled, (state, action) => {
        state.pushEnabled = action.payload;
      });
  },
});

export const { addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;