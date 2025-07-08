import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { RootState } from '../store/store';
import CustomTabBar from '../components/CustomTabBar';
import IOSCustomTabBar from '../components/IOSCustomTabBar';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import SocialScreen from '../screens/main/SocialScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail Screens
import HabitDetailScreen from '../screens/details/HabitDetailScreen';
import GroupDetailScreen from '../screens/details/GroupDetailScreen';
import CreateHabitScreen from '../screens/details/CreateHabitScreen';
import CreateGroupScreen from '../screens/details/CreateGroupScreen';
import NotificationsScreen from '../screens/details/NotificationsScreen';
import LeaderboardScreen from '../screens/details/LeaderboardScreen';
import SettingsScreen from '../screens/details/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  HabitDetail: { habitId: string };
  GroupDetail: { groupId: string };
  CreateHabit: undefined;
  CreateGroup: { habitId?: string };
  Notifications: undefined;
  Leaderboard: { type: 'global' | 'group'; groupId?: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Habits: undefined;
  Social: undefined;
  Groups: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// iOS için özelleştirilmiş tab navigator
const IOSMainTabs: React.FC = () => {
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF'
      }}
      edges={['top', 'left', 'right']}
    >
      <ExpoStatusBar style="dark" />
      <Tab.Navigator
        tabBar={props => <IOSCustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen 
          name="Habits" 
          component={HabitsScreen}
          options={{
            title: 'Habits',
          }}
        />
        <Tab.Screen 
          name="Social" 
          component={SocialScreen}
          options={{
            title: 'Feed',
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tab.Screen 
          name="Groups" 
          component={GroupsScreen}
          options={{
            title: 'Groups',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Android için özelleştirilmiş tab navigator
const AndroidMainTabs: React.FC = () => {
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF'
      }}
      edges={['top', 'left', 'right']}
    >
      <ExpoStatusBar style="dark" />
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen 
          name="Habits" 
          component={HabitsScreen}
          options={{
            title: 'Habits',
          }}
        />
        <Tab.Screen 
          name="Social" 
          component={SocialScreen}
          options={{
            title: 'Feed',
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tab.Screen 
          name="Groups" 
          component={GroupsScreen}
          options={{
            title: 'Groups',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Platform-specific main tabs component
const MainTabs: React.FC = () => {
  return Platform.OS === 'ios' ? <IOSMainTabs /> : <AndroidMainTabs />;
};

const RootNavigator: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HabitDetail" 
            component={HabitDetailScreen}
            options={{ title: 'Habit Details' }}
          />
          <Stack.Screen 
            name="GroupDetail" 
            component={GroupDetailScreen}
            options={{ title: 'Group Details' }}
          />
          <Stack.Screen 
            name="CreateHabit" 
            component={CreateHabitScreen}
            options={{ title: 'Create New Habit' }}
          />
          <Stack.Screen 
            name="CreateGroup" 
            component={CreateGroupScreen}
            options={{ title: 'Create New Group' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ title: 'Notifications' }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
