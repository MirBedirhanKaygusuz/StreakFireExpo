import { supabase } from './supabase'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Database } from '../types/supabase.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  // İzinleri iste
  async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    }
    
    return false;
  },

  // Push notification token al
  async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Push token alınamadı:', error);
      return null;
    }
  },

  // Yerel bildirim gönder
  async scheduleLocalNotification(
    title: string, 
    body: string, 
    trigger: any = null,
    data: any = {}
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: trigger || { seconds: 2 },
    });
    
    return id;
  },

  // Alışkanlık hatırlatıcısı planla
  async scheduleHabitReminder(habit: any): Promise<string | null> {
    if (!habit.reminder_enabled || !habit.reminder_time) return null;
    
    // Saat ve dakikayı parse et
    const [hours, minutes] = habit.reminder_time.split(':').map(Number);
    
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };
    
    const id = await this.scheduleLocalNotification(
      'Alışkanlık Hatırlatıcı',
      `"${habit.title}" alışkanlığını tamamlama zamanı! 🎯`,
      trigger,
      { habitId: habit.id, type: 'habit_reminder' }
    );
    
    return id;
  },

  // Streak uyarısı gönder
  async scheduleStreakWarning(habit: any): Promise<string | null> {
    const id = await this.scheduleLocalNotification(
      'Streak Uyarısı! 🔥',
      `"${habit.title}" alışkanlığını bugün tamamlamayı unutma!`,
      { seconds: 60 * 60 * 2 }, // 2 saat sonra
      { habitId: habit.id, type: 'streak_warning' }
    );
    
    return id;
  },

  // Bildirim iptal et
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  // Tüm bildirimleri iptal et
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Veritabanına bildirim kaydet
  async createNotification(notification: NotificationInsert): Promise<NotificationRow> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kullanıcı bildirimlerini getir
  async getUserNotifications(userId: string): Promise<NotificationRow[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  },

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<NotificationRow> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  },

  // Okunmamış bildirim sayısı
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return data?.length || 0;
  },

  // Bildirim tercihleri güncelle
  async updateNotificationPreferences(userId: string, preferences: any): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        notification_preferences: preferences
      })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Grup daveti bildirimi gönder
  async sendGroupInviteNotification(
    invitedUserId: string, 
    groupName: string, 
    inviterName: string
  ): Promise<void> {
    await this.createNotification({
      user_id: invitedUserId,
      title: 'Grup Davetiniz Var! 👥',
      message: `${inviterName} sizi "${groupName}" grubuna davet etti.`,
      type: 'group_invite',
      data: { groupName, inviterName }
    });
  },

  // Başarım bildirimi gönder
  async sendAchievementNotification(
    userId: string, 
    achievementName: string, 
    achievementIcon: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Yeni Başarım Kazandınız! 🏆',
      message: `"${achievementName}" başarımını kazandınız!`,
      type: 'achievement_earned',
      data: { achievementName, achievementIcon }
    });

    // Yerel bildirim de gönder
    await this.scheduleLocalNotification(
      'Yeni Başarım! 🏆',
      `"${achievementName}" başarımını kazandınız!`,
      { seconds: 1 },
      { type: 'achievement', achievementName }
    );
  },

  // Streak milestone bildirimi
  async sendStreakMilestoneNotification(
    userId: string, 
    habitTitle: string, 
    streakCount: number
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Streak Başarısı! 🔥',
      message: `"${habitTitle}" alışkanlığında ${streakCount} günlük streak tamamladınız!`,
      type: 'streak_milestone',
      data: { habitTitle, streakCount }
    });

    // Yerel bildirim de gönder
    await this.scheduleLocalNotification(
      `${streakCount} Günlük Streak! 🔥`,
      `"${habitTitle}" alışkanlığında harika gidiyorsunuz!`,
      { seconds: 1 },
      { type: 'streak_milestone', streakCount, habitTitle }
    );
  },

  // Sosyal beğeni bildirimi
  async sendLikeNotification(
    userId: string, 
    likerName: string, 
    postContent: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Paylaşımınız Beğenildi! ❤️',
      message: `${likerName} paylaşımınızı beğendi: "${postContent.substring(0, 50)}..."`,
      type: 'social_like',
      data: { likerName, postContent }
    });
  },

  // Yorum bildirimi
  async sendCommentNotification(
    userId: string, 
    commenterName: string, 
    postContent: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Yeni Yorum! 💬',
      message: `${commenterName} paylaşımınıza yorum yaptı: "${postContent.substring(0, 50)}..."`,
      type: 'social_comment',
      data: { commenterName, postContent }
    });
  }
};
