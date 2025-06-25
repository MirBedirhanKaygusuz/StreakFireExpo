import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store/store';
// import { updateUserSettings } from '../../store/slices/authSlice';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [darkMode, setDarkMode] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement settings save functionality
      // await dispatch(updateUserSettings({
      //   darkMode,
      //   notifications: {
      //     dailyReminders,
      //     streakReminders,
      //     socialNotifications,
      //     groupNotifications,
      //     soundEnabled,
      //     vibrationEnabled,
      //   },
      // }));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  type SettingItem = 
    | { icon: string; title: string; description?: string; type: 'switch'; value: boolean; onValueChange: (value: boolean) => void }
    | { icon: string; title: string; description?: string; type: 'link'; onPress: () => void }
    | { icon: string; title: string; description?: string; type: 'info' };

  type SettingSection = {
    title: string;
    items: SettingItem[];
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'theme-light-dark',
          title: 'Dark Mode',
          description: 'Switch to dark theme',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell-outline',
          title: 'Daily Reminders',
          description: 'Get reminded to complete your habits',
          type: 'switch',
          value: dailyReminders,
          onValueChange: setDailyReminders,
        },
        {
          icon: 'fire',
          title: 'Streak Reminders',
          description: 'Notifications about streak milestones',
          type: 'switch',
          value: streakReminders,
          onValueChange: setStreakReminders,
        },
        {
          icon: 'heart-outline',
          title: 'Social Notifications',
          description: 'Likes, comments, and new followers',
          type: 'switch',
          value: socialNotifications,
          onValueChange: setSocialNotifications,
        },
        {
          icon: 'account-group-outline',
          title: 'Group Notifications',
          description: 'Group invites and activities',
          type: 'switch',
          value: groupNotifications,
          onValueChange: setGroupNotifications,
        },
      ],
    },
    {
      title: 'Sound & Vibration',
      items: [
        {
          icon: 'volume-high',
          title: 'Sound',
          description: 'Play sounds for notifications',
          type: 'switch',
          value: soundEnabled,
          onValueChange: setSoundEnabled,
        },
        {
          icon: 'vibrate',
          title: 'Vibration',
          description: 'Vibrate for notifications',
          type: 'switch',
          value: vibrationEnabled,
          onValueChange: setVibrationEnabled,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'lock-outline',
          title: 'Privacy Policy',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'file-document-outline',
          title: 'Terms of Service',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'shield-check-outline',
          title: 'Data & Security',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-outline',
          title: 'App Version',
          description: '1.0.0',
          type: 'info',
        },
        {
          icon: 'email-outline',
          title: 'Contact Support',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex === section.items.length - 1 && styles.lastItem,
                ]}
                onPress={item.type === 'link' ? (item as any).onPress : undefined}
                disabled={item.type === 'switch' || item.type === 'info'}
              >
                <MaterialCommunityIcons name={item.icon as any} size={24} color="#666" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  )}
                </View>
                {item.type === 'switch' && (
                  <Switch
                    value={(item as any).value}
                    onValueChange={(item as any).onValueChange}
                    trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                    thumbColor="#FFFFFF"
                  />
                )}
                {item.type === 'link' && (
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <MaterialCommunityIcons name="delete-outline" size={20} color="#FF3B30" />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ by StreakFire Team
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default SettingsScreen;
