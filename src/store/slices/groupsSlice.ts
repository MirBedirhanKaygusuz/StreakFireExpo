import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { 
  mockFetchGroups, 
  mockCreateGroup, 
  mockInviteToGroup, 
  mockRespondToInvite, 
  mockCompleteGroupHabit 
} from '../../services/mockData';

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  habitId: string;
  habitName: string;
  members: GroupMember[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
  isActive: boolean;
  streakProtectionsUsed: number;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  completionRate: number;
  lastCompleted?: string;
  isAdmin: boolean;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  invitedUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface GroupsState {
  groups: Group[];
  invites: GroupInvite[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
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
    
    return await mockFetchGroups(userId);
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: { name: string; description: string; habitId: string; habitName: string }, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    return await mockCreateGroup(groupData, user);
  }
);

export const inviteToGroup = createAsyncThunk(
  'groups/inviteToGroup',
  async ({ groupId, invitedUserId }: { groupId: string; invitedUserId: string }, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    return await mockInviteToGroup(groupId, invitedUserId, user);
  }
);

export const respondToInvite = createAsyncThunk(
  'groups/respondToInvite',
  async ({ inviteId, accept }: { inviteId: string; accept: boolean }, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    return await mockRespondToInvite(inviteId, accept, user);
  }
);

export const completeGroupHabit = createAsyncThunk(
  'groups/completeGroupHabit',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await mockCompleteGroupHabit(groupId, userId);
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
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      })
      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      // Invite to Group
      .addCase(inviteToGroup.fulfilled, (state, action) => {
        state.invites.push(action.payload);
      })
      // Respond to Invite
      .addCase(respondToInvite.fulfilled, (state, action) => {
        state.invites = state.invites.filter(i => i.id !== action.payload.inviteId);
      })
      // Complete Group Habit
      .addCase(completeGroupHabit.fulfilled, (state, action) => {
        const group = state.groups.find(g => g.id === action.payload.groupId);
        if (group) {
          const member = group.members.find(m => m.userId === action.payload.userId);
          if (member) {
            member.lastCompleted = new Date().toISOString().split('T')[0];
          }
          if (action.payload.allCompleted) {
            group.currentStreak = action.payload.newStreak;
            group.lastCompletedDate = new Date().toISOString().split('T')[0];
          }
        }
      });
  },
});

export const { clearInvites } = groupsSlice.actions;
export default groupsSlice.reducer;
