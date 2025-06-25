import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Habit } from '../store/slices/habitsSlice';

interface DailyProgressProps {
  habits: Habit[];
}

const DailyProgress: React.FC<DailyProgressProps> = ({ habits }) => {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.lastCompletedDate === today).length;
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? completedToday / totalHabits : 0;
  
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getProgressColor = () => {
    if (progress === 0) return '#E0E0E0';
    if (progress < 0.5) return '#FF9800';
    if (progress < 1) return '#FFC107';
    return '#4CAF50';
  };

  const getMotivationalMessage = () => {
    if (progress === 0) return 'Start your day strong! 💪';
    if (progress < 0.5) return 'Keep going, you\'re doing great! 🔥';
    if (progress < 1) return 'Almost there! Finish strong! 🚀';
    return 'Perfect day! All habits completed! 🎉';
  };

  if (totalHabits === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Progress</Text>
        <Text style={styles.count}>
          {completedToday} of {totalHabits}
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      
      <Text style={styles.message}>{getMotivationalMessage()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  count: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default DailyProgress;
