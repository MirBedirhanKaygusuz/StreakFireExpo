import { supabase } from './supabase';
import { Post, Comment } from '../store/slices/socialSlice';

export interface CreatePostRequest {
  content: string;
  type: 'streak_milestone' | 'habit_completed' | 'group_achievement' | 'custom';
  habitId?: string;
  habitName?: string;
  streakCount?: number;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

export const socialService = {
  async fetchPosts(): Promise<Post[]> {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id(id, full_name, avatar_url),
          habits:habit_id(id, name),
          post_likes(user_id),
          post_comments(
            *,
            users:user_id(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return posts?.map(post => ({
        id: post.id,
        userId: post.user_id,
        userName: post.users?.full_name || 'Anonymous',
        userAvatar: post.users?.avatar_url,
        content: post.content,
        type: post.type,
        habitId: post.habit_id,
        habitName: post.habits?.name,
        streakCount: post.streak_count,
        likes: post.post_likes?.map((like: any) => like.user_id) || [],
        comments: post.post_comments?.map((comment: any) => ({
          id: comment.id,
          userId: comment.user_id,
          userName: comment.users?.full_name || 'Anonymous',
          userAvatar: comment.users?.avatar_url,
          content: comment.content,
          createdAt: comment.created_at,
        })) || [],
        createdAt: post.created_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async createPost(request: CreatePostRequest): Promise<Post> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: request.content,
          type: request.type,
          habit_id: request.habitId,
          streak_count: request.streakCount,
        })
        .select(`
          *,
          users:user_id(id, full_name, avatar_url),
          habits:habit_id(id, name)
        `)
        .single();

      if (error) throw error;

      return {
        id: post.id,
        userId: post.user_id,
        userName: post.users?.full_name || 'Anonymous',
        userAvatar: post.users?.avatar_url,
        content: post.content,
        type: post.type,
        habitId: post.habit_id,
        habitName: post.habits?.name,
        streakCount: post.streak_count,
        likes: [],
        comments: [],
        createdAt: post.created_at,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async likePost(postId: string): Promise<{ postId: string; userId: string; liked: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        return { postId, userId: user.id, liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        return { postId, userId: user.id, liked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  async addComment(request: CreateCommentRequest): Promise<Comment & { postId: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: comment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: request.postId,
          user_id: user.id,
          content: request.content,
        })
        .select(`
          *,
          users:user_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return {
        id: comment.id,
        userId: comment.user_id,
        userName: comment.users?.full_name || 'Anonymous',
        userAvatar: comment.users?.avatar_url,
        content: comment.content,
        createdAt: comment.created_at,
        postId: request.postId,
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
};
