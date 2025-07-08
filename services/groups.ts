import { supabase } from '@/lib/supabase';

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  habitId?: string;
  habitName: string;
  members: GroupMember[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
  isActive: boolean;
  challengeType: string;
  maxMembers: number;
  currentMembers: number;
  startDate: string;
  endDate?: string;
  isPublic: boolean;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  completionRate: number;
  lastCompleted?: string;
  isAdmin: boolean;
  role: string;
}

export const groupsService = {
  async getUserGroups(userId: string): Promise<Group[]> {
    const { data: memberships, error: membershipError } = await supabase
      .from('group_memberships')
      .select(`
        group_id,
        joined_at,
        role,
        groups (
          id,
          name,
          description,
          creator_id,
          challenge_type,
          max_members,
          current_members,
          start_date,
          end_date,
          is_public,
          is_active,
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (membershipError) throw membershipError;

    const groups: Group[] = [];

    for (const membership of memberships) {
      if (!membership.groups) continue;

      const group = membership.groups as any;
      
      // Get all members for this group
      const { data: allMembers, error: membersError } = await supabase
        .from('group_memberships')
        .select(`
          user_id,
          joined_at,
          role,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', group.id)
        .eq('is_active', true);

      if (membersError) throw membersError;

      const members: GroupMember[] = allMembers.map(member => ({
        userId: member.user_id,
        userName: (member.user_profiles as any)?.display_name || 'Unknown User',
        userAvatar: (member.user_profiles as any)?.avatar_url || undefined,
        joinedAt: member.joined_at,
        completionRate: 85, // This would need to be calculated based on actual completions
        isAdmin: member.role === 'admin',
        role: member.role,
      }));

      groups.push({
        id: group.id,
        name: group.name,
        description: group.description || '',
        creatorId: group.creator_id,
        habitName: 'Group Challenge', // This would need to be linked to actual habits
        members,
        currentStreak: 0, // This would need to be calculated
        longestStreak: 0, // This would need to be calculated
        createdAt: group.created_at,
        isActive: group.is_active,
        challengeType: group.challenge_type,
        maxMembers: group.max_members,
        currentMembers: group.current_members,
        startDate: group.start_date,
        endDate: group.end_date || undefined,
        isPublic: group.is_public,
      });
    }

    return groups;
  },

  async createGroup(userId: string, groupData: {
    name: string;
    description: string;
    habitName: string;
    isPublic: boolean;
    maxMembers?: number;
  }): Promise<Group> {
    const { data: groupRecord, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        creator_id: userId,
        challenge_type: 'habit_challenge',
        max_members: groupData.maxMembers || 50,
        current_members: 1,
        start_date: new Date().toISOString().split('T')[0],
        is_public: groupData.isPublic,
        is_active: true,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as admin member
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert({
        group_id: groupRecord.id,
        user_id: userId,
        role: 'admin',
        is_active: true,
      });

    if (membershipError) throw membershipError;

    // Get creator profile
    const { data: creatorProfile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', userId)
      .single();

    const creator: GroupMember = {
      userId,
      userName: creatorProfile?.display_name || 'Unknown User',
      userAvatar: creatorProfile?.avatar_url || undefined,
      joinedAt: new Date().toISOString(),
      completionRate: 0,
      isAdmin: true,
      role: 'admin',
    };

    return {
      id: groupRecord.id,
      name: groupRecord.name,
      description: groupRecord.description || '',
      creatorId: groupRecord.creator_id,
      habitName: groupData.habitName,
      members: [creator],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: groupRecord.created_at,
      isActive: groupRecord.is_active,
      challengeType: groupRecord.challenge_type,
      maxMembers: groupRecord.max_members,
      currentMembers: groupRecord.current_members,
      startDate: groupRecord.start_date,
      endDate: groupRecord.end_date || undefined,
      isPublic: groupRecord.is_public,
    };
  },

  async joinGroup(userId: string, groupId: string): Promise<void> {
    // Check if group exists and has space
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('current_members, max_members')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;

    if (group.current_members >= group.max_members) {
      throw new Error('Group is full');
    }

    // Add user to group
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        is_active: true,
      });

    if (membershipError) throw membershipError;

    // Update group member count
    const { error: updateError } = await supabase
      .from('groups')
      .update({
        current_members: group.current_members + 1,
      })
      .eq('id', groupId);

    if (updateError) throw updateError;
  },

  async leaveGroup(userId: string, groupId: string): Promise<void> {
    // Deactivate membership
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (membershipError) throw membershipError;

    // Update group member count
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('current_members')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from('groups')
      .update({
        current_members: Math.max(0, group.current_members - 1),
      })
      .eq('id', groupId);

    if (updateError) throw updateError;
  },

  async getPublicGroups(limit: number = 20): Promise<Group[]> {
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        creator_id,
        challenge_type,
        max_members,
        current_members,
        start_date,
        end_date,
        is_public,
        is_active,
        created_at
      `)
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform to Group format (simplified for public listing)
    return groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description || '',
      creatorId: group.creator_id,
      habitName: 'Group Challenge',
      members: [], // Don't load all members for public listing
      currentStreak: 0,
      longestStreak: 0,
      createdAt: group.created_at,
      isActive: group.is_active,
      challengeType: group.challenge_type,
      maxMembers: group.max_members,
      currentMembers: group.current_members,
      startDate: group.start_date,
      endDate: group.end_date || undefined,
      isPublic: group.is_public,
    }));
  },
};