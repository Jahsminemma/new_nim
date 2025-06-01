import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { Settings, Calendar, Gift, Users } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { mockFeaturedEvents, mockGiveaways } from '@/data/mockData';
import EventCard from '@/components/events/EventCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

const tabs = [
  { id: 'events', label: 'My Events', icon: Calendar },
  { id: 'giveaways', label: 'My Giveaways', icon: Gift },
  { id: 'following', label: 'Following', icon: Users },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const renderTabBar = () => (
    <View style={[styles.tabBar, { borderColor: colors.border }]}>
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <TabIcon 
              size={18} 
              color={isActive ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: isActive ? colors.primary : colors.textSecondary }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <FlatList
            data={mockFeaturedEvents.slice(0, 3)}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(100 * index).springify()}
                style={{ marginBottom: 16 }}
              >
                <EventCard event={item} />
              </Animated.View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  You haven't created any events yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create Event</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'giveaways':
        return (
          <FlatList
            data={mockGiveaways.slice(0, 2)}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(100 * index).springify()}
                style={styles.giveawayItem}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.giveawayImage} />
                <View style={styles.giveawayContent}>
                  <Text style={[styles.giveawayTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.giveawayMeta, { color: colors.textSecondary }]}>
                    {item.participants} participants
                  </Text>
                  <View style={[styles.giveawayStatus, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.giveawayStatusText, { color: colors.primary }]}>
                      Active
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  You haven't created any giveaways yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create Giveaway</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'following':
        return (
          <FlatList
            data={Array(5).fill(0).map((_, i) => ({
              id: i,
              name: `User ${i + 1}`,
              username: `user${i + 1}`,
              avatar: `https://i.pravatar.cc/150?img=${i + 1}`
            }))}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(100 * index).springify()}
                style={[styles.userItem, { borderBottomColor: colors.border }]}
              >
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
                    @{item.username}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.followButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.followButtonText}>Following</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  You are not following anyone yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.createButtonText}>Explore Users</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(screens)/settings')}
        >
          <Settings size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/300' }}
              style={styles.avatar}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name || 'Jane Doe'}
            </Text>
            <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
              @{user?.username || 'janedoe'}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Events</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>8</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Giveaways</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>153</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.editProfileButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {renderTabBar()}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  contentList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'SF-Pro-Text-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  giveawayItem: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  giveawayImage: {
    width: 100,
    height: 100,
  },
  giveawayContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  giveawayTitle: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  giveawayMeta: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 8,
  },
  giveawayStatus: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  giveawayStatusText: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  userUsername: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
});