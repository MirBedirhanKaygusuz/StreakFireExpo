import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../store/store';

const QuickStats: React.FC = () => {
  const { habits } = useSelector((state: RootState) => state.habits);
  const { user } = useSelector((state: RootState) => state.auth);

  // Calculate statistics
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0
    ? Math.round((habits.filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return h.lastCompletedDate === today;
      }).length / totalHabits) * 100)
    : 0;
  
  const longestStreak = habits.reduce((max, habit) => 
    Math.max(max, habit.longestStreak), 0
  );
  
  const totalStreakDays = habits.reduce((sum, habit) => 
    sum + habit.currentStreak, 0
  );

  const stats = [
    {
      icon: 'percent',
      value: `${completionRate}%`,
      label: 'Today\'s Progress',
      color: '#4CAF50',
    },
    {
      icon: 'trophy',
      value: longestStreak.toString(),
      label: 'Longest Streak',
      color: '#FF9800',
    },
    {
      icon: 'shield-check',
      value: user?.streakProtections?.toString() || '0',
      label: 'Protections',
      color: '#2196F3',
    },
    {
      icon: 'fire',
      value: totalStreakDays.toString(),
      label: 'Total Streak Days',
      color: '#FF6B6B',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
              <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default QuickStats;
