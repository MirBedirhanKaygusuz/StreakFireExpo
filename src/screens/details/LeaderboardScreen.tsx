import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../../store/store';

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  totalStreak: number;
  habitsCount: number;
  rank: number;
}

const LeaderboardScreen: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://via.placeholder.com/50',
      totalStreak: 156,
      habitsCount: 5,
      rank: 1,
    },
    {
      id: '2',
      userId: '2',
      userName: 'Mike Chen',
      userAvatar: 'https://via.placeholder.com/50',
      totalStreak: 142,
      habitsCount: 4,
      rank: 2,
    },
    {
      id: '3',
      userId: '3',
      userName: 'Emma Wilson',
      userAvatar: 'https://via.placeholder.com/50',
      totalStreak: 128,
      habitsCount: 6,
      rank: 3,
    },
    {
      id: '4',
      userId: user?.id || '4',
      userName: user?.displayName || 'You',
      userAvatar: user?.photoURL || 'https://via.placeholder.com/50',
      totalStreak: 45,
      habitsCount: 3,
      rank: 15,
    },
  ];

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === user?.id;
    const isTopThree = index < 3;

    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem,
        isTopThree && styles.topThreeItem,
      ]}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <MaterialCommunityIcons
              name={index === 0 ? 'trophy' : 'medal' as any}
              size={24}
              color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
            />
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {item.userName}
          </Text>
          <Text style={styles.habitsCount}>{item.habitsCount} habits</Text>
        </View>
        
        <View style={styles.streakInfo}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
          <Text style={styles.streakText}>{item.totalStreak}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'week' && styles.activeFilter]}
          onPress={() => setTimeFilter('week')}
        >
          <Text style={[styles.filterText, timeFilter === 'week' && styles.activeFilterText]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'month' && styles.activeFilter]}
          onPress={() => setTimeFilter('month')}
        >
          <Text style={[styles.filterText, timeFilter === 'month' && styles.activeFilterText]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'all' && styles.activeFilter]}
          onPress={() => setTimeFilter('all')}
        >
          <Text style={[styles.filterText, timeFilter === 'all' && styles.activeFilterText]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeFilter: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  topThreeItem: {
    backgroundColor: '#FFFAF0',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentUserName: {
    color: '#FF6B6B',
  },
  habitsCount: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
});

export default LeaderboardScreen;
