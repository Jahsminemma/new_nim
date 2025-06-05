import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
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
  height?: number;
  orderDetailTitle: string;
  orderDetailLabel: string;
}

const OrderDetailItem = ({ label, value }: IOrderDetailItem) => {
  const { colors } = useTheme();
  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.itemValue, { color: label === "Total amount" ? colors.primary : colors.text }]}>
        {value}
      </Text>
    </View>
  );
};

const OrderDetailsStep = ({ 
  orderDetailLists, 
  title, 
  label, 
  onContinue, 
  onClose 
}: { 
  orderDetailLists: IOrderDetailItem[];
  title: string;
  label: string;
  onContinue: () => void;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.amount, { color: colors.primary }]}>{label}</Text>

      <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
        {orderDetailLists.map((item) => (
          <OrderDetailItem
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </View>

      <View style={[styles.bottomContent, { backgroundColor: colors.primary + '20' }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={[styles.cancelButtonText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>Confirm to Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PinInputStep = ({
  pin,
  setPin,
  label,
  onPay,
  onClose
}: {
  pin: string;
  setPin: (value: string) => void;
  label: string;
  onPay: () => void;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const [error, setError] = useState('');

  const handlePinChange = (value: string) => {
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Input PIN to Pay</Text>
      <Text style={[styles.amount, { color: colors.primary }]}>{label}</Text>

      <View style={[styles.pinContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>
          Enter your 4-digit PIN
        </Text>
        <View style={styles.pinInputContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                { 
                  backgroundColor: pin.length > index ? colors.primary : colors.border,
                  borderColor: colors.border
                }
              ]}
            />
          ))}
        </View>
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}
      </View>

      <View style={[styles.bottomContent, { backgroundColor: colors.primary + '20' }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={[styles.cancelButtonText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (pin.length === 4) {
              onPay();
            } else {
              setError('Please enter a valid PIN');
            }
          }}
        >
          <Text style={styles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  height = 0.55,
}: PaymentModalProps) => {
  const { colors, isDark } = useTheme();
  const [showPinInput, setShowPinInput] = useState(false);

  if (!visible) return null;

  return (
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
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown}
        style={[
          styles.bottomSheet,
          { 
            backgroundColor: colors.background,
            height: height * height
          }
        ]}
      >
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {showPinInput ? (
          <PinInputStep
            pin={pin}
            setPin={setPin}
            label={label}
            onPay={() => {
              onClickPay();
              onClose();
            }}
            onClose={() => {
              onClose();
              setShowPinInput(false);
            }}
          />
        ) : (
          <OrderDetailsStep
            orderDetailLists={orderItemDetails}
            title={orderDetailTitle}
            label={orderDetailLabel}
            onContinue={() => setShowPinInput(true)}
            onClose={() => {
              onClose();
              setShowPinInput(false);
            }}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  itemLabel: {
    fontSize: 15,
    opacity: 0.9,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.9,
  },
  bottomContent: {
    flexDirection: 'row',
    padding: 7,
    width: width * 0.9,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pinContainer: {
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  pinLabel: {
    fontSize: 16,
    marginBottom: 20,
  },
  pinInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default PaymentModal; 