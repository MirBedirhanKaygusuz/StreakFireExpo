import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { groupsService, Group } from '@/services/groups';

interface GroupsState {
  groups: Group[];
  publicGroups: Group[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  publicGroups: [],
  isLoading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await groupsService.getUserGroups(userId);
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: { name: string; description: string; habitName: string; isPublic: boolean; maxMembers?: number }, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await groupsService.createGroup(userId, groupData);
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    await groupsService.joinGroup(userId, groupId);
    return groupId;
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    await groupsService.leaveGroup(userId, groupId);
    return groupId;
  }
);

export const fetchPublicGroups = createAsyncThunk(
  'groups/fetchPublicGroups',
  async (limit: number = 20) => {
    return await groupsService.getPublicGroups(limit);
  }
);

export const completeGroupHabit = createAsyncThunk(
  'groups/completeGroupHabit',
  async (groupId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // This is a simplified implementation
    // In a real app, you'd have group-specific habit completions
    return {
      groupId,
      userId,
      allCompleted: true,
      newStreak: 1,
    };
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
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
      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        // Refresh groups after joining
      })
      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g.id !== action.payload);
      })
      // Fetch Public Groups
      .addCase(fetchPublicGroups.fulfilled, (state, action) => {
        state.publicGroups = action.payload;
      })
      // Complete Group Habit
      .addCase(completeGroupHabit.fulfilled, (state, action) => {
        const group = state.groups.find(g => g.id === action.payload.groupId);
        if (group && action.payload.allCompleted) {
          group.currentStreak = action.payload.newStreak;
        }
      });
  },
});

export default groupsSlice.reducer;