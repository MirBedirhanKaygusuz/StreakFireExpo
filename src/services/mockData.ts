// Mock implementations for all slice async thunks
// This file contains simplified mock implementations to fix bundling issues

import { Post, Comment } from '../store/slices/socialSlice';
import { Group, GroupMember, GroupInvite } from '../store/slices/groupsSlice';

// In-memory storage for mock data
let mockPosts: Post[] = [
  {
    id: '1',
    userId: 'mock-user-id',
    userName: 'Mock User',
    userAvatar: 'https://via.placeholder.com/40',
    content: 'Just completed my morning workout! 💪',
    type: 'habit_completed',
    habitName: 'Morning Exercise',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'mock-user-2',
    userName: 'Jane Doe',
    userAvatar: 'https://via.placeholder.com/40',
    content: '10 days streak achieved! 🔥',
    type: 'streak_milestone',
    streakCount: 10,
    likes: ['mock-user-id'],
    comments: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  }
];

let mockGroups: Group[] = [
  {
    id: '1',
    name: 'Fitness Enthusiasts',
    description: 'A group for people who love staying fit',
    creatorId: 'mock-user-id',
    habitId: 'habit-1',
    habitName: 'Daily Exercise',
    members: [
      {
        userId: 'mock-user-id',
        userName: 'Mock User',
        userAvatar: 'https://via.placeholder.com/40',
        joinedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completionRate: 90,
        isAdmin: true,
      }
    ],
    currentStreak: 5,
    longestStreak: 15,
    lastCompletedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
    isActive: true,
    streakProtectionsUsed: 1,
  }
];

let mockInvites: GroupInvite[] = [];

// Social mock functions
export const mockFetchPosts = async (params: { limit?: number; refresh?: boolean }) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    posts: mockPosts.slice(0, params.limit || 20),
    lastVisible: null,
    hasMore: false,
    refresh: params.refresh || false,
  };
};

export const mockCreatePost = async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
  const newPost: Post = {
    id: Date.now().toString(),
    ...postData,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  
  mockPosts.unshift(newPost);
  return newPost;
};

export const mockLikePost = async (postId: string, userId: string) => {
  const post = mockPosts.find(p => p.id === postId);
  if (!post) throw new Error('Post not found');
  
  const isLiked = post.likes.includes(userId);
  
  if (isLiked) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
  }
  
  return { postId, userId, isLiked: !isLiked };
};

export const mockAddComment = async (postId: string, content: string, user: any) => {
  const comment: Comment = {
    id: Date.now().toString(),
    userId: user.id,
    userName: user.displayName,
    userAvatar: user.photoURL,
    content,
    createdAt: new Date().toISOString(),
  };
  
  const post = mockPosts.find(p => p.id === postId);
  if (post) {
    post.comments.push(comment);
  }
  
  return { postId, comment };
};

// Groups mock functions
export const mockFetchGroups = async (userId: string) => {
  // Filter groups where user is a member
  return mockGroups.filter(group => 
    group.members.some(member => member.userId === userId)
  );
};

export const mockCreateGroup = async (groupData: any, user: any) => {
  const creator: GroupMember = {
    userId: user.id,
    userName: user.displayName,
    userAvatar: user.photoURL,
    joinedAt: new Date().toISOString(),
    completionRate: 0,
    isAdmin: true,
  };

  const newGroup: Group = {
    id: Date.now().toString(),
    ...groupData,
    creatorId: user.id,
    members: [creator],
    currentStreak: 0,
    longestStreak: 0,
    createdAt: new Date().toISOString(),
    isActive: true,
    streakProtectionsUsed: 0,
  };
  
  mockGroups.push(newGroup);
  return newGroup;
};

export const mockInviteToGroup = async (groupId: string, invitedUserId: string, user: any) => {
  const group = mockGroups.find(g => g.id === groupId);
  if (!group) throw new Error('Group not found');

  const invite: GroupInvite = {
    id: Date.now().toString(),
    groupId,
    groupName: group.name,
    inviterId: user.id,
    inviterName: user.displayName,
    invitedUserId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  mockInvites.push(invite);
  return invite;
};

export const mockRespondToInvite = async (inviteId: string, accept: boolean, user: any) => {
  const invite = mockInvites.find(i => i.id === inviteId);
  if (!invite) throw new Error('Invite not found');
  
  invite.status = accept ? 'accepted' : 'declined';
  
  if (accept) {
    const group = mockGroups.find(g => g.id === invite.groupId);
    if (group) {
      const newMember: GroupMember = {
        userId: user.id,
        userName: user.displayName,
        userAvatar: user.photoURL,
        joinedAt: new Date().toISOString(),
        completionRate: 0,
        isAdmin: false,
      };
      
      group.members.push(newMember);
    }
  }
  
  return { inviteId, accepted: accept };
};

export const mockCompleteGroupHabit = async (groupId: string, userId: string) => {
  const group = mockGroups.find(g => g.id === groupId);
  if (!group) throw new Error('Group not found');
  
  const member = group.members.find(m => m.userId === userId);
  if (!member) throw new Error('Not a member of this group');
  
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already completed today
  if (member.lastCompleted === today) {
    throw new Error('Already completed today');
  }
  
  // Update member's completion
  member.lastCompleted = today;
  
  // Check if all members completed today
  const allCompleted = group.members.every(m => m.lastCompleted === today);
  
  let newStreak = group.currentStreak;
  
  if (allCompleted) {
    // Simulate streak calculation
    const lastCompleted = group.lastCompletedDate;
    if (lastCompleted) {
      const lastDate = new Date(lastCompleted);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = group.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    group.currentStreak = newStreak;
    group.longestStreak = Math.max(newStreak, group.longestStreak);
    group.lastCompletedDate = today;
  }
  
  return {
    groupId,
    userId,
    allCompleted,
    newStreak: allCompleted ? newStreak : group.currentStreak,
  };
};
