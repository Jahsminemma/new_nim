import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Users } from 'lucide-react-native';

interface GiveawayListItemProps {
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

export default function GiveawayListItem({ giveaway }: GiveawayListItemProps) {
  const { colors } = useTheme();
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/giveaway/${giveaway.id}`)}
    >
      <Image source={{ uri: giveaway.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {giveaway.title}
        </Text>
        
        <Text style={[styles.prize, { color: colors.primary }]} numberOfLines={1}>
          Prize: {giveaway.prize}
        </Text>
        
        <Text style={[styles.host, { color: colors.textSecondary }]} numberOfLines={1}>
          By {giveaway.host}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Ends {giveaway.endDate}
            </Text>
          </View>
          
          <View style={styles.footerItem}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {giveaway.participants} entries
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.statusTag, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.statusText, { color: colors.primary }]}>Active</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  prize: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
    marginBottom: 4,
  },
  host: {
    fontSize: 13,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  statusTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
});