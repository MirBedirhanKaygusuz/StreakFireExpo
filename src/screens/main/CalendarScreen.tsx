import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / 7; // 7 days in a week

const CalendarScreen: React.FC = () => {
  const { habits, completions } = useSelector((state: RootState) => state.habits);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Generate calendar data for the current month
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    
    return calendarDays;
  };

  // Get habit completion data for a specific date
  const getHabitDataForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Get completions for this specific date
    const dayCompletions = completions.filter(completion => 
      completion.completedAt === dateString
    );
    
    const completedHabitIds = dayCompletions.map(c => c.habitId);
    const totalHabits = habits.length;
    const completedCount = completedHabitIds.length;
    
    return {
      completed: completedCount,
      total: totalHabits,
      completionRate: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
      completedHabitIds,
    };
  };

  // Get color intensity based on completion rate
  const getCompletionColor = (completionRate: number) => {
    if (completionRate === 0) return '#F5F5F5';
    if (completionRate <= 25) return '#FFCDD2';
    if (completionRate <= 50) return '#FFB3BA';
    if (completionRate <= 75) return '#FF8A95';
    return '#FF6B6B';
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Handle day selection
  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    const habitData = getHabitDataForDate(date);
    
    Alert.alert(
      `${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      `Completed: ${habitData.completed}/${habitData.total} habits\nCompletion Rate: ${Math.round(habitData.completionRate)}%`,
      [{ text: 'OK' }]
    );
  };

  // Get selected date habit details
  const getSelectedDateDetails = () => {
    const habitData = getHabitDataForDate(selectedDate);
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // Get completions for this date
    const dayCompletions = completions.filter(completion => 
      completion.completedAt === dateString
    );
    
    const completedHabitIds = dayCompletions.map(c => c.habitId);
    
    const completedHabits = habits.filter(habit => 
      completedHabitIds.includes(habit.id)
    );
    
    const pendingHabits = habits.filter(habit => 
      !completedHabitIds.includes(habit.id)
    );

    return {
      ...habitData,
      completedHabits,
      pendingHabits,
    };
  };

  // Get monthly completion rate
  const getMonthlyCompletionRate = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let totalCompletions = 0;
    let totalPossibleCompletions = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Count completions for this day
      const dayCompletions = completions.filter(completion => 
        completion.completedAt === dateString
      );
      
      totalCompletions += dayCompletions.length;
      totalPossibleCompletions += habits.length;
    }
    
    return totalPossibleCompletions > 0 ? (totalCompletions / totalPossibleCompletions) * 100 : 0;
  };

  // Get best streak this month (day with highest completion rate)
  const getBestStreakThisMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let bestDay = 0;
    let bestRate = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const habitData = getHabitDataForDate(date);
      
      if (habitData.completionRate > bestRate) {
        bestRate = habitData.completionRate;
        bestDay = day;
      }
    }
    
    return bestDay;
  };

  // Get perfect days count (100% completion)
  const getPerfectDaysCount = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let perfectDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const habitData = getHabitDataForDate(date);
      
      if (habitData.completionRate === 100 && habitData.total > 0) {
        perfectDays++;
      }
    }
    
    return perfectDays;
  };

  const calendarDays = generateCalendarData();
  const selectedDetails = getSelectedDateDetails();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Habit Calendar</Text>
        <Text style={styles.headerSubtitle}>Track your daily progress</Text>
      </LinearGradient>

      {/* Calendar Navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.dayHeader}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.emptyCell} />;
          }

          const habitData = getHabitDataForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarCell,
                {
                  backgroundColor: getCompletionColor(habitData.completionRate),
                  borderColor: isSelected ? '#FF6B6B' : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                }
              ]}
              onPress={() => handleDayPress(date)}
            >
              <Text style={[
                styles.dayNumber,
                { color: isToday ? '#FF6B6B' : '#333' },
                { fontWeight: isToday ? 'bold' : 'normal' }
              ]}>
                {date.getDate()}
              </Text>
              
              {habitData.completed > 0 && (
                <View style={styles.completionIndicator}>
                  <Text style={styles.completionText}>
                    {habitData.completed}/{habitData.total}
                  </Text>
                </View>
              )}
              
              {isToday && (
                <View style={styles.todayIndicator}>
                  <MaterialCommunityIcons name="circle" size={6} color="#FF6B6B" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Monthly Stats Summary */}
      <View style={styles.monthlyStats}>
        <Text style={styles.monthlyStatsTitle}>Monthly Overview</Text>
        <View style={styles.monthlyStatsRow}>
          <View style={styles.monthlyStatCard}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#4CAF50" />
            <Text style={styles.monthlyStatValue}>
              {Math.round(getMonthlyCompletionRate())}%
            </Text>
            <Text style={styles.monthlyStatLabel}>Avg. Completion</Text>
          </View>
          
          <View style={styles.monthlyStatCard}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#FF6B6B" />
            <Text style={styles.monthlyStatValue}>
              {getBestStreakThisMonth()}
            </Text>
            <Text style={styles.monthlyStatLabel}>Best Day</Text>
          </View>
          
          <View style={styles.monthlyStatCard}>
            <MaterialCommunityIcons name="target" size={24} color="#2196F3" />
            <Text style={styles.monthlyStatValue}>
              {getPerfectDaysCount()}
            </Text>
            <Text style={styles.monthlyStatLabel}>Perfect Days</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Completion Rate</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F5F5F5' }]} />
            <Text style={styles.legendText}>0%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFCDD2' }]} />
            <Text style={styles.legendText}>1-25%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFB3BA' }]} />
            <Text style={styles.legendText}>26-50%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF8A95' }]} />
            <Text style={styles.legendText}>51-75%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>76-100%</Text>
          </View>
        </View>
      </View>

      {/* Selected Date Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{selectedDetails.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="circle-outline" size={24} color="#FFC107" />
            <Text style={styles.statValue}>{selectedDetails.pendingHabits.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="percent" size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{Math.round(selectedDetails.completionRate)}%</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>

        {/* Completed Habits */}
        {selectedDetails.completedHabits.length > 0 && (
          <View style={styles.habitsSection}>
            <Text style={styles.habitsSectionTitle}>✅ Completed Habits</Text>
            {selectedDetails.completedHabits.map(habit => (
              <View key={habit.id} style={styles.habitItem}>
                <View style={[styles.habitColorDot, { backgroundColor: habit.color }]} />
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.title}</Text>
                  <Text style={styles.habitCategory}>{habit.category}</Text>
                </View>
                <View style={styles.streakBadge}>
                  <MaterialCommunityIcons name="fire" size={14} color="#FF6B6B" />
                  <Text style={styles.streakText}>{habit.currentStreak}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pending Habits */}
        {selectedDetails.pendingHabits.length > 0 && (
          <View style={styles.habitsSection}>
            <Text style={styles.habitsSectionTitle}>⏳ Pending Habits</Text>
            {selectedDetails.pendingHabits.map(habit => (
              <View key={habit.id} style={styles.habitItem}>
                <View style={[styles.habitColorDot, { backgroundColor: habit.color, opacity: 0.5 }]} />
                <MaterialCommunityIcons name="circle-outline" size={20} color="#FFC107" />
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: '#666' }]}>{habit.title}</Text>
                  <Text style={[styles.habitCategory, { color: '#999' }]}>{habit.category}</Text>
                </View>
                <View style={[styles.streakBadge, { backgroundColor: '#F5F5F5' }]}>
                  <MaterialCommunityIcons name="fire" size={14} color="#666" />
                  <Text style={[styles.streakText, { color: '#666' }]}>{habit.currentStreak}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthYear: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  calendarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  completionIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  completionText: {
    fontSize: 8,
    color: '#333',
    fontWeight: '600',
  },
  todayIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  legend: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginBottom: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  detailsSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  habitsSection: {
    marginTop: 15,
  },
  habitsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 5,
  },
  habitColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  habitInfo: {
    flex: 1,
    marginLeft: 10,
  },
  habitName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  habitCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 2,
    fontWeight: '600',
  },
  monthlyStats: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthlyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  monthlyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CalendarScreen;
