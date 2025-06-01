import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Gift, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

interface GiveawayCardProps {
  giveaway: {
    id: number;
    title: string;
    description: string;
    prize: string;
    endDate: string;
    imageUrl: string;
    participants: number;
    host: string;
    category?: string;
  };
}

export default function GiveawayCard({ giveaway }: GiveawayCardProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/giveaway/${giveaway.id}`)}
    >
      <Image source={{ uri: giveaway.imageUrl }} style={styles.image} />
      
      <View style={styles.overlay}>
        <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Gift size={18} color={colors.primary} />
              <Text style={[styles.prizeLabel, { color: colors.primary }]}>GIVEAWAY</Text>
            </View>
            
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {giveaway.title}
            </Text>
            
            <Text style={[styles.prize, { color: colors.text }]} numberOfLines={1}>
              Prize: {giveaway.prize}
            </Text>
            
            <View style={styles.footer}>
              <View style={styles.participantsContainer}>
                <Users size={16} color={colors.textSecondary} />
                <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
                  {giveaway.participants}
                </Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Ends {giveaway.endDate}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prizeLabel: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  title: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  prize: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
});