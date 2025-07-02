import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import { completeHabit, deleteHabit } from '../../store/slices/habitsSlice';

const { width } = Dimensions.get('window');

const HabitDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { habitId } = route.params;
  const [isCompleting, setIsCompleting] = useState(false);
  
  const habit = useSelector((state: RootState) => 
    state.habits.habits.find(h => h.id === habitId)
  );

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={64} color="#BDBDBD" />
          <Text style={styles.notFoundText}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.lastCompletedDate === today;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return 'heart-pulse';
      case 'productivity': return 'rocket-launch';
      case 'learning': return 'school';
      case 'social': return 'account-group';
      case 'mindfulness': return 'meditation';
      case 'creative': return 'palette';
      default: return 'star';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    return frequency === 'daily' ? 'calendar-today' : 'calendar-week';
  };

  const handleCompleteHabit = async () => {
    if (isCompletedToday) {
      Alert.alert(
        'Already Completed! 🎉', 
        'You have already completed this habit today. Keep up the great work!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsCompleting(true);
    try {
      await dispatch(completeHabit({ habitId: habit.id })).unwrap();
      
      // Show success message with streak information
      const newStreak = habit.currentStreak + 1;
      let message = 'Habit completed successfully! 🎉';
      
      if (newStreak === 1) {
        message = 'Great start! Your streak begins today! 🌱';
      } else if (newStreak === 7) {
        message = 'Amazing! You\'ve completed your first week! 🔥';
      } else if (newStreak === 30) {
        message = 'Incredible! 30 days of consistency! 🚀';
      } else if (newStreak === 100) {
        message = 'LEGENDARY! 100 days streak achieved! 👑';
      } else if (newStreak > habit.longestStreak) {
        message = `New personal record! ${newStreak} days! 🏆`;
      }
      
      Alert.alert('Success!', message, [
        {
          text: 'Share Achievement',
          onPress: handleShareProgress,
        },
        {
          text: 'Great!',
          style: 'default',
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Oops! Something went wrong', 
        error.message || 'Failed to complete habit. Please try again.',
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteHabit(habit.id));
              navigation.goBack();
              Alert.alert('Deleted', 'Habit deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const getStreakColor = (streak: number): readonly [string, string] => {
    if (streak === 0) return ['#E0E0E0', '#BDBDBD'] as const;
    if (streak < 7) return ['#FFB74D', '#FF9800'] as const;
    if (streak < 30) return ['#FF7043', '#FF5722'] as const;
    if (streak < 100) return ['#FF6B6B', '#FF5252'] as const;
    return ['#D32F2F', '#B71C1C'] as const;
  };

  const getMotivationalMessage = () => {
    const streak = habit.currentStreak;
    const messages = {
      0: [
        "Every journey begins with a single step! 🌱",
        "Today is the perfect day to start! 💪",
        "Your future self will thank you! ✨"
      ],
      low: [
        "You're building momentum! Keep going! 🔥",
        "One day at a time, you've got this! 🚀",
        "Great start! Consistency is key! 💯"
      ],
      medium: [
        "Incredible consistency! You're on fire! �",
        "You're creating a powerful habit! ⚡",
        "This is what dedication looks like! 🌟"
      ],
      high: [
        "You're a habit master! Unstoppable! ⭐",
        "Absolutely incredible streak! 🏆",
        "You're an inspiration to others! 👑"
      ],
      legend: [
        "Legend status achieved! You're amazing! 👑",
        "Your discipline is truly remarkable! 🔱",
        "You've mastered the art of consistency! 🎯"
      ]
    };

    let categoryMessages;
    if (streak === 0) categoryMessages = messages[0];
    else if (streak < 7) categoryMessages = messages.low;
    else if (streak < 30) categoryMessages = messages.medium;
    else if (streak < 100) categoryMessages = messages.high;
    else categoryMessages = messages.legend;

    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  };

  const getWeeklyProgress = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateString = date.toISOString().split('T')[0];
      
      // Mock completed status - in real app this would come from completions data
      const isCompleted = Math.random() > 0.4; // 60% chance of completion
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      return {
        day,
        date: dateString,
        isCompleted,
        isToday,
      };
    });
  };

  const handleShareProgress = async () => {
    try {
      const message = `🔥 I'm on a ${habit.currentStreak}-day streak with "${habit.title}"! Join me on StreakFire and let's build habits together!`;
      await Share.share({
        message,
        title: 'StreakFire Progress',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEditHabit = () => {
    // Navigate to edit screen (would need to be implemented)
    Alert.alert('Coming Soon', 'Edit functionality will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={[habit.color || '#FF6B6B', '#FF8E53']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={getCategoryIcon(habit.category)} 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.title}>{habit.title}</Text>
            {habit.description && (
              <Text style={styles.description}>{habit.description}</Text>
            )}
          </View>
        </LinearGradient>

        {/* Streak Information */}
        <View style={styles.streakSection}>
          <LinearGradient
            colors={getStreakColor(habit.currentStreak)}
            style={styles.streakCard}
          >
            <MaterialCommunityIcons name="fire" size={32} color="#FFFFFF" />
            <Text style={styles.streakNumber}>{habit.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </LinearGradient>

          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{habit.longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{habit.targetFrequency === 'daily' ? 7 : 1}</Text>
              <Text style={styles.statLabel}>Days/Week</Text>
            </View>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
        </View>

        {/* Habit Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Habit Details</Text>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name={getCategoryIcon(habit.category)} 
              size={24} 
              color={habit.color || '#FF6B6B'} 
            />
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name={getFrequencyIcon(habit.targetFrequency)} 
              size={24} 
              color={habit.color || '#FF6B6B'} 
            />
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>{habit.targetFrequency.charAt(0).toUpperCase() + habit.targetFrequency.slice(1)}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={24} 
              color={habit.color || '#FF6B6B'} 
            />
            <Text style={styles.detailLabel}>Estimated Time</Text>
            <Text style={styles.detailValue}>15 minutes</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="signal" 
              size={24} 
              color={habit.color || '#FF6B6B'} 
            />
            <Text style={styles.detailLabel}>Difficulty</Text>
            <Text style={styles.detailValue}>
              {'⭐'.repeat(3)} (3/5)
            </Text>
          </View>

          {habit.reminderTime && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={24} 
                color={habit.color || '#FF6B6B'} 
              />
              <Text style={styles.detailLabel}>Reminder</Text>
              <Text style={styles.detailValue}>{habit.reminderTime}</Text>
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statisticsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>
                {Math.round((habit.currentStreak / Math.max(habit.longestStreak, 1)) * 100)}%
              </Text>
              <Text style={styles.statDescription}>Of Best Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#2196F3" />
              <Text style={styles.statValue}>
                {new Date(habit.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
              </Text>
              <Text style={styles.statDescription}>Started</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#FF9800" />
              <Text style={styles.statValue}>
                {Math.round(((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)))}
              </Text>
              <Text style={styles.statDescription}>Days Total</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress Section */}
        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.weeklyGrid}>
            {getWeeklyProgress().map((dayData, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, dayData.isToday && styles.todayLabel]}>
                  {dayData.day}
                </Text>
                <View style={[
                  styles.dayCircle,
                  dayData.isCompleted && styles.completedDay,
                  dayData.isToday && styles.todayCircle,
                ]}>
                  {dayData.isCompleted && (
                    <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: isCompletedToday ? '#4CAF50' : habit.color || '#FF6B6B' },
              isCompleting && styles.buttonDisabled
            ]}
            onPress={handleCompleteHabit}
            disabled={isCompleting || isCompletedToday}
          >
            <MaterialCommunityIcons 
              name={isCompletedToday ? "check-circle" : "plus-circle"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.buttonText}>
              {isCompletedToday ? 'Completed Today! 🎉' : 'Complete Habit'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleShareProgress}>
              <MaterialCommunityIcons name="share-variant" size={20} color="#FF6B6B" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleEditHabit}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FF6B6B" />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleDeleteHabit}>
              <MaterialCommunityIcons name="delete-outline" size={20} color="#FF5252" />
              <Text style={[styles.secondaryButtonText, { color: '#FF5252' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  habitIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  streakSection: {
    padding: 20,
    alignItems: 'center',
  },
  streakCard: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  motivationCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statisticsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  weeklySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  todayLabel: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedDay: {
    backgroundColor: '#4CAF50',
  },
  todayCircle: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  actionSection: {
    padding: 20,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    minWidth: 80,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 6,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HabitDetailScreen;
