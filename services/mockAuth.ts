// Mock authentication service for development without Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './auth';

const MOCK_USER_KEY = '@mock_user';

export const mockAuthService = {
  async signUp(email: string, password: string, displayName: string) {
    const mockUser: User = {
      id: 'mock-user-' + Date.now(),
      email,
      displayName,
      photoURL: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName),
      isPremium: false,
      streakProtections: 3,
      referralCode: 'MOCK' + Math.random().toString(36).substring(7).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    return { user: mockUser, session: null };
  },

  async signIn(email: string, password: string) {
    // For mock, just create a user
    const mockUser: User = {
      id: 'mock-user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0]),
      isPremium: false,
      streakProtections: 3,
      referralCode: 'MOCK' + Math.random().toString(36).substring(7).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    return { user: mockUser, session: null };
  },

  async signOut() {
    await AsyncStorage.removeItem(MOCK_USER_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(MOCK_USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  async getUserProfile(userId: string) {
    const user = await this.getCurrentUser();
    if (!user || user.id !== userId) return null;

    return {
      id: userId,
      user_id: userId,
      username: user.displayName.toLowerCase().replace(/\s+/g, '_'),
      display_name: user.displayName,
      avatar_url: user.photoURL || null,
      bio: null,
      timezone: 'UTC',
      subscription_status: user.isPremium ? 'premium' : 'free',
      longest_overall_streak: 0,
      total_habits_completed: 0,
      joined_at: user.createdAt,
      last_active: new Date().toISOString(),
      notification_preferences: {
        social: false,
        achievement: true,
        daily_reminder: true,
        streak_warning: true,
      },
      privacy_settings: {
        profile_visible: true,
        streaks_visible: true,
        achievements_visible: true,
      },
    };
  },

  async updateUserProfile(userId: string, updates: any) {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const updatedUser = {
      ...user,
      displayName: updates.display_name || user.displayName,
      photoURL: updates.avatar_url || user.photoURL,
    };

    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(updatedUser));
    return this.getUserProfile(userId);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    // For mock, just call immediately with current user
    this.getCurrentUser().then(callback);

    // Return a mock subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};
