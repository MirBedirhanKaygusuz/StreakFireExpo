import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { socialService, CreatePostRequest, CreateCommentRequest } from '../../services/socialService';

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
  async () => {
    return await socialService.fetchPosts();
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData: CreatePostRequest) => {
    return await socialService.createPost(postData);
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId: string) => {
    return await socialService.likePost(postId);
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ postId, content }: CreateCommentRequest) => {
    return await socialService.addComment({ postId, content });
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
        state.posts = action.payload;
        state.error = null;
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
          if (action.payload.liked) {
            if (!post.likes.includes(action.payload.userId)) {
              post.likes.push(action.payload.userId);
            }
          } else {
            post.likes = post.likes.filter(id => id !== action.payload.userId);
          }
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          const { postId, ...comment } = action.payload;
          post.comments.push(comment);
        }
      });
  },
});

export const { clearPosts } = socialSlice.actions;
export default socialSlice.reducer;
