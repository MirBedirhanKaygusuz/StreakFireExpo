import { supabase } from './supabase'
import { Database } from '../types/supabase.types'

type Group = Database['public']['Tables']['groups']['Row'];
type GroupInsert = Database['public']['Tables']['groups']['Insert'];
type GroupUpdate = Database['public']['Tables']['groups']['Update'];

export const groupService = {
  // Kullanıcının üye olduğu grupları getir - üyelik bilgileriyle birlikte
  async getUserGroups(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        groups:group_id(
          *,
          group_memberships!inner(
            id,
            user_id,
            role,
            joined_at,
            is_active,
            user_profiles!inner(
              id,
              display_name,
              avatar_url
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw error;
    
    return data?.map(membership => ({
      ...membership.groups,
      userMembership: {
        id: membership.id,
        group_id: membership.group_id,
        user_id: membership.user_id,
        role: membership.role,
        joined_at: membership.joined_at,
        is_active: membership.is_active
      },
      memberships: membership.groups?.group_memberships || []
    })).filter(Boolean) || [];
  },

  // Tüm public grupları getir
  async getPublicGroups(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Grup detaylarını getir
  async getGroupDetails(groupId: string): Promise<any> {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        creator:creator_id(
          id,
          user_profiles(username, display_name, avatar_url)
        ),
        members:group_memberships(
          *,
          user:user_id(
            id,
            user_profiles(username, display_name, avatar_url)
          )
        )
      `)
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni grup oluştur
  async createGroup(groupData: GroupInsert, userId: string): Promise<Group> {
    // Önce grubu oluştur
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{
        ...groupData,
        creator_id: userId,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (groupError) throw groupError;
    
    // Oluşturan kişiyi grup üyesi olarak ekle
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert([{
        group_id: group.id,
        user_id: userId,
        role: 'admin',
        joined_at: new Date().toISOString(),
      }]);
    
    if (membershipError) throw membershipError;
    
    return group;
  },

  // Gruba katıl
  async joinGroup(groupId: string, userId: string): Promise<any> {
    // Önce grup bilgilerini kontrol et
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;

    // Zaten üye mi kontrol et
    const { data: existingMembership } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (existingMembership) {
      throw new Error('Zaten bu grubun üyesisiniz');
    }

    // Grup dolmuş mu kontrol et
    if (group.current_members >= group.max_members) {
      throw new Error('Grup dolu');
    }

    // Üyelik ekle
    const { data: membership, error: membershipError } = await supabase
      .from('group_memberships')
      .insert([{
        group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (membershipError) throw membershipError;

    // Grup üye sayısını güncelle
    const { error: updateError } = await supabase
      .from('groups')
      .update({
        current_members: group.current_members + 1
      })
      .eq('id', groupId);
    
    if (updateError) throw updateError;
    
    return membership;
  },

  // Gruptan çık
  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    // Üyeliği pasif yap
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (membershipError) throw membershipError;

    // Grup üye sayısını güncelle
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('current_members')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from('groups')
      .update({
        current_members: Math.max(0, group.current_members - 1)
      })
      .eq('id', groupId);
    
    if (updateError) throw updateError;
    
    return true;
  },

  // Grup güncelle (sadece admin)
  async updateGroup(groupId: string, updates: GroupUpdate, userId: string): Promise<Group> {
    // Admin kontrolü
    const { data: membership, error: membershipError } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (membershipError) throw membershipError;
    
    if (membership.role !== 'admin') {
      throw new Error('Bu işlem için admin yetkisi gerekli');
    }

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Grup sil (sadece creator)
  async deleteGroup(groupId: string, userId: string): Promise<boolean> {
    // Creator kontrolü
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('creator_id')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    if (group.creator_id !== userId) {
      throw new Error('Sadece grup oluşturan kişi grubu silebilir');
    }

    const { error } = await supabase
      .from('groups')
      .update({ is_active: false })
      .eq('id', groupId);
    
    if (error) throw error;
    return true;
  },

  // Grup üyelerini getir
  async getGroupMembers(groupId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        user:user_id(
          id,
          user_profiles(username, display_name, avatar_url)
        )
      `)
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};
