import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import { signOut } from '../../store/slices/authSlice';
import { togglePushNotifications } from '../../store/slices/notificationsSlice';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { habits } = useSelector((state: RootState) => state.habits);
  const { groups } = useSelector((state: RootState) => state.groups);
  const { pushEnabled } = useSelector((state: RootState) => state.notifications);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(pushEnabled);

  const totalStreak = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.longestStreak), 0);
  const completedToday = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.lastCompletedDate === today;
  }).length;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOut());
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    dispatch(togglePushNotifications());
  };

  const profileStats = [
    {
      icon: 'fire',
      label: 'Total Streak Days',
      value: totalStreak.toString(),
      color: '#FF6B6B',
    },
    {
      icon: 'trophy',
      label: 'Longest Streak',
      value: longestStreak.toString(),
      color: '#FFC107',
    },
    {
      icon: 'checkbox-marked-circle',
      label: 'Active Habits',
      value: habits.length.toString(),
      color: '#4CAF50',
    },
    {
      icon: 'account-group',
      label: 'Groups Joined',
      value: groups.length.toString(),
      color: '#2196F3',
    },
  ];

  const menuItems = [
    {
      icon: 'bell-outline',
      title: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
      showBadge: false,
    },
    {
      icon: 'trophy-outline',
      title: 'Achievements',
      onPress: () => {},
      showBadge: false,
    },
    {
      icon: 'chart-line',
      title: 'Statistics',
      onPress: () => {},
      showBadge: false,
    },
    {
      icon: 'crown',
      title: 'Premium',
      onPress: () => {},
      showBadge: !user?.isPremium,
      badgeText: 'Upgrade',
    },
    {
      icon: 'cog-outline',
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
      showBadge: false,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {},
      showBadge: false,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <MaterialCommunityIcons name={stat.icon as any} size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.streakProtectionCard}>
          <LinearGradient
            colors={['#4FACFE', '#00F2FE']}
            style={styles.streakProtectionGradient}
          >
            <MaterialCommunityIcons name="shield-check" size={32} color="#FFFFFF" />
            <View style={styles.streakProtectionInfo}>
              <Text style={styles.streakProtectionTitle}>Streak Protections</Text>
              <Text style={styles.streakProtectionCount}>
                {user?.streakProtections || 0} available
              </Text>
            </View>
            <TouchableOpacity style={styles.getMoreButton}>
              <Text style={styles.getMoreText}>Get More</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.referralCard}>
          <MaterialCommunityIcons name="gift-outline" size={24} color="#FF6B6B" />
          <View style={styles.referralInfo}>
            <Text style={styles.referralTitle}>Your Referral Code</Text>
            <Text style={styles.referralCode}>{user?.referralCode}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.notificationToggle}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#666" />
            <Text style={styles.notificationToggleText}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <MaterialCommunityIcons name={item.icon as any} size={24} color="#666" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              {item.showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeText || ''}</Text>
                </View>
              )}
              <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  premiumText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  streakProtectionCard: {
    marginBottom: 15,
  },
  streakProtectionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
  },
  streakProtectionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  streakProtectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  streakProtectionCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  getMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  getMoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  referralInfo: {
    flex: 1,
    marginLeft: 15,
  },
  referralTitle: {
    fontSize: 14,
    color: '#666',
  },
  referralCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  shareButton: {
    padding: 10,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationToggleText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});

export default ProfileScreen;
