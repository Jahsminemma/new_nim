import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Bell, Search, X } from 'lucide-react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SharedValue } from 'react-native-reanimated';

interface HomeHeaderProps {
  scrollY: SharedValue<number>;
}

export default function HomeHeader({ scrollY }: HomeHeaderProps) {
  const { colors, isDark } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1]
    );

    return {
      opacity,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0, 0.5, 1]
    );

    return {
      opacity,
    };
  });

  return (
    <>
      <Animated.View style={[styles.header, headerStyle]}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.row}>
          {searchVisible ? (
            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search events, giveaways..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity>
                <Image 
                  source={{ uri: 'https://i.pravatar.cc/300' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              
              <Animated.Text style={[styles.title, { color: colors.text }, titleStyle]}>
                EventHub
              </Animated.Text>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: colors.card }]}
                  onPress={() => setSearchVisible(true)}
                >
                  <Search size={20} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: colors.card }]}
                >
                  <Bell size={20} color={colors.text} />
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        
        {!searchVisible && (
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning, Jane
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  actions: {
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
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontFamily: 'SF-Pro-Text-Regular',
    fontSize: 16,
  },
});