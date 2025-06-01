import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Gift, Bell, Megaphone, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Notification {
  id: string;
  type: 'event' | 'giveaway' | 'promo';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Event Reminder',
    message: 'Tech Summit 2024 starts in 2 hours. Don\'t forget to check in!',
    time: '2h ago',
    read: false,
  },
  {
    id: '2',
    type: 'giveaway',
    title: 'Congratulations!',
    message: 'You\'ve won the Gaming Setup Giveaway! Click to claim your prize.',
    time: '5h ago',
    read: false,
  },
  {
    id: '3',
    type: 'promo',
    title: 'Limited Time Offer',
    message: 'Flash Sale: Get 40% off on all FashionCo items for the next 24 hours!',
    time: '1d ago',
    read: true,
  },
  {
    id: '4',
    type: 'event',
    title: 'New Event Added',
    message: 'Music Festival 2024 has been added to your interested events.',
    time: '2d ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsList, setNotificationsList] = useState(notifications);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const markAsRead = (id: string) => {
    setNotificationsList(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar size={24} color={colors.primary} />;
      case 'giveaway':
        return <Gift size={24} color={colors.primary} />;
      case 'promo':
        return <Megaphone size={24} color={colors.primary} />;
      default:
        return <Bell size={24} color={colors.primary} />;
    }
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: colors.card },
          !item.read && { borderLeftColor: colors.primary, borderLeftWidth: 4 }
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text 
            style={[styles.notificationMessage, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {item.time}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={() => setNotificationsList(prev => prev.map(n => ({ ...n, read: true })))}
        >
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notificationsList}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
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
  headerTitle: {
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
  },
  notificationTitle: {
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
});