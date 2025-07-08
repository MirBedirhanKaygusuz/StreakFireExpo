import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle, Share, Edit3, Send } from 'lucide-react-native';
import { RootState, AppDispatch } from '@/store/store';
import { fetchPosts, likePost, addComment, createPost } from '@/store/slices/socialSlice';
import { Post } from '@/store/slices/socialSlice';

export default function SocialScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, isLoading, hasMore } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadPosts(true);
  }, []);

  const loadPosts = async (refresh = false) => {
    try {
      await dispatch(fetchPosts({ refresh }));
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadPosts(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await dispatch(likePost(postId));
    } catch (error) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      await dispatch(addComment({ postId, content: commentText }));
      setCommentText('');
      setCommentingOn(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await dispatch(createPost({
        content: newPostContent,
        type: 'custom',
        userId: user!.id,
        userName: user!.displayName,
        userAvatar: user?.photoURL,
      }));
      setNewPostContent('');
      setShowCreatePost(false);
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = item.likes.includes(user?.id || '');
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{ 
              uri: item.userAvatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' 
            }}
            style={styles.avatar}
          />
          <View style={styles.postHeaderText}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.type === 'streak_milestone' && item.streakCount && (
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneEmoji}>🔥</Text>
            <Text style={styles.milestoneText}>
              {item.streakCount} Day Streak!
            </Text>
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikePost(item.id)}
          >
            <Heart 
              size={20} 
              color={isLiked ? '#FF6B6B' : '#666'} 
              fill={isLiked ? '#FF6B6B' : 'none'}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setCommentingOn(item.id)}
          >
            <MessageCircle size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {item.comments.length > 0 && (
          <View style={styles.commentsSection}>
            {item.comments.slice(0, 2).map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            ))}
            {item.comments.length > 2 && (
              <Text style={styles.viewMoreComments}>
                View all {item.comments.length} comments
              </Text>
            )}
          </View>
        )}

        {commentingOn === item.id && (
          <View style={styles.commentInput}>
            <TextInput
              style={styles.commentTextInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={() => handleAddComment(item.id)}
              disabled={!commentText.trim()}
            >
              <Send
                size={20}
                color={commentText.trim() ? '#FF6B6B' : '#BDBDBD'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Edit3 size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your journey!
            </Text>
          </View>
        }
      />

      {showCreatePost && (
        <View style={styles.createPostModal}>
          <View style={styles.createPostHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.createPostTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              <Text
                style={[
                  styles.postButton,
                  !newPostContent.trim() && styles.postButtonDisabled,
                ]}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.createPostInput}
            placeholder="Share your progress..."
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            autoFocus
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  createPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  milestoneEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  milestoneText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  likedText: {
    color: '#FF6B6B',
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  comment: {
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  viewMoreComments: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    marginTop: 5,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  createPostModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  createPostTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  postButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
  postButtonDisabled: {
    color: '#BDBDBD',
  },
  createPostInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 100,
  },
});