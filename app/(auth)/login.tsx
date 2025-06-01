import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.headerContainer}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }} 
              style={styles.logoImage}
            />
          </Animated.View>
          <Animated.Text 
            entering={FadeInDown.delay(200).springify()}
            style={[styles.title, { color: colors.text }]}
          >
            Welcome Back
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(300).springify()}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Sign in to continue to EventHub
          </Animated.Text>
        </View>
        
        <View style={styles.formContainer}>
          {error && (
            <Animated.View 
              entering={FadeInDown.delay(100).springify()}
              style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}
          
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Mail size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(600).springify()}
            style={styles.forgotContainer}
          >
            <TouchableOpacity>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(800).springify()}
            style={styles.registerContainer}
          >
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Don't have an account? 
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}> Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    paddingHorizontal: 24,
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
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  registerLink: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
});