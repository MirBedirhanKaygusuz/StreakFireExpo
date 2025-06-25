import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export const setupNotifications = () => {
  // Configure push notifications
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
      // Save token to Firestore for the current user
      saveDeviceToken(token.token);
    },

    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      
      // Handle notification based on type
      handleNotification(notification);
      
      // Required on iOS
      notification.finish('backgroundFetchResultNoData');
    },

    onAction: function (notification) {
      console.log('ACTION:', notification.action);
      console.log('NOTIFICATION:', notification);
    },

    onRegistrationError: function(err) {
      console.error(err.message, err);
    },

    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create notification channels for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'streak-reminders',
        channelName: 'Streak Reminders',
        channelDescription: 'Reminders to maintain your streaks',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'streak-reminders' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'social-interactions',
        channelName: 'Social Interactions',
        channelDescription: 'Likes, comments, and social updates',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'social-interactions' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'group-activities',
        channelName: 'Group Activities',
        channelDescription: 'Group invites and updates',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'group-activities' returned '${created}'`)
    );
  }
};

const saveDeviceToken = async (token: string) => {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      await firestore().collection('users').doc(userId).update({
        deviceToken: token,
        devicePlatform: Platform.OS,
        lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving device token:', error);
  }
};

const getCurrentUserId = async (): Promise<string | null> => {
  // This should be retrieved from your auth state
  // For now, returning null
  return null;
};

const handleNotification = (notification: any) => {
  const { data } = notification;
  
  if (data) {
    switch (data.type) {
      case 'streak_reminder':
        // Handle streak reminder
        break;
      case 'group_invite':
        // Handle group invite
        break;
      case 'social_interaction':
        // Handle social interaction
        break;
      default:
        // Handle other notifications
        break;
    }
  }
};

// Notification helpers
export const scheduleStreakReminder = (habitId: string, habitName: string, time: Date) => {
  PushNotification.localNotificationSchedule({
    channelId: 'streak-reminders',
    id: habitId,
    title: '🔥 Streak Reminder!',
    message: `Time to complete "${habitName}" and keep your streak alive!`,
    date: time,
    repeatType: 'day',
    userInfo: { habitId, type: 'streak_reminder' },
    allowWhileIdle: true,
    importance: 'high',
    priority: 'high',
  });
};

export const cancelStreakReminder = (habitId: string) => {
  PushNotification.cancelLocalNotification(habitId);
};

export const sendLocalNotification = (title: string, message: string, data?: any) => {
  PushNotification.localNotification({
    channelId: 'social-interactions',
    title,
    message,
    userInfo: data,
    playSound: true,
    soundName: 'default',
  });
};

export const updateBadgeCount = (count: number) => {
  PushNotification.setApplicationIconBadgeNumber(count);
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    PushNotification.checkPermissions((permissions) => {
      if (!permissions.alert || !permissions.badge || !permissions.sound) {
        PushNotification.requestPermissions().then((granted) => {
          resolve(granted.alert === true && granted.badge === true && granted.sound === true);
        });
      } else {
        resolve(true);
      }
    });
  });
};

// Notification templates
export const notificationTemplates = {
  streakAtRisk: (habitName: string, currentStreak: number) => ({
    title: '⚠️ Streak at Risk!',
    message: `Your ${currentStreak}-day streak for "${habitName}" will end soon. Complete it now!`,
  }),
  
  streakMilestone: (habitName: string, days: number) => ({
    title: '🎉 Milestone Achieved!',
    message: `Amazing! You've maintained "${habitName}" for ${days} days straight!`,
  }),
  
  groupStreakUpdate: (groupName: string, streak: number) => ({
    title: '👥 Group Streak Update',
    message: `Your group "${groupName}" has reached a ${streak}-day streak!`,
  }),
  
  socialInteraction: (userName: string, action: string) => ({
    title: '💬 New Activity',
    message: `${userName} ${action}`,
  }),
  
  referralReward: (friendName: string) => ({
    title: '🎁 Referral Reward!',
    message: `${friendName} joined using your code! You've earned a streak protection.`,
  }),
};

export default {
  setupNotifications,
  scheduleStreakReminder,
  cancelStreakReminder,
  sendLocalNotification,
  updateBadgeCount,
  requestNotificationPermissions,
  notificationTemplates,
};
