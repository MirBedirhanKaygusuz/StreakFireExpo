import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit } from '../store/slices/habitsSlice';

interface StreakCardProps {
  habit: Habit;
  onPress: () => void;
  onComplete?: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({ habit, onPress, onComplete }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.lastCompletedDate === today;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health':
        return 'heart-pulse';
      case 'education':
        return 'school';
      case 'fitness':
        return 'run';
      case 'mindfulness':
        return 'meditation';
      case 'productivity':
        return 'rocket-launch';
      default:
        return 'star';
    }
  };

  const getStreakColor = (streak: number): readonly [string, string] => {
    if (streak === 0) return ['#E0E0E0', '#BDBDBD'] as const;
    if (streak < 7) return ['#FFB74D', '#FF9800'] as const;
    if (streak < 30) return ['#FF7043', '#FF5722'] as const;
    if (streak < 100) return ['#FF6B6B', '#FF5252'] as const;
    return ['#D32F2F', '#B71C1C'] as const;
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.card}>
          <LinearGradient
            colors={getStreakColor(habit.currentStreak)}
            style={styles.streakIndicator}
          >
            <MaterialCommunityIcons name="fire" size={24} color="#FFFFFF" />
            <Text style={styles.streakNumber}>{habit.currentStreak}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialCommunityIcons
                name={getCategoryIcon(habit.category) as any}
                size={24}
                color={habit.color || '#FF6B6B'}
              />
              <Text style={styles.title} numberOfLines={1}>
                {habit.title}
              </Text>
            </View>

            {habit.description && (
              <Text style={styles.description} numberOfLines={2}>
                {habit.description}
              </Text>
            )}

            <View style={styles.footer}>
              <View style={styles.frequency}>
                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                <Text style={styles.frequencyText}>
                  {habit.targetFrequency === 'daily' ? 'Daily' : 'Weekly'}
                </Text>
              </View>

              {!isCompletedToday && onComplete && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={onComplete}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}

              {isCompletedToday && (
                <View style={styles.completedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.completedText}>Done</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakIndicator: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  completeButton: {
    padding: 5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: '600',
  },
});

export default StreakCard;
