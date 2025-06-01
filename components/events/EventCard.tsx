import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, MapPin, Users } from 'lucide-react-native';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    imageUrl: string;
    attendees: number;
    price?: string;
    category?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {event.date} {event.time ? `• ${event.time}` : ''}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.attendeesContainer}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.attendeesText, { color: colors.textSecondary }]}>
              {event.attendees} attending
            </Text>
          </View>
          
          {event.price && (
            <View style={[styles.priceTag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.priceText, { color: colors.primary }]}>
                {event.price}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  priceTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
});