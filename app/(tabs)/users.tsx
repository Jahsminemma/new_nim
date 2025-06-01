import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import SafeLayoutWrapper from '@/components/layout/SafeLayoutWrapper';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  following: number;
}

export default function UsersScreen() {
  const { colors, isDark } = useTheme();
  const [users, setUsers] = useState<User[]>(generateMockUsers(20));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  function generateMockUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      followers: Math.floor(Math.random() * 1000),
      following: Math.floor(Math.random() * 500)
    }));
  }

  const loadMoreUsers = async () => {
    if (loading) return;
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUsers = generateMockUsers(10);
    setUsers(prev => [...prev, ...newUsers]);
    setPage(prev => prev + 1);
    setLoading(false);
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.userInfo}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.username, { color: colors.textSecondary }]}>@{item.username}</Text>
        
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{item.followers}</Text> followers
          </Text>
          <Text style={[styles.statDivider, { color: colors.textSecondary }]}> • </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{item.following}</Text> following
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.followButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Loading more users...
        </Text>
      </View>
    );
  };

  return (
    <SafeLayoutWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Users</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  list: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
  },
  statDivider: {
    marginHorizontal: 4,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});