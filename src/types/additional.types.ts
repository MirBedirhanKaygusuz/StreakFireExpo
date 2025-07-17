// Eksik interface'ler - veritabanı şemasını tamamlamak için

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  habit_id?: string;
  achievement?: Achievement;
}

export interface StreakProtection {
  id: string;
  user_id: string;
  habit_id: string;
  protection_type: 'freeze' | 'weekend_pass' | 'emergency';
  duration_days: number;
  used_date?: string;
  purchased_at: string;
  expires_at: string;
  is_used: boolean;
  price_paid: number;
}

export interface AccountabilityPartnership {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'ended';
  created_at: string;
  activated_at?: string;
  ended_at?: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  role: 'member' | 'admin' | 'moderator';
  is_active: boolean;
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Tarih formatı yardımcı fonksiyonları
export const formatDate = (date: string | Date): string => {
  return new Date(date).toISOString().split('T')[0];
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toISOString();
};

export const isToday = (date: string): boolean => {
  const today = formatDate(new Date());
  return formatDate(date) === today;
};

// Streak hesaplama yardımcısı
export const calculateStreak = (completions: { completion_date: string }[]): number => {
  if (!completions.length) return 0;
  
  const sortedDates = completions
    .map(c => formatDate(c.completion_date))
    .sort()
    .reverse();
    
  let streak = 0;
  let currentDate = formatDate(new Date());
  
  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      // Bir gün geriye git
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      currentDate = formatDate(yesterday);
    } else {
      break;
    }
  }
  
  return streak;
};
