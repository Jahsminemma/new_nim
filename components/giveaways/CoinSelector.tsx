import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { X, Coins } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

interface CoinSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (amount: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;

const coinOptions = [
  { amount: 500, label: '500 NIM' },
  { amount: 1000, label: '1,000 NIM' },
  { amount: 2500, label: '2,500 NIM' },
  { amount: 5000, label: '5,000 NIM' },
  { amount: 10000, label: '10,000 NIM' },
  { amount: 25000, label: '25,000 NIM' },
  { amount: 50000, label: '50,000 NIM' },
  { amount: 100000, label: '100,000 NIM' },
  { amount: 160000, label: '160,000 NIM' },
];

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function CoinSelector({ visible, onClose, onSelect }: CoinSelectorProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={StyleSheet.absoluteFill}
      >
        <AnimatedBlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
          ]}
        />
        
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown}
          style={[
            styles.bottomSheet,
            { backgroundColor: colors.card, height: SHEET_HEIGHT }
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Prize Amount
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            bounces={false}
          >
            <View style={styles.grid}>
              {coinOptions.map((option) => (
                <TouchableOpacity
                  key={option.amount}
                  style={[
                    styles.coinCard,
                    { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => {
                    onSelect(option.amount);
                    onClose();
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Coins size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.amount, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.equivalent, { color: colors.textSecondary }]}>
                    ≈ ${(option.amount * 0.1).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  coinCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  equivalent: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});