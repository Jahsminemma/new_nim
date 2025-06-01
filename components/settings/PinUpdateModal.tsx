import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';

interface PinUpdateModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PinUpdateModal({ visible, onClose }: PinUpdateModalProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const handlePinPress = (number: string) => {
    setError('');
    if (step === 'current') {
      if (pin.length < 4) {
        const newPin = pin + number;
        setPin(newPin);
        if (newPin.length === 4) {
          // Verify current PIN
          if (newPin === '1234') { // Replace with actual PIN verification
            setStep('new');
            setPin('');
          } else {
            setError('Incorrect PIN');
            setPin('');
          }
        }
      }
    } else if (step === 'new') {
      if (pin.length < 4) {
        const newPin = pin + number;
        setPin(newPin);
        if (newPin.length === 4) {
          setNewPin(newPin);
          setStep('confirm');
          setPin('');
        }
      }
    } else {
      if (pin.length < 4) {
        const confirmPin = pin + number;
        setPin(confirmPin);
        if (confirmPin.length === 4) {
          if (confirmPin === newPin) {
            // Update PIN
            onClose();
            setStep('current');
            setPin('');
            setNewPin('');
          } else {
            setError('PINs do not match');
            setPin('');
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              { 
                backgroundColor: index < pin.length ? colors.primary : colors.border,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    return (
      <View style={styles.keypad}>
        {numbers.map((number, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.keypadButton,
              { backgroundColor: colors.card },
              number === '' && { opacity: 0 }
            ]}
            onPress={() => number === '⌫' ? handleBackspace() : number && handlePinPress(number)}
            disabled={number === ''}
          >
            <Text style={[styles.keypadText, { color: colors.text }]}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.card }]}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'current' ? 'Enter Current PIN' : 
             step === 'new' ? 'Enter New PIN' : 
             'Confirm New PIN'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 'current' ? 'Please enter your current PIN to continue' :
             step === 'new' ? 'Choose a new 4-digit PIN' :
             'Re-enter your new PIN to confirm'}
          </Text>
        )}

        {renderPinDots()}
        {renderKeypad()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
    borderRadius: 16,
  },
  keypadText: {
    fontSize: 24,
    fontFamily: 'Inter-Medium',
  },
});