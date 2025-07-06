import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { 
  mockFetchPosts, 
  mockCreatePost, 
  mockLikePost, 
  mockAddComment 
} from '../../services/mockData';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'streak_milestone' | 'habit_completed' | 'group_achievement' | 'custom';
  habitId?: string;
  habitName?: string;
  streakCount?: number;
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface SocialState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  lastVisible: any;
}

const initialState: SocialState = {
  posts: [],
  isLoading: false,
  error: null,
  hasMore: true,
  lastVisible: null,
};

export const fetchPosts = createAsyncThunk(
  'social/fetchPosts',
  async ({ limit = 20, refresh = false }: { limit?: number; refresh?: boolean }) => {
    return await mockFetchPosts({ limit, refresh });
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    const postWithUser = {
      ...postData,
      userId: user.id,
      userName: user.displayName,
      userAvatar: user.photoURL,
    };
    
    return await mockCreatePost(postWithUser);
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    return await mockLikePost(postId, userId);
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ postId, content }: { postId: string; content: string }, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    
    if (!user) throw new Error('User not authenticated');
    
    return await mockAddComment(postId, content, user);
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.lastVisible = null;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.refresh) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          if (action.payload.isLiked) {
            post.likes.push(action.payload.userId);
          } else {
            post.likes = post.likes.filter(id => id !== action.payload.userId);
          }
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
      });
  },
});

export const { clearPosts } = socialSlice.actions;
export default socialSlice.reducer;
