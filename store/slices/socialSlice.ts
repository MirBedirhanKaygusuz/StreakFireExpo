import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'custom' | 'streak_milestone' | 'achievement';
  habitId?: string;
  habitName?: string;
  streakCount?: number;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface SocialState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: SocialState = {
  posts: [],
  isLoading: false,
  error: null,
  hasMore: true,
};

export const fetchPosts = createAsyncThunk(
  'social/fetchPosts',
  async ({ refresh = false }: { refresh?: boolean } = {}) => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPosts: Post[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        userAvatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        content: 'Just completed my 30-day meditation streak! 🧘‍♂️',
        type: 'streak_milestone',
        habitId: 'habit1',
        habitName: 'Daily Meditation',
        streakCount: 30,
        likes: ['user2', 'user3'],
        comments: [
          {
            id: 'comment1',
            userId: 'user2',
            userName: 'Jane Smith',
            content: 'Amazing! Keep it up! 👏',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          }
        ],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        content: 'Starting my fitness journey today! Who wants to join me? 💪',
        type: 'custom',
        likes: ['user1'],
        comments: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      }
    ];
    
    return mockPosts;
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    
    return newPost;
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId: string, { getState }) => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const state = getState() as any;
    const userId = state.auth.user?.id || 'current-user';
    
    return { postId, userId };
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ postId, content }: { postId: string; content: string }, { getState }) => {
    // Mock implementation - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const state = getState() as any;
    const user = state.auth.user;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user?.id || 'current-user',
      userName: user?.displayName || 'Current User',
      content,
      createdAt: new Date().toISOString(),
    };
    
    return { postId, comment: newComment };
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
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
          const userIndex = post.likes.indexOf(action.payload.userId);
          if (userIndex === -1) {
            post.likes.push(action.payload.userId);
          } else {
            post.likes.splice(userIndex, 1);
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

export default socialSlice.reducer;