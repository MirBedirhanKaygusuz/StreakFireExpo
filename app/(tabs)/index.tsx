import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Flame, Target, Users, Trophy, Plus } from 'lucide-react-native';
import { RootState, AppDispatch } from '@/store/store';
import { fetchHabits } from '@/store/slices/habitsSlice';
import { fetchGroups } from '@/store/slices/groupsSlice';
import { fetchNotifications } from '@/store/slices/notificationsSlice';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
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

  const completionRate = activeHabits > 0 ? Math.round((todayCompleted / activeHabits) * 100) : 0;

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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{user?.displayName}! 🔥</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color="#FFFFFF" />
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
              <Text style={styles.streakNumber}>{completionRate}%</Text>
              <Text style={styles.streakLabel}>Today's Progress</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/create-habit')}
          >
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              style={styles.actionGradient}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Add Habit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/create-group')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.actionGradient}
            >
              <Users size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Create Group</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Habit Completion</Text>
              <Text style={styles.progressPercentage}>{completionRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${completionRate}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {todayCompleted} of {activeHabits} habits completed
            </Text>
          </View>
        </View>

        {/* Recent Habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Habits</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/habits')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {habits.slice(0, 3).map(habit => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitCard}
              onPress={() => router.push(`/habit/${habit.id}`)}
            >
              <View style={styles.habitInfo}>
                <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                  <Target size={20} color="#FFFFFF" />
                </View>
                <View style={styles.habitText}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitStreak}>
                    {habit.currentStreak} day streak
                  </Text>
                </View>
              </View>
              <View style={styles.habitStreak}>
                <Flame size={20} color="#FF6B6B" />
                <Text style={styles.habitStreakNumber}>{habit.currentStreak}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {habits.length === 0 && (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push('/create-habit')}
            >
              <Target size={48} color="#FF6B6B" />
              <Text style={styles.emptyText}>Create your first habit</Text>
              <Text style={styles.emptySubtext}>Start building lasting habits today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Groups</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {groups.slice(0, 2).map(group => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => router.push(`/group/${group.id}`)}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' }}
                style={styles.groupImage}
              />
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>{group.members.length} members</Text>
              </View>
              <View style={styles.groupStreak}>
                <Flame size={16} color="#FF6B6B" />
                <Text style={styles.groupStreakText}>{group.currentStreak}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leaderboard Preview */}
        <TouchableOpacity
          style={styles.leaderboardCard}
          onPress={() => router.push('/leaderboard')}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.leaderboardGradient}
          >
            <Trophy size={24} color="#FFFFFF" />
            <Text style={styles.leaderboardText}>View Global Leaderboard</Text>
            <Text style={styles.leaderboardSubtext}>See how you rank</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  habitCard: {
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
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitText: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  habitStreakNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 40,
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 5,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
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
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  groupStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  groupStreakText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  leaderboardCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  leaderboardGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  leaderboardText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  leaderboardSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
  },
});