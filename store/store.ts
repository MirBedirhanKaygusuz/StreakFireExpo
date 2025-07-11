import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import habitsReducer from './slices/habitsSlice';
import socialReducer from './slices/socialSlice';
import groupsReducer from './slices/groupsSlice';
import notificationsReducer from './slices/notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    social: socialReducer,
    groups: groupsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };