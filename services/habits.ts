import { supabase } from '@/lib/supabase';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: 'health' | 'education' | 'fitness' | 'mindfulness' | 'productivity' | 'other';
  description?: string;
  targetFrequency: 'daily' | 'weekly';
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
  isActive: boolean;
  color: string;
  reminderTime?: string;
  icon: string;
  difficultyLevel: number;
  estimatedTime: number;
  targetDaysPerWeek: number;
  reminderEnabled: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completionDate: string;
  completionTime: string;
  moodRating?: number;
  notes?: string;
  pointsEarned: number;
  completionMethod: string;
  streakLengthAtCompletion: number;
}

export const habitsService = {
  async getUserHabits(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(habit => ({
      id: habit.id,
      userId: habit.user_id,
      title: habit.title,
      category: habit.category as Habit['category'],
      description: habit.description || undefined,
      targetFrequency: habit.target_frequency as 'daily' | 'weekly',
      currentStreak: habit.current_streak,
      longestStreak: habit.longest_streak,
      lastCompletedDate: await this.getLastCompletionDate(habit.id),
      createdAt: habit.created_at,
      isActive: habit.is_active,
      color: habit.color_theme,
      reminderTime: habit.reminder_time,
      icon: habit.icon,
      difficultyLevel: habit.difficulty_level,
      estimatedTime: habit.estimated_time,
      targetDaysPerWeek: habit.target_days_per_week,
      reminderEnabled: habit.reminder_enabled,
    }));
  },

  async createHabit(userId: string, habitData: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'lastCompletedDate'>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        title: habitData.title,
        description: habitData.description,
        category: habitData.category,
        target_frequency: habitData.targetFrequency,
        current_streak: 0,
        longest_streak: 0,
        is_active: habitData.isActive,
        color_theme: habitData.color,
        icon: habitData.icon,
        difficulty_level: habitData.difficultyLevel,
        estimated_time: habitData.estimatedTime,
        target_days_per_week: habitData.targetDaysPerWeek,
        reminder_time: habitData.reminderTime,
        reminder_enabled: habitData.reminderEnabled,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      category: data.category as Habit['category'],
      description: data.description || undefined,
      targetFrequency: data.target_frequency as 'daily' | 'weekly',
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      createdAt: data.created_at,
      isActive: data.is_active,
      color: data.color_theme,
      reminderTime: data.reminder_time,
      icon: data.icon,
      difficultyLevel: data.difficulty_level,
      estimatedTime: data.estimated_time,
      targetDaysPerWeek: data.target_days_per_week,
      reminderEnabled: data.reminder_enabled,
    };
  },

  async completeHabit(userId: string, habitId: string, notes?: string, moodRating?: number): Promise<{ habit: Habit; completion: HabitCompletion }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed today
    const { data: existingCompletion } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completion_date', today)
      .single();

    if (existingCompletion) {
      throw new Error('Habit already completed today');
    }

    // Get current habit data
    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError) throw habitError;

    // Calculate new streak
    const lastCompletionDate = await this.getLastCompletionDate(habitId);
    let newStreak = 1;
    
    if (lastCompletionDate) {
      const lastDate = new Date(lastCompletionDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = habitData.current_streak + 1;
      }
    }

    const newLongestStreak = Math.max(newStreak, habitData.longest_streak);
    const pointsEarned = this.calculatePoints(habitData.difficulty_level, newStreak);

    // Update habit streak
    const { error: updateError } = await supabase
      .from('habits')
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId);

    if (updateError) throw updateError;

    // Create completion record
    const { data: completionData, error: completionError } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        user_id: userId,
        completion_date: today,
        completion_time: new Date().toISOString(),
        mood_rating: moodRating,
        notes,
        points_earned: pointsEarned,
        completion_method: 'manual',
        streak_length_at_completion: newStreak,
      })
      .select()
      .single();

    if (completionError) throw completionError;

    // Update user points
    await this.updateUserPoints(userId, pointsEarned);

    const updatedHabit: Habit = {
      id: habitData.id,
      userId: habitData.user_id,
      title: habitData.title,
      category: habitData.category as Habit['category'],
      description: habitData.description || undefined,
      targetFrequency: habitData.target_frequency as 'daily' | 'weekly',
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
      createdAt: habitData.created_at,
      isActive: habitData.is_active,
      color: habitData.color_theme,
      reminderTime: habitData.reminder_time,
      icon: habitData.icon,
      difficultyLevel: habitData.difficulty_level,
      estimatedTime: habitData.estimated_time,
      targetDaysPerWeek: habitData.target_days_per_week,
      reminderEnabled: habitData.reminder_enabled,
    };

    const completion: HabitCompletion = {
      id: completionData.id,
      habitId: completionData.habit_id,
      userId: completionData.user_id,
      completionDate: completionData.completion_date,
      completionTime: completionData.completion_time,
      moodRating: completionData.mood_rating || undefined,
      notes: completionData.notes || undefined,
      pointsEarned: completionData.points_earned,
      completionMethod: completionData.completion_method,
      streakLengthAtCompletion: completionData.streak_length_at_completion,
    };

    return { habit: updatedHabit, completion };
  },

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getLastCompletionDate(habitId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('completion_date')
      .eq('habit_id', habitId)
      .order('completion_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.completion_date;
  },

  calculatePoints(difficultyLevel: number, streakLength: number): number {
    const basePoints = difficultyLevel * 10;
    const streakBonus = Math.floor(streakLength / 7) * 5; // Bonus every 7 days
    return basePoints + streakBonus;
  },

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      // Create user points record if it doesn't exist
      await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: pointsToAdd,
          points_this_month: pointsToAdd,
          points_this_week: pointsToAdd,
          level: 1,
          experience_points: pointsToAdd,
        });
      return;
    }

    const newTotalPoints = currentPoints.total_points + pointsToAdd;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // Level up every 1000 points

    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: newTotalPoints,
        points_this_month: currentPoints.points_this_month + pointsToAdd,
        points_this_week: currentPoints.points_this_week + pointsToAdd,
        level: newLevel,
        experience_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  },
};