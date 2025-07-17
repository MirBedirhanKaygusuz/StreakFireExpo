import { supabase } from './supabase';
import { Database } from '../types/supabase.types';
import { formatDate, calculateStreak } from '../types/additional.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];

export const habitService = {
  // Tüm alışkanlıkları getir - completion bilgileriyle birlikte
  async getHabits(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_completions(
          id,
          completion_date,
          completion_time,
          mood_rating,
          notes,
          points_earned
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Her alışkanlık için calculated fields ekle
    return (data || []).map(habit => {
      const completions = habit.habit_completions || [];
      const lastCompletion = completions
        .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())[0];
      
      return {
        ...habit,
        lastCompletedDate: lastCompletion ? formatDate(lastCompletion.completion_date) : null,
        completions: completions,
        current_streak: calculateStreak(completions)
      };
    });
  },

  // Belirli bir alışkanlığı getir
  async getHabit(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni alışkanlık oluştur
  async createHabit(habit: HabitInsert): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert([{
        ...habit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Alışkanlık güncelle
  async updateHabit(id: string, updates: HabitUpdate): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Alışkanlık tamamla
  async completeHabit(habitId: string, userId: string, notes?: string): Promise<{ habit: Habit; completion: any }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Önce habit bilgilerini al
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();
    
    if (habitError) throw habitError;

    // Bugün zaten tamamlanmış mı kontrol et
    const { data: existingCompletion, error: checkError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completion_date', today)
      .maybeSingle();
    
    if (checkError) throw checkError;
    if (existingCompletion) return { habit, completion: existingCompletion };

    // Yeni streak hesapla
    let newStreak = 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Dün tamamlanmış mı kontrol et
    const { data: yesterdayCompletion } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completion_date', yesterdayStr)
      .maybeSingle();
    
    if (yesterdayCompletion) {
      newStreak = habit.current_streak + 1;
    }
    
    // Tamamlama kaydet
    const { data: completion, error: completionError } = await supabase
      .from('habit_completions')
      .insert([{
        habit_id: habitId,
        user_id: userId,
        completion_date: today,
        completion_time: new Date().toISOString(),
        notes,
        streak_length_at_completion: newStreak,
        points_earned: 10
      }])
      .select()
      .single();
    
    if (completionError) throw completionError;

    // Habit'i güncelle
    const longestStreak = Math.max(newStreak, habit.longest_streak);
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', habitId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return { habit: updatedHabit, completion };
  },

  // Alışkanlık tamamlamasını geri al
  async uncompleteHabit(habitId: string, userId: string): Promise<Habit> {
    const today = new Date().toISOString().split('T')[0];
    
    // Bugünün tamamlamasını sil
    const { error: deleteError } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completion_date', today);
    
    if (deleteError) throw deleteError;

    // Streak'i yeniden hesapla
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();
    
    if (habitError) throw habitError;

    // Son tamamlama tarihini bul
    const { data: lastCompletion } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('completion_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    let newStreak = 0;
    if (lastCompletion) {
      // Streak'i yeniden hesapla
      newStreak = Math.max(0, habit.current_streak - 1);
    }

    // Habit'i güncelle
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({
        current_streak: newStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', habitId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return updatedHabit;
  },

  // Alışkanlık sil
  async deleteHabit(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Alışkanlık istatistikleri
  async getHabitStats(habitId: string, userId: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: completions, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .gte('completion_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('completion_date', { ascending: true });
    
    if (error) throw error;
    
    const totalCompletions = completions?.length || 0;
    const completionRate = (totalCompletions / 30) * 100;
    
    return {
      totalCompletions,
      completionRate: Math.round(completionRate),
      lastThirtyDays: completions || []
    };
  }
};
