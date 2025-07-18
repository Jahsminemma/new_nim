import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height: mainHeight } = Dimensions.get('window');

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: number;
  showCloseIcon?: boolean;
  showHandle?: boolean;
  enableBackdropClose?: boolean;
  scrollable?: boolean;
}

const CustomModal = ({
  visible,
  onClose,
  children,
  title,
  height = 0.5,
  showCloseIcon = true,
  showHandle = true,
  enableBackdropClose = true,
  scrollable = false,
}: CustomModalProps) => {
  const { colors, isDark } = useTheme();

  const modalHeight = height <= 1 ? height * mainHeight : Math.min(mainHeight, mainHeight * 0.9);

  if (!visible) return null;

  const renderContent = () => {
    const content = (
      <View style={styles.content}>
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          style={StyleSheet.absoluteFill}
        >
          <BlurView
            intensity={20}
            tint={isDark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
          />
          
          {enableBackdropClose && (
            <Pressable 
              style={StyleSheet.absoluteFill}
              onPress={onClose}
            />
          )}
        </Animated.View>
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown}
          style={[
            styles.bottomSheet,
            { 
              backgroundColor: colors.background,
              height: modalHeight,
            }
          ]}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
          )}

          {(title || showCloseIcon) && (
            <View style={styles.header}>
              <View style={styles.headerContent}>
                {title && (
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {title}
                  </Text>
                )}
              </View>
              {showCloseIcon && (
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.card }]}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default CustomModal;