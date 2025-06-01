import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Gift, ArrowRight, Bell, Search, MapPin, CirclePlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [hasEvents] = useState(false);
  const [hasGiveaways] = useState(false);
  const [hasPromotions] = useState(false);

  const EmptyStateCard = ({ 
    title, 
    description, 
    buttonText, 
    onPress,
    image 
  }: { 
    title: string;
    description: string;
    buttonText: string;
    onPress: () => void;
    image: string;
  }) => (
    <Animated.View 
      entering={FadeInDown.springify()}
      style={[styles.emptyStateCard, { backgroundColor: colors.card }]}
    >
      <Image 
        source={{ uri: image }}
        style={styles.emptyStateImage}
      />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
      <TouchableOpacity 
        style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
        onPress={onPress}
      >
        <Text style={styles.emptyStateButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.userSection}
            onPress={() => router.push('/(screens)/profile')}
          >
            <Image 
              source={{ uri: 'https://i.pravatar.cc/300' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
              <Text style={[styles.username, { color: colors.text }]}>{user?.name || 'Guest'}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/search')}
            >
              <Search size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('(screens)/notifications')}
            >
              <Bell size={20} color={colors.text} />
              <View style={[styles.badge, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Events</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/events')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {!hasEvents ? (
            <EmptyStateCard
              title="No Events Yet"
              description="Be the first to create an amazing event for your community!"
              buttonText="Create Event"
              onPress={() => router.push('/(tabs)/create')}
              image="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
          ) : null}
        </View>

        {/* Active Giveaways Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Gift size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hot Giveaways</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/giveaways')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {!hasGiveaways ? (
            <EmptyStateCard
              title="No Active Giveaways"
              description="Start a giveaway to engage with your community and reward your followers!"
              buttonText="Create Giveaway"
              onPress={() => router.push('/(tabs)/create')}
              image="https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
          ) : null}
        </View>

        {/* Promotions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Offers</Text>
          </View>

          {!hasPromotions ? (
            <EmptyStateCard
              title="No Special Offers"
              description="Create special offers and promotions to attract more attendees to your events!"
              buttonText="Create Offer"
              onPress={() => router.push('/(tabs)/create')}
              image="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/create')}
        >
          <CirclePlus size={24} color="white" />
          <Text style={styles.createButtonText}>Create Something Amazing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  emptyStateCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
});