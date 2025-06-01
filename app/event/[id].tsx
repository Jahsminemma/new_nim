import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Share2, Calendar, Clock, MapPin, Users, Ticket } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockFeaturedEvents } from '@/data/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [buying, setBuying] = useState(false);
  
  // Find the event with matching ID
  const event = mockFeaturedEvents.find(e => e.id === Number(id));
  
  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} on EventHub! Join me on ${event.date} at ${event.location}.`,
        url: 'https://eventhub.com/event/' + event.id,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };
  
  const handleBuyTicket = () => {
    setBuying(true);
    // Simulate purchase process
    setTimeout(() => {
      setBuying(false);
      // Navigate to success page or show confirmation
      router.push('/(tabs)/profile');
    }, 2000);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />
          
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background + '80' }]}
              onPress={() => router.back()}
            >
              <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background + '80' }]}
              onPress={handleShare}
            >
              <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <Share2 size={24} color={colors.text} />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Animated.Text 
            entering={FadeInDown.delay(100).springify()}
            style={[styles.title, { color: colors.text }]}
          >
            {event.title}
          </Animated.Text>
          
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.infoContainer}
          >
            <View style={styles.infoItem}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{event.date}</Text>
            </View>
            
            {event.time && (
              <View style={styles.infoItem}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{event.time}</Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <MapPin size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{event.location}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={[styles.attendeeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Users size={20} color={colors.primary} />
            <Text style={[styles.attendeeText, { color: colors.text }]}>
              {event.attendees} people attending
            </Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About Event</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {event.description}
            </Text>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.ticketHeader}>
              <View style={styles.ticketIconContainer}>
                <Ticket size={24} color={colors.primary} />
              </View>
              <View style={styles.ticketInfo}>
                <Text style={[styles.ticketLabel, { color: colors.textSecondary }]}>Regular Ticket</Text>
                <Text style={[styles.ticketPrice, { color: colors.text }]}>{event.price}</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.ticketDetails}>
              <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
                • Access to all event areas
              </Text>
              <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
                • Complimentary welcome drink
              </Text>
              <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
                • Official event merchandise
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Price</Text>
          <Text style={[styles.price, { color: colors.text }]}>{event.price}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.buyButton, { backgroundColor: colors.primary }]}
          onPress={handleBuyTicket}
          disabled={buying}
        >
          <Text style={styles.buyButtonText}>
            {buying ? 'Processing...' : 'Buy Ticket'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  attendeeText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  ticketCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketIconContainer: {
    marginRight: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 20,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  ticketDetails: {
    
  },
  ticketDetailText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  price: {
    fontSize: 20,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  buyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Medium',
    textAlign: 'center',
    marginTop: 20,
  },
  backLink: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
});