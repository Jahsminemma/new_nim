import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from "expo-blur";
import { Share2, MessageCircle, ShieldAlert } from 'lucide-react-native';
import { useGetProfileByIdQuery, useGetProfileQuery, useGetFollowingsQuery, useFollowUserMutation, useUnFollowUserMutation } from "../../redux/slice/userApiSlice";
import * as Linking from 'expo-linking';
import ScreenHeaderLayout from "@/components/layout/ScreenHeaderLayout";
import { PageLoadingModal } from "@/components/ui/PageLoadingModal";

const { width } = Dimensions.get("window");

const TABS = ["Overview", "Giveaways"];

const UserProfileScreen = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data, isLoading, isError, error } = useGetProfileByIdQuery(userId);
  const { data: currentUserData } = useGetProfileQuery({});
  const { data: followingsData, refetch: refetchFollowings } = useGetFollowingsQuery({});
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unFollowUser, { isLoading: isUnfollowLoading }] = useUnFollowUserMutation();
  const [activeTab, setActiveTab] = useState("Overview");

  if (isLoading) {
    return <PageLoadingModal visible={isLoading} />;
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error fetching profile.</Text>
        {/* @ts-ignore */}
        <Text style={styles.errorText}>{error?.data?.message || "An unknown error occurred"}</Text>
      </View>
    );
  }

  const user = data?.data;
  if (!user) return null;

  // Placeholder badges
  const badges = user.badges || [
    { label: "Verified", color: colors.primary },
    { label: "Top Winner", color: colors.success || colors.primary },
  ];

  // Animated stats
  const statBg1 = isDark ? colors.card : colors.background;
  const statBg2 = isDark ? colors.background : colors.card;
  const statBg3 = isDark ? colors.border : colors.card;
  const stats = [
    { label: "Wins", value: user.giveawayWins, color: statBg1 },
    { label: "Followers", value: user.followers?.length || 0, color: statBg2 },
    { label: "Following", value: user.following?.length || 0, color: statBg3 },
  ];

  // Action buttons
  const actions = [
    { icon: <MessageCircle color={colors.primary} size={22} />, label: "Message", onPress: () => {} },
    { icon: <Share2 color={colors.primary} size={22} />, label: "Share", onPress: () => {} },
    { icon: <ShieldAlert color={colors.primary} size={22} />, label: "Report", onPress: () => {} },
  ];

  // Giveaways
  const hostedGiveaways = user.hostedGiveaways || [];

  const currentUserId = currentUserData?.data?.userId;
  const isOwnProfile = currentUserId === user.userId;
  const isFollowing = followingsData?.data?.some((u: any) => u.userId === user.userId);

  const handleFollow = async () => {
    try {
      await followUser(user.userId).unwrap();
      refetchFollowings();
    } catch {}
  };
  const handleUnfollow = async () => {
    try {
      await unFollowUser(user.userId).unwrap();
      refetchFollowings();
    } catch {}
  };

  return (
    <ScreenHeaderLayout headerTitle={"User Profile"}>
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Glass Card */}
        <View style={styles.profileCardShadow}>
          <BlurView intensity={60} tint={isDark ? "dark" : "light"} style={styles.profileCardBlur}>
            <Animated.View entering={FadeInDown.springify()} style={[styles.profileCard, { backgroundColor: colors.card + (isDark ? 'ee' : 'f5') }] }>
              {/* Animated Avatar Ring */}
              <View style={styles.avatarRingWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + '99', colors.primary + '33']}
                  style={styles.avatarRing}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={{
                      uri: user.photo_url || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`,
                    }}
                    style={styles.avatar}
                  />
                </LinearGradient>
              </View>
              <Text style={[styles.name, { color: colors.text }]}>{`${user.firstName} ${user.lastName}`}</Text>
              <Text style={[styles.username, { color: colors.textSecondary }]}>@{user.userName}</Text>
              {/* Follow/Unfollow Button */}
              {!isOwnProfile && (
                <TouchableOpacity
                  style={[styles.followBtn, { backgroundColor: isFollowing ? colors.card : colors.primary, borderColor: colors.primary, borderWidth: 1, marginVertical: 8, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 24 }]}
                  onPress={isFollowing ? handleUnfollow : handleFollow}
                  disabled={isFollowLoading || isUnfollowLoading}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: isFollowing ? colors.primary : colors.card, fontWeight: 'bold', fontSize: 16 }}>
                    {isFollowLoading || isUnfollowLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.country, { color: colors.primary }]}>{user.country}</Text>
              <Text style={[styles.status, { color: colors.textSecondary }]}>Status: {user.status}</Text>
              {/* Badges Row */}
              <View style={styles.badgesRow}>
                {badges.map((badge: { label: string; color: string }, idx: number) => (
                  <View key={idx} style={[styles.badge, { backgroundColor: badge.color + (isDark ? '33' : '22') }]}> 
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                ))}
              </View>
              {/* Social Buttons Row */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.socialRow} contentContainerStyle={{ paddingHorizontal: 0, justifyContent: 'center'}}>
                {/* Dummy socialData for preview */}
                {[
                  { platform: 'X', username: 'theuser', url: 'https://x.com/theuser' },
                  { platform: 'LinkedIn', username: 'theuser', url: 'https://linkedin.com/in/theuser' },
                  { platform: 'Instagram', username: 'theuser', url: 'https://instagram.com/theuser' },
                  { platform: 'Discord', username: 'theuser#1234', url: 'https://discord.com/users/theuser' },
                  { platform: 'Facebook', username: 'theuser', url: 'https://facebook.com/theuser' },
                ].map((social: { platform: string; username: string; url: string }, idx: number) => (
                  <TouchableOpacity
                    key={social.platform}
                    style={[styles.socialBtn, { backgroundColor: colors.primary + (isDark ? '33' : '22') }]}
                    onPress={() => Linking.openURL(social.url)}
                    activeOpacity={0.8}
                  >
                    {social.platform === 'X' && (
                      <Text style={[styles.socialIcon, { color: colors.primary }]}>𝕏</Text>
                    )}
                    {social.platform === 'LinkedIn' && (
                      <Text style={[styles.socialIcon, { color: colors.primary }]}>in</Text>
                    )}
                    {social.platform === 'Instagram' && (
                      <Text style={[styles.socialIcon, { color: colors.primary }]}>📸</Text>
                    )}
                    {social.platform === 'Discord' && (
                      <Text style={[styles.socialIcon, { color: colors.primary }]}>🕹️</Text>
                    )}
                    {social.platform === 'Facebook' && (
                      <Text style={[styles.socialIcon, { color: colors.primary }]}>f</Text>
                    )}
                    <Text style={[styles.socialLabel, { color: colors.primary }]}>{social.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Animated Stats Row */}
              <View style={styles.statsRow}>
                {stats.map((stat, idx) => (
                  <Animated.View
                    key={stat.label}
                    entering={FadeInDown.delay(100 * idx).springify()}
                    style={[styles.statChip, { backgroundColor: stat.color }]}
                  >
                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  </Animated.View>
                ))}
              </View>
              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                {actions.map((action, idx) => (
                  <Pressable
                    key={action.label}
                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.background }, pressed && { opacity: 0.7 }]}
                    onPress={action.onPress}
                  >
                    {action.icon}
                    <Text style={[styles.actionLabel, { color: colors.primary }]}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
              {/* Tabs */}
              <View style={styles.tabsRow}>
                {TABS.map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabBtn, activeTab === tab && { backgroundColor: colors.primary + (isDark ? '33' : '22') }]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </BlurView>
        </View>
      </LinearGradient>
      {/* Tab Content */}
      {activeTab === "Overview" && (
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>Region: {user.region || '-'} | Subregion: {user.subRegion || '-'}</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</Text>
        </View>
      )}
      {activeTab === "Giveaways" && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 20 }]}>Hosted Giveaways</Text>
          {hostedGiveaways.length > 0 ? (
            <FlatList
              data={hostedGiveaways}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.giveawayCardShadow}>
                  <View style={[styles.giveawayCard, { backgroundColor: colors.card }] }>
                    <Text style={[styles.giveawayTitle, { color: colors.text }]}>{item.title || 'Untitled Giveaway'}</Text>
                    <Text style={[styles.giveawayMeta, { color: colors.textSecondary }]}>ID: {item.id || item.giveawayId}</Text>
                  </View>
                </Animated.View>
              )}
              keyExtractor={(item, idx) => item.id || item.giveawayId || idx.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            />
          ) : (
            <Text style={{ color: colors.textSecondary, marginVertical: 20, marginLeft: 20 }}>No giveaways created yet.</Text>
          )}
        </View>
      )}
    </ScrollView>
    </ScreenHeaderLayout>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBg: {
    width: '100%',
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  profileCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  profileCardBlur: {
    borderRadius: 32,
    marginTop: 40,
    width: width * 0.92,
    overflow: 'hidden',
  },
  profileCard: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  avatarRingWrapper: {
    padding: 4,
    borderRadius: 60,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  username: {
    fontSize: 16,
    color: "gray",
    marginBottom: 2,
  },
  country: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
    alignSelf: 'center',
  },
  statChip: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    width: 80,
  },
  actionLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 0,
    width: '100%',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  aboutText: {
    fontSize: 15,
    marginBottom: 6,
  },
  giveawayCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    borderRadius: 16,
  },
  giveawayCard: {
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
    maxWidth: 260,
    marginRight: 12,
  },
  giveawayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  giveawayMeta: {
    fontSize: 13,
    color: 'gray',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  socialRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 6,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  followBtn: {
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
  },
});

export default UserProfileScreen; 