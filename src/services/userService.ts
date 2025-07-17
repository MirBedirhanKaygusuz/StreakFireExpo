import { supabase } from './supabase'
import { Database } from '../types/supabase.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export const userService = {
  // Kullanıcı profili getir
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Profil güncelle
  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kullanıcı puanlarını getir
  async getUserPoints(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kullanıcı puanlarını güncelle
  async updateUserPoints(userId: string, pointsToAdd: number): Promise<any> {
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;

    const newTotalPoints = currentPoints.total_points + pointsToAdd;
    const newWeekPoints = currentPoints.points_this_week + pointsToAdd;
    const newMonthPoints = currentPoints.points_this_month + pointsToAdd;
    const newExperience = currentPoints.experience_points + pointsToAdd;
    
    // Level hesaplama (her 1000 puan = 1 level)
    const newLevel = Math.floor(newExperience / 1000) + 1;

    const { data, error } = await supabase
      .from('user_points')
      .update({
        total_points: newTotalPoints,
        points_this_week: newWeekPoints,
        points_this_month: newMonthPoints,
        experience_points: newExperience,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Liderlik tablosunu getir
  async getLeaderboard(timeframe: 'week' | 'month' | 'all' = 'week'): Promise<any[]> {
    let orderBy = 'total_points';
    
    switch (timeframe) {
      case 'week':
        orderBy = 'points_this_week';
        break;
      case 'month':
        orderBy = 'points_this_month';
        break;
      default:
        orderBy = 'total_points';
    }

    const { data, error } = await supabase
      .from('user_points')
      .select(`
        *,
        user:user_id(
          id,
          user_profiles(username, display_name, avatar_url)
        )
      `)
      .order(orderBy, { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  },

  // Kullanıcı başarımlarını getir
  async getUserAchievements(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievement_id(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Başarım kazandır
  async awardAchievement(userId: string, achievementId: string, habitId?: string): Promise<any> {
    // Zaten kazanılmış mı kontrol et
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
    
    if (existing) return existing;

    // Başarım bilgilerini al
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();
    
    if (achievementError) throw achievementError;

    // Başarımı kaydet
    const { data: userAchievement, error: saveError } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        habit_id: habitId,
        earned_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (saveError) throw saveError;

    // Puan ekle
    await this.updateUserPoints(userId, achievement.points_reward);

    return userAchievement;
  },

  // Kullanıcı istatistikleri
  async getUserStats(userId: string): Promise<any> {
    // Toplam alışkanlık sayısı
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (habitsError) throw habitsError;

    // Bu ay tamamlanan alışkanlık sayısı
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: thisMonthCompletions, error: monthError } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', userId)
      .gte('completion_date', `${currentMonth}-01`);
    
    if (monthError) throw monthError;

    // Bu hafta tamamlanan alışkanlık sayısı
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: thisWeekCompletions, error: weekError } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', userId)
      .gte('completion_date', weekAgo.toISOString().split('T')[0]);
    
    if (weekError) throw weekError;

    // En uzun streak
    const { data: longestStreakHabit, error: streakError } = await supabase
      .from('habits')
      .select('longest_streak')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('longest_streak', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (streakError) throw streakError;

    // Başarım sayısı
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId);
    
    if (achievementsError) throw achievementsError;

    return {
      totalHabits: habits?.length || 0,
      completionsThisMonth: thisMonthCompletions?.length || 0,
      completionsThisWeek: thisWeekCompletions?.length || 0,
      longestStreak: longestStreakHabit?.longest_streak || 0,
      totalAchievements: achievements?.length || 0,
    };
  },

  // Kullanıcı arama
  async searchUsers(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url')
      .or(`username.ilike.%${query}%, display_name.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  // Haftalık/aylık puanları sıfırla (cron job için)
  async resetWeeklyPoints(): Promise<void> {
    const { error } = await supabase
      .from('user_points')
      .update({ points_this_week: 0 });
    
    if (error) throw error;
  },

  async resetMonthlyPoints(): Promise<void> {
    const { error } = await supabase
      .from('user_points')
      .update({ points_this_month: 0 });
    
    if (error) throw error;
  }
};
