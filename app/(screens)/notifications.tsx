import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Gift, Bell, Megaphone, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useInAppNotificationMutation, useUpdateReadNotificationsMutation, useGetProfileByIdQuery, useFollowUserMutation, useGetFollowingsQuery, useGetParticipatedGiveawaysQuery } from '../../redux/slice/userApiSlice';
import { useGetGiveawayByIdQuery, useJoinGiveawayMutation } from '../../redux/slice/giveawayApiSlice';
import useQuery from '../../hooks/useQuery';

interface Notification {
  notificationId: string;
  type: 'event' | 'giveaway' | 'promo' | 'follow' | 'new_giveaway' | 'giveaway_winner' | 'gift';
  subject: string;
  content: string;
  timestamp: string;
  typeId: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [fetchNotifications, { data, isLoading, isError }] = useInAppNotificationMutation();
  const [markAsRead] = useUpdateReadNotificationsMutation();
  const { isAFollower, isAParticipant } = useQuery();
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [joinGiveaway, { isLoading: isJoinLoading }] = useJoinGiveawayMutation();

  // Fetch notifications on mount and when page changes
  React.useEffect(() => {
    if (page > 0) setLoadingMore(true);
    fetchNotifications({ page, size: 10 }).then((res: any) => {
      if (res?.data?.data?.data) {
        setNotificationsList(prev => {
          // Deduplicate by notificationId
          const ids = new Set(prev.map(n => n.notificationId));
          const newItems = res.data.data.data.filter((n: Notification) => !ids.has(n.notificationId));
          return page === 0 ? newItems : [...prev, ...newItems];
        });
        setHasMore(res.data.data.data.length > 0);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    });
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setNotificationsList([]);
    fetchNotifications({ page: 0, size: 10 }).then((res: any) => {
      if (res?.data?.data?.data) {
        setNotificationsList(res.data.data.data);
        setHasMore(res.data.data.data.length > 0);
      } else {
        setNotificationsList([]);
        setHasMore(false);
      }
      setRefreshing(false);
    });
  };

  // Mark as read when notification becomes visible
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    viewableItems.forEach((viewable: any) => {
      const item = viewable.item;
      if (!item.read) {
        markAsRead(item.notificationId);
        setNotificationsList(prev => prev.map(n => n.notificationId === item.notificationId ? { ...n, read: true } : n));
      }
    });
  }).current;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar size={24} color={colors.primary} />;
      case 'giveaway':
      case 'new_giveaway':
      case 'giveaway_winner':
        return <Gift size={24} color={colors.primary} />;
      case 'promo':
        return <Megaphone size={24} color={colors.primary} />;
      case 'follow':
        return <Bell size={24} color={colors.primary} />;
      case 'gift':
        return <Gift size={24} color={colors.primary} />;
      default:
        return <Bell size={24} color={colors.primary} />;
    }
  };

  // Contextual action button for each notification type
  const renderActionButton = (item: Notification) => {
    if (item.type === 'follow' && item.typeId) {
      if (!isAFollower(item.typeId)) {
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => followUser(item.typeId)}
            disabled={isFollowLoading}
          >
            <Text style={styles.actionButtonText}>Add</Text>
          </TouchableOpacity>
        );
      }
    }
    if ((item.type === 'new_giveaway' || item.type === 'giveaway_winner') && item.typeId) {
      if (!isAParticipant(item.typeId)) {
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => joinGiveaway(item.typeId)}
            disabled={isJoinLoading}
          >
            <Text style={styles.actionButtonText}>Join</Text>
          </TouchableOpacity>
        );
      }
    }
    return null;
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: colors.card },
          !item.read && { borderLeftColor: colors.primary, borderLeftWidth: 4, opacity: 1 },
          item.read && { opacity: 0.6 }
        ]}
        onPress={() => {
          // Navigate based on type
          if (item.type === 'follow' && item.typeId) {
            router.push({ pathname: '/(screens)/userProfile', params: { userId: item.typeId } });
          } else if ((item.type === 'new_giveaway' || item.type === 'giveaway_winner') && item.typeId) {
            router.push({ pathname: '/giveaway/[id]', params: { id: item.typeId } });
          }
        }}
      >
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationsubject, { color: colors.text }]}> {item.subject} </Text>
          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}> {item.content} </Text>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}> {new Date(item.timestamp).toLocaleString()} </Text>
        </View>
        {renderActionButton(item)}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headersubject, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={() => setNotificationsList(prev => prev.map(n => ({ ...n, read: true })))}
        >
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      {isLoading && page === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Loading notifications...</Text>
      ) : notificationsList.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notificationsList}
          renderItem={renderNotification}
          keyExtractor={item => item.notificationId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => {
            if (hasMore && !isLoading) setPage(p => p + 1);
          }}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headersubject: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationsubject: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#007bff', // fallback, will be overridden by colors.primary
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});