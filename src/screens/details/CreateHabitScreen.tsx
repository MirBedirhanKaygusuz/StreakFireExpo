import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDispatch } from '../../store/store';
import { createHabit } from '../../store/slices/habitsSlice';

const categories = [
  { id: 'health', name: 'Health', icon: 'heart-pulse', color: '#FF6B6B' },
  { id: 'fitness', name: 'Fitness', icon: 'run', color: '#4CAF50' },
  { id: 'education', name: 'Education', icon: 'school', color: '#2196F3' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'meditation', color: '#9C27B0' },
  { id: 'productivity', name: 'Productivity', icon: 'rocket-launch', color: '#FF9800' },
  { id: 'other', name: 'Other', icon: 'star', color: '#607D8B' },
];

const CreateHabitScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHabit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    setIsLoading(true);
    try {
      const selectedCat = categories.find(c => c.id === selectedCategory);
      await dispatch(createHabit({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory as 'health' | 'fitness' | 'education' | 'mindfulness' | 'productivity' | 'other',
        targetFrequency,
        reminderTime,
        color: selectedCat?.color || '#FF6B6B',
        isActive: true,
      })).unwrap();
      
      Alert.alert(
        'Success!',
        'Your new habit has been created. Start building your streak today!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Drink 8 glasses of water"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details about your habit..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardSelected,
                    { borderColor: selectedCategory === category.id ? category.color : '#E0E0E0' },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? category.color : '#666'}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory === category.id && { color: category.color },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  targetFrequency === 'daily' && styles.frequencyButtonSelected,
                ]}
                onPress={() => setTargetFrequency('daily')}
              >
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={20}
                  color={targetFrequency === 'daily' ? '#FFFFFF' : '#666'}
                />
                <Text
                  style={[
                    styles.frequencyText,
                    targetFrequency === 'daily' && styles.frequencyTextSelected,
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  targetFrequency === 'weekly' && styles.frequencyButtonSelected,
                ]}
                onPress={() => setTargetFrequency('weekly')}
              >
                <MaterialCommunityIcons
                  name="calendar-week"
                  size={20}
                  color={targetFrequency === 'weekly' ? '#FFFFFF' : '#666'}
                />
                <Text
                  style={[
                    styles.frequencyText,
                    targetFrequency === 'weekly' && styles.frequencyTextSelected,
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Time</Text>
            <TouchableOpacity style={styles.timeButton}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <Text style={styles.timeText}>{reminderTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateHabit}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  categoryCardSelected: {
    backgroundColor: '#FFF0F0',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  frequencyButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  frequencyText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  frequencyTextSelected: {
    color: '#FFFFFF',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CreateHabitScreen;
