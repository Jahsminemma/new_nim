import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Modal,
  ScrollView,
  Pressable
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export interface IOrderDetailItem {
  label: string;
  value: string;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onClickPay: () => void;
  orderItemDetails: IOrderDetailItem[];
  pin: string;
  setPin: (value: string) => void;
  label: string;
  orderDetailTitle: string;
  orderDetailLabel: string;
}

const PaymentModal = ({
  visible,
  onClose,
  orderItemDetails,
  pin,
  setPin,
  label,
  orderDetailLabel,
  orderDetailTitle,
  onClickPay,
}: PaymentModalProps) => {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) {
      setStep('details');
      setPin('');
      setError('');
    }
  }, [visible, setPin]);

  const handleContinuePayment = () => {
    setStep('pin');
  };

  const handleCancel = () => {
    setStep('details');
    setPin('');
    setError('');
    onClose();
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handlePay = () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    onClickPay();
    onClose();
  };

  const renderOrderDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        {orderDetailTitle}
      </Text>
      <Text style={[styles.amount, { color: colors.primary }]}>
        {orderDetailLabel}
      </Text>

      <ScrollView style={styles.orderDetailsContainer} showsVerticalScrollIndicator={false}>
        {orderItemDetails.map((item, index) => (
          <View key={index} style={[styles.orderDetailItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.orderDetailLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[
              styles.orderDetailValue, 
              { 
                color: item.label.toLowerCase().includes('total') ? colors.primary : colors.text,
                fontWeight: item.label.toLowerCase().includes('total') ? 'bold' : 'normal'
              }
            ]}>
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinuePayment}
        >
          <Text style={styles.continueButtonText}>
            Continue Payment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinInput = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Enter PIN
      </Text>
      <Text style={[styles.amount, { color: colors.primary }]}>
        {label}
      </Text>
      
      <Text style={[styles.pinInstruction, { color: colors.textSecondary }]}>
        Enter your 4-digit PIN to complete the payment
      </Text>

      {/* PIN Dots */}
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: pin.length > index ? colors.primary : 'transparent',
                borderColor: colors.border,
              }
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.keypadContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((key, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.keypadButton,
              { backgroundColor: colors.card },
              key === '' && { opacity: 0 }
            ]}
            onPress={() => {
              if (key === '⌫') {
                handleBackspace();
              } else if (key !== '') {
                handlePinInput(key.toString());
              }
            }}
            disabled={key === ''}
          >
            <Text style={[styles.keypadText, { color: colors.text }]}>
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            { 
              backgroundColor: pin.length === 4 ? colors.primary : colors.primary + '50',
              opacity: pin.length === 4 ? 1 : 0.6
            }
          ]}
          onPress={handlePay}
          disabled={pin.length !== 4}
        >
          <Text style={styles.continueButtonText}>
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!visible) return null;

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
          
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown}
          style={[
            styles.bottomSheet,
            { backgroundColor: colors.background }
          ]}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {step === 'details' ? 'Payment Details' : 'Enter PIN'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.card }]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View 
            style={styles.content}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {step === 'details' ? renderOrderDetails() : renderPinInput()}
          </View>
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
    maxHeight: height * 0.85,
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
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderDetailsContainer: {
    flex: 1,
    marginBottom: 24,
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  orderDetailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  orderDetailValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  pinInstruction: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 16,
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  keypadButton: {
    width: (width - 80) / 3 - 8,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  continueButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default PaymentModal;