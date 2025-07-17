import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { groupService } from '../../services/groupService';
import { RootState } from '../store';
import { GroupMembership } from '../../types/additional.types';

export interface Group {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  challenge_type: string;
  max_members: number;
  current_members: number;
  start_date: string;
  end_date?: string;
  entry_fee: number;
  reward_pool: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  // İlişkisel veriler - veritabanından join ile gelecek
  memberships?: GroupMembership[];
  userMembership?: GroupMembership; // Kullanıcının bu gruptaki üyelik durumu
}

// GroupMember interface'i artık additional.types.ts'te tanımlı
// Eski interface'i kaldırıyoruz

interface GroupsState {
  groups: Group[];
  publicGroups: Group[];
  userMemberships: GroupMembership[]; // Kullanıcının tüm grup üyelikleri
  invites: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  publicGroups: [],
  userMemberships: [],
  invites: [],
  isLoading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await groupService.getUserGroups(userId);
  }
);

export const fetchPublicGroups = createAsyncThunk(
  'groups/fetchPublicGroups',
  async () => {
    return await groupService.getPublicGroups();
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: any, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    return await groupService.createGroup(groupData, user.id);
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    await groupService.joinGroup(groupId, user.id);
    return groupId;
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    await groupService.leaveGroup(groupId, user.id);
    return { groupId, userId: user.id };
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearInvites: (state) => {
      state.invites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      })
      // Fetch Public Groups
      .addCase(fetchPublicGroups.fulfilled, (state, action) => {
        state.publicGroups = action.payload;
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create group';
      })
      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        // Group listesini yenile
      })
      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        // Grup listesinden kaldır çünkü artık aktif üye değil
        state.groups = state.groups.filter(g => g.id !== action.payload.groupId);
        // Üyelik listesini güncelle
        state.userMemberships = state.userMemberships.filter(m => 
          !(m.group_id === action.payload.groupId && m.user_id === action.payload.userId)
        );
      });
  },
});

export const { clearInvites } = groupsSlice.actions;
export default groupsSlice.reducer;
