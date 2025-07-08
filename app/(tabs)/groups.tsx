import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Plus, Flame, CircleCheck as CheckCircle, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '@/store/store';
import { fetchGroups, completeGroupHabit } from '@/store/slices/groupsSlice';
import { Group } from '@/store/slices/groupsSlice';

export default function GroupsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, isLoading } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      await dispatch(fetchGroups());
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleCompleteGroupHabit = async (groupId: string) => {
    try {
      const result = await dispatch(completeGroupHabit(groupId)).unwrap();
      
      if (result.allCompleted) {
        Alert.alert(
          '🎉 Group Streak Extended!',
          `Your group maintained its ${result.newStreak}-day streak!`,
          [{ text: 'Awesome!' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete habit');
    }
  };

  const renderGroupCard = (group: Group) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMember = group.members.find(m => m.userId === user?.id);
    const isCompletedToday = currentMember?.lastCompleted === today;
    const completedCount = group.members.filter(m => m.lastCompleted === today).length;
    const completionPercentage = (completedCount / group.members.length) * 100;

    return (
      <TouchableOpacity
        key={group.id}
        style={styles.groupCard}
        onPress={() => router.push(`/group/${group.id}`)}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.groupHeader}
        >
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.habitName}>{group.habitName}</Text>
          </View>
          <View style={styles.streakContainer}>
            <Flame size={32} color="#FFFFFF" />
            <Text style={styles.streakNumber}>{group.currentStreak}</Text>
          </View>
        </LinearGradient>

        <View style={styles.groupContent}>
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>

          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              Today's Progress: {completedCount}/{group.members.length} members
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.membersSection}>
            <Text style={styles.membersTitle}>Members</Text>
            <View style={styles.membersList}>
              {group.members.slice(0, 5).map((member, index) => (
                <View key={member.userId} style={styles.memberAvatar}>
                  <Image
                    source={{ 
                      uri: member.userAvatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2' 
                    }}
                    style={styles.avatarImage}
                  />
                  {member.lastCompleted === today && (
                    <View style={styles.completedIndicator}>
                      <CheckCircle size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              ))}
              {group.members.length > 5 && (
                <View style={styles.moreMembersIndicator}>
                  <Text style={styles.moreMembersText}>
                    +{group.members.length - 5}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {!isCompletedToday && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteGroupHabit(group.id)}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}

          {isCompletedToday && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Completed Today</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Groups</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-group')}
        >
          <Plus size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groups.map(renderGroupCard)}

        {groups.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={80} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyText}>
              Create or join a group to build habits together!
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateButton}
              onPress={() => router.push('/create-group')}
            >
              <Text style={styles.emptyCreateButtonText}>Create Your First Group</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inviteSection}>
          <LinearGradient
            colors={['#F093FB', '#F5576C']}
            style={styles.inviteCard}
          >
            <Gift size={48} color="#FFFFFF" />
            <Text style={styles.inviteTitle}>Invite Friends</Text>
            <Text style={styles.inviteText}>
              Share your referral code and earn streak protections!
            </Text>
            <View style={styles.referralCode}>
              <Text style={styles.referralCodeText}>{user?.referralCode}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  habitName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  groupContent: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  membersSection: {
    marginBottom: 15,
  },
  membersTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 10,
  },
  membersList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    marginRight: 8,
    position: 'relative',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  completedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
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
    marginBottom: 30,
  },
  emptyCreateButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inviteSection: {
    padding: 20,
  },
  inviteCard: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  inviteText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  referralCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 10,
  },
  referralCodeText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  copyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});