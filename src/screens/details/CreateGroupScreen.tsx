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
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store/store';
import { createGroup } from '../../store/slices/groupsSlice';

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [groupName, setGroupName] = useState('');
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !habitName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(createGroup({
        name: groupName.trim(),
        habitName: habitName.trim(),
        description: description.trim(),
        habitId: '', // This would typically be linked to an existing habit
      })).unwrap();
      
      Alert.alert(
        'Success!',
        'Your group has been created. Invite friends to join!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
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
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Runners"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={30}
            />
            <Text style={styles.charCount}>{groupName.length}/30</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Run 5km every morning"
              value={habitName}
              onChangeText={setHabitName}
              maxLength={50}
            />
            <Text style={styles.charCount}>{habitName.length}/50</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your group's goals and rules..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          <View style={styles.privacySection}>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setIsPrivate(false)}
            >
              <View style={[styles.radio, !isPrivate && styles.radioSelected]}>
                {!isPrivate && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyInfo}>
                <Text style={styles.privacyTitle}>Public Group</Text>
                <Text style={styles.privacyDescription}>
                  Anyone can find and join this group
                </Text>
              </View>
              <MaterialCommunityIcons name="earth" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setIsPrivate(true)}
            >
              <View style={[styles.radio, isPrivate && styles.radioSelected]}>
                {isPrivate && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyInfo}>
                <Text style={styles.privacyTitle}>Private Group</Text>
                <Text style={styles.privacyDescription}>
                  Only invited members can join
                </Text>
              </View>
              <MaterialCommunityIcons name="lock" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              As the group creator, you'll be the admin. You can invite members,
              manage the group, and everyone must complete the habit to maintain
              the group streak!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Group'}
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
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  privacySection: {
    marginBottom: 25,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#FF6B6B',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
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

export default CreateGroupScreen;
