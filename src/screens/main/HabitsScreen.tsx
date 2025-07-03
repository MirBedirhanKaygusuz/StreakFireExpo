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
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store/store';
import { fetchHabits, completeHabit, deleteHabit } from '../../store/slices/habitsSlice';
import StreakCard from '../../components/StreakCard';

const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
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
              text: 'Great!',
              style: 'default',
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete habit');
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteHabit(habitId));
              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHabits.map(habit => (
          <StreakCard
            key={habit.id}
            habit={habit}
            onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
            onComplete={() => handleCompleteHabit(habit.id)}
          />
        ))}

        {filteredHabits.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No habits found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'Create your first habit to start building streaks!'
                : filter === 'completed'
                ? 'No completed habits yet today'
                : 'All habits completed for today! 🎉'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HabitsScreen;
