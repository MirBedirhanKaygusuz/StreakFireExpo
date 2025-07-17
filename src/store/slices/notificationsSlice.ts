import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import { RootState } from '../store';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  is_read: boolean;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
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

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const notifications = await notificationService.getUserNotifications(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    
    return { notifications, unreadCount };
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    return await notificationService.markAsRead(notificationId);
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    await notificationService.markAllAsRead(userId);
    return userId;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    togglePushNotifications: (state) => {
      state.pushEnabled = !state.pushEnabled;
      if (!state.pushEnabled) {
        // Cancel all notifications
        notificationService.cancelAllNotifications();
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { togglePushNotifications, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
