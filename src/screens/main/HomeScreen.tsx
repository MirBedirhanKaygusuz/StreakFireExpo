import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store/store';
import { fetchHabits } from '../../store/slices/habitsSlice';
import { fetchGroups } from '../../store/slices/groupsSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import StreakCard from '../../components/StreakCard';
import QuickStats from '../../components/QuickStats';
import DailyProgress from '../../components/DailyProgress';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { habits } = useSelector((state: RootState) => state.habits);
  const { groups } = useSelector((state: RootState) => state.groups);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadData();
    setGreetingMessage();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchHabits()),
        dispatch(fetchGroups()),
        dispatch(fetchNotifications()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  };

  const totalStreak = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  const activeHabits = habits.filter(h => h.isActive).length;
  const todayCompleted = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.lastCompletedDate === today;
  }).length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.displayName}! 🔥</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.streakSummary}>
          <View style={styles.streakItem}>
            <Text style={styles.streakNumber}>{totalStreak}</Text>
            <Text style={styles.streakLabel}>Total Days</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakNumber}>{activeHabits}</Text>
            <Text style={styles.streakLabel}>Active Habits</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakNumber}>{todayCompleted}</Text>
            <Text style={styles.streakLabel}>Completed Today</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <DailyProgress habits={habits} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {habits.slice(0, 3).map(habit => (
            <StreakCard
              key={habit.id}
              habit={habit}
              onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
            />
          ))}
          {habits.length === 0 && (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('CreateHabit')}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={48} color="#FF6B6B" />
              <Text style={styles.emptyText}>Create your first habit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Groups</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {groups.slice(0, 2).map(group => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
            >
              <View style={styles.groupInfo}>
                <MaterialCommunityIcons name="account-group" size={24} color="#FF6B6B" />
                <View style={styles.groupText}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>{group.members.length} members</Text>
                </View>
              </View>
              <View style={styles.groupStreak}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
                <Text style={styles.groupStreakText}>{group.currentStreak}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <QuickStats />

        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={() => navigation.navigate('Leaderboard', { type: 'global' })}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.leaderboardGradient}
          >
            <MaterialCommunityIcons name="trophy" size={24} color="#FFFFFF" />
            <Text style={styles.leaderboardText}>View Global Leaderboard</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  streakDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupText: {
    marginLeft: 15,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  groupStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupStreakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 5,
  },
  leaderboardButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  leaderboardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 15,
  },
  leaderboardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 15,
  },
});

export default HomeScreen;
