import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../../store/store';

const HabitDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { habitId } = route.params;
  
  const habit = useSelector((state: RootState) => 
    state.habits.habits.find(h => h.id === habitId)
  );

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Habit not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.description}>{habit.description}</Text>
      </View>
      
      <View style={styles.streakInfo}>
        <MaterialCommunityIcons name="fire" size={48} color="#FF6B6B" />
        <Text style={styles.streakNumber}>{habit.currentStreak}</Text>
        <Text style={styles.streakLabel}>Current Streak</Text>
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  streakInfo: {
    alignItems: 'center',
    padding: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 10,
  },
  streakLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
});

export default HabitDetailScreen;
