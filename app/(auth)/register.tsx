import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Mail, User, Lock, Phone, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PhoneInput from 'react-native-phone-number-input';
import OTPTextInput from 'react-native-otp-textinput';
import { useVerifyEmailMutation, useValidateEmailCodeMutation, useSignupMutation } from '../../redux/slice/authApiSlice';
import { parsePhoneNumber } from "awesome-phonenumber";

type SignUpStep = 'email' | 'verify' | 'details' | 'password';

interface SignUpData {
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  phoneNumber: string;
  country: string;
  region: string;
  subRegion: string;
  currency: string;
  countryCode: string;
  pin: string;
}

export default function Register() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignUpStep>('email');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState<Partial<SignUpData>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneInputRef] = useState(React.createRef<any>());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verifyEmail] = useVerifyEmailMutation();
  const [validateEmailCode] = useValidateEmailCodeMutation();
  const [signup] = useSignupMutation();
  const phoneValidator = parsePhoneNumber(`${"+"+signUpData.countryCode}${signUpData.phoneNumber}`, { regionCode: "+"+signUpData.countryCode });  


  const handleEmailSubmit = async () => {
    if (!signUpData.email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email: signUpData.email.toLowerCase() }).unwrap();
      setCurrentStep('verify');
      setError(null);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      await validateEmailCode({ 
        email: signUpData.email!.toLowerCase(), 
        code: verificationCode 
      }).unwrap();
      setCurrentStep('details');
      setError(null);
    } catch (err: any) {
      setError(err.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = () => {
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.userName || !signUpData.phoneNumber) {
      setError('Please fill in all fields');
      return;
    }
    setCurrentStep('password');
  };


  const handleSignUp = async () => {
    if (!signUpData.password || !signUpData.pin) {
      setError('Please fill in all fields');
      return;
    }

    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: signUpData.email!.toLowerCase(),
        firstName: signUpData.firstName!,
        lastName: signUpData.lastName!,
        userName: signUpData.userName!,
        password: signUpData.password!,
        phoneNumber: phoneValidator.number?.e164,
        country: signUpData.country!,
        region: signUpData.region!,
        subRegion: signUpData.subRegion!,
        currency: signUpData.currency!,
        countryCode: signUpData.countryCode!,
        pin: signUpData.pin!
      }).unwrap();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Enter your email</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        We'll send you a verification code
      </Text>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Mail size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Email address"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.email}
          onChangeText={(text) => setSignUpData({ ...signUpData, email: text.toLowerCase() })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending code...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVerifyStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Verify your email</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Enter the code we sent to {signUpData.email}
      </Text>

      <OTPTextInput
        handleTextChange={setVerificationCode}
        defaultValue={verificationCode}
        inputCount={5}
        textInputStyle={[
          styles.otpInput,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
        ]}
        tintColor={colors.primary}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        <Text style={[styles.resendText, { color: colors.primary }]}>
          Resend Code
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDetailsStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Personal Information</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Tell us a bit about yourself
      </Text>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <User size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="First Name"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.firstName}
          onChangeText={(text) => setSignUpData({ ...signUpData, firstName: text })}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <User size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Last Name"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.lastName}
          onChangeText={(text) => setSignUpData({ ...signUpData, lastName: text })}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <User size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Username"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.userName}
          onChangeText={(text) => setSignUpData({ ...signUpData, userName: text })}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.phoneContainer}>
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={signUpData.phoneNumber}
          defaultCode="US"
          layout="first"
          onChangeText={(text) => {
            setSignUpData({ ...signUpData, phoneNumber: text });
          }}
          onChangeCountry={(country) => {
            setSignUpData({
              ...signUpData,
              country: country.name as string,
              countryCode: country.callingCode[0] as string,
              currency: country.currency?.[0] || 'NGN',
              region: country.region as string,
              subRegion: country.subregion as string,
            });
          }}
          containerStyle={[
            styles.phoneInputContainer,
            { backgroundColor: colors.card, borderColor: colors.border }
          ]}
          textContainerStyle={{ backgroundColor: colors.card }}
          textInputStyle={[styles.phoneInputText, { color: colors.text }]}
          codeTextStyle={[styles.phoneCodeText, { color: colors.text }]}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleDetailsSubmit}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPasswordStep = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Set your password</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Choose a secure password and PIN
      </Text>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Lock size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.password}
          onChangeText={(text) => setSignUpData({ ...signUpData, password: text })}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOff size={20} color={colors.textSecondary} />
          ) : (
            <Eye size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Lock size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.confirmPassword}
          onChangeText={(text) => setSignUpData({ ...signUpData, confirmPassword: text })}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? (
            <EyeOff size={20} color={colors.textSecondary} />
          ) : (
            <Eye size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Lock size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="PIN (4 digits)"
          placeholderTextColor={colors.textSecondary}
          value={signUpData.pin}
          onChangeText={(text) => {
            // Only allow numbers and limit to 4 digits
            const numericValue = text.replace(/[^0-9]/g, '').slice(0, 4);
            setSignUpData({ ...signUpData, pin: numericValue });
          }}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (currentStep === 'email') {
                  router.back();
                } else if (currentStep === 'verify') {
                  setCurrentStep('email');
                } else if (currentStep === 'details') {
                  setCurrentStep('verify');
                } else {
                  setCurrentStep('details');
                }
              }}
              style={[styles.backButton, { backgroundColor: colors.card }]}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'verify' && renderVerifyStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'password' && renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  phoneContainer: {
    marginBottom: 16,
  },
  phoneInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
  },
  phoneInputText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  phoneCodeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  otpContainer: {
    width: '100%',
    height: 100,
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
});