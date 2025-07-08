import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Target, Plus, Filter, Flame } from 'lucide-react-native';
import { RootState, AppDispatch } from '@/store/store';
import { fetchHabits, completeHabit } from '@/store/slices/habitsSlice';
import { createPost } from '@/store/slices/socialSlice';

export default function HabitsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { habits, isLoading } = useSelector((state: RootState) => state.habits);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    dispatch(fetchHabits());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchHabits());
    setRefreshing(false);
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const result = await dispatch(completeHabit({ habitId })).unwrap();
      
      // Check for milestone achievements
      const habit = result.habit;
      const milestones = [7, 30, 100, 365];
      if (milestones.includes(habit.currentStreak)) {
        Alert.alert(
          '🎉 Milestone Achieved!',
          `Amazing! You've maintained "${habit.title}" for ${habit.currentStreak} days!`,
          [
            {
              text: 'Share',
              onPress: () => shareAchievement(habit),
            },
            {
              text: 'Thanks!',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete habit');
    }
  };

  const shareAchievement = async (habit: any) => {
    try {
      await dispatch(createPost({
        content: `Just hit a ${habit.currentStreak}-day streak with "${habit.title}"! 🔥`,
        type: 'streak_milestone',
        habitId: habit.id,
        habitName: habit.title,
        streakCount: habit.currentStreak,
        userId: '',
        userName: '',
      }));
      Alert.alert('Success', 'Achievement shared with the community!');
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  };

  const getFilteredHabits = () => {
    const today = new Date().toISOString().split('T')[0];
    switch (filter) {
      case 'completed':
        return habits.filter(h => h.lastCompletedDate === today);
      case 'pending':
        return habits.filter(h => h.lastCompletedDate !== today);
      default:
        return habits;
    }
  };

  const filteredHabits = getFilteredHabits();

  const getCategoryIcon = (category: string) => {
    return Target; // Simplified for now
  };

  const getStreakColor = (streak: number): string => {
    if (streak === 0) return '#E0E0E0';
    if (streak < 7) return '#FFB74D';
    if (streak < 30) return '#FF7043';
    if (streak < 100) return '#FF6B6B';
    return '#D32F2F';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Habits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-habit')}
        >
          <Plus size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({habits.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHabits.map(habit => {
          const today = new Date().toISOString().split('T')[0];
          const isCompletedToday = habit.lastCompletedDate === today;
          const IconComponent = getCategoryIcon(habit.category);

          return (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitCard}
              onPress={() => router.push(`/habit/${habit.id}`)}
            >
              <View style={styles.habitContent}>
                <View style={styles.habitHeader}>
                  <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    {habit.description && (
                      <Text style={styles.habitDescription} numberOfLines={1}>
                        {habit.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.streakContainer}>
                    <View style={[styles.streakBadge, { backgroundColor: getStreakColor(habit.currentStreak) }]}>
                      <Flame size={16} color="#FFFFFF" />
                      <Text style={styles.streakNumber}>{habit.currentStreak}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.habitFooter}>
                  <Text style={styles.habitFrequency}>
                    {habit.targetFrequency === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                  
                  {!isCompletedToday ? (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteHabit(habit.id)}
                    >
                      <Text style={styles.completeButtonText}>Complete</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓ Done</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredHabits.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No habits found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'Create your first habit to start building streaks!'
                : filter === 'completed'
                ? 'No completed habits yet today'
                : 'All habits completed for today! 🎉'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/create-habit')}
              >
                <Text style={styles.createButtonText}>Create Your First Habit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habitContent: {
    padding: 20,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  habitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  streakNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  habitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitFrequency: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});