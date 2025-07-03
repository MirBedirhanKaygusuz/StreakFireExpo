import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../store/store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail Screens
import HabitDetailScreen from '../screens/details/HabitDetailScreen';
import CreateHabitScreen from '../screens/details/CreateHabitScreen';
import NotificationsScreen from '../screens/details/NotificationsScreen';
import SettingsScreen from '../screens/details/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  HabitDetail: { habitId: string };
  CreateHabit: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Habits: undefined;
  Calendar: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Habits':
              iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 10,
          paddingTop: 5,
          paddingHorizontal: 10,
          height: 50,
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
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
          title: 'My Habits',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: 'Calendar',
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
            name="CreateHabit" 
            component={CreateHabitScreen}
            options={{ title: 'Create New Habit' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ title: 'Notifications' }}
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
