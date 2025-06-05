import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  bottom?: boolean;
  height?: number;
  width?: number;
  fullScreen?: boolean;
  showCloseButton?: boolean;
}

const Modal = ({
  visible,
  onClose,
  children,
  bottom = false,
  height = 0.5,
  width = 0.9,
  fullScreen = false,
  showCloseButton = true,
}: ModalProps) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const modalContent = (
    <View style={[
      styles.modalContent,
      {
        backgroundColor: colors.background,
        width: fullScreen ? '100%' : width * width,
        height: fullScreen ? '100%' : height * height,
        ...(bottom ? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        } : {
          borderRadius: 20,
        })
      }
    ]}>
      {bottom && (
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>
      )}
      {showCloseButton && (
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.card }]}
          onPress={onClose}
        >
          <View style={[styles.closeIcon, { backgroundColor: colors.text }]} />
        </TouchableOpacity>
      )}
      {children}
    </View>
  );

  return (
    <RNModal
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
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
          />
          
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          entering={bottom ? SlideInDown.springify().damping(15) : FadeIn}
          exiting={bottom ? SlideOutDown : FadeOut}
          style={[
            styles.container,
            bottom ? styles.bottomContainer : styles.centerContainer
          ]}
        >
          {modalContent}
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
});

export default Modal; 