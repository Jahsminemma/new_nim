import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  useGetAllUsersQuery,
  useGetFollowingsQuery,
  useFollowUserMutation,
  useUnFollowUserMutation,
} from '../../redux/slice/userApiSlice';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Search } from 'lucide-react-native';
import ScreenHeaderLayout from '@/components/layout/ScreenHeaderLayout';

const UsersScreen = () => {
  const { colors, isDark } = useTheme();
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Fetch followings
  const {
    data: followingsData,
    refetch: refetchFollowings,
  } = useGetFollowingsQuery({});
  const followings = followingsData?.data || [];

  // Mutations
  const [followUser] = useFollowUserMutation();
  const [unFollowUser] = useUnFollowUserMutation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(0);
      setDebouncedSearchQuery(searchQuery.toLocaleLowerCase());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page,
    size: 10,
    search: debouncedSearchQuery,
  }, {refetchOnMountOrArgChange: true});  
  

  useEffect(() => {
    if (data?.data?.data) {
      if (page === 0) {
        setUsers(data.data.data);
      } else {
        const newUsers = data.data.data.filter(
          (newUser: any) =>
            !users.some((user) => user.userId === newUser.userId)
        );
        setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      }
    }
  }, [data]);

  const handleLoadMore = () => {
    if (!isFetching && data?.data?.page < data?.data?.total - 1) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const navigateToProfile = (userId: string) => {
    router.push({
      pathname: '/(screens)/userProfile',
      params: { userId },
    });
  };

  const isFollowing = (userId: string) => {
    return followings.some((u: any) => u.userId === userId);
  };

  const handleFollow = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await followUser(userId).unwrap();
      refetchFollowings();
    } catch (e) {}
    setLoadingUserId(null);
  };

  const handleUnfollow = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await unFollowUser(userId).unwrap();
      refetchFollowings();
    } catch (e) {}
    setLoadingUserId(null);
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Loading more users...
        </Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const following = isFollowing(item.userId);
    const isLoadingBtn = loadingUserId === item.userId;
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity
          onPress={() => navigateToProfile(item.userId)}
          style={[
            styles.userCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Image
            source={{
              uri:
                item.photo_url ||
                `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}`,
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {`${item.firstName} ${item.lastName}`}
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>
              @{item.userName}
            </Text>
          </View>
          {item.isCurrentUser ? null : (
            <TouchableOpacity
              style={[
                styles.followButton,
                { backgroundColor: following ? colors.border : colors.primary },
              ]}
              onPress={() =>
                following
                  ? handleUnfollow(item.userId)
                  : handleFollow(item.userId)
              }
              disabled={isLoadingBtn}
            >
              {isLoadingBtn ? (
                <ActivityIndicator
                  color={following ? colors.primary : '#fff'}
                  size={18}
                />
              ) : (
                <Text
                  style={[
                    styles.followButtonText,
                    { color: following ? colors.primary : '#fff' },
                  ]}
                >
                  {following ? 'Unfollow' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenHeaderLayout headerTitle={'Users'}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() =>
            !isFetching ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 50,
                }}
              >
                <Text style={{ color: colors.text }}>No users found.</Text>
              </View>
            ) : null
          }
        />
]    </ScreenHeaderLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  list: {
    paddingHorizontal: 16,
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

export default UsersScreen;
