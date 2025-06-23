import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../redux/slice/authApiSlice';
import {
  LoginStatus,
  setCredentials,
  setCredentialsAsync,
  setLoginStatus,
} from '../redux/slice/authSlice';
import { AppDispatch } from '../redux/store';
import { storeData, storeTokens } from '@/utils';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  accountType: 'individual' | 'brand';
  enablePush?: boolean;
  deviceLoginCount?: number;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStatus: LoginStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginStatus: LoginStatus.INACTIVE,
  signIn: async () => {},
  signOut: () => {},
  completeOnboarding: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginStatus, setLoginStatusState] = useState<LoginStatus>(LoginStatus.INACTIVE);
  const [existingAccountOnDevice, setExistingAccountOnDevice] = useState<User | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [login] = useLoginMutation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData')
      
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        setExistingAccountOnDevice(parsedUserData);
        setLoginStatusState(LoginStatus.ACTIVE);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await login({ email, password }).unwrap();
      
      if (res.data) {
        const tokens = {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        };

        await storeTokens(JSON.stringify(tokens));
        const userData: User = { ...res.data };
        const { accessToken, refreshToken, ...userWithoutTokens } = userData;

        await storeData('userData', userWithoutTokens);
        
        setUser(userWithoutTokens);
        setLoginStatusState(LoginStatus.ACTIVE);
        dispatch(setLoginStatus(LoginStatus.ACTIVE));
        dispatch(setCredentials(userWithoutTokens));
        dispatch(
          setCredentialsAsync({
            ...userWithoutTokens,
            deviceLoginCount: existingAccountOnDevice?.deviceLoginCount
              ? existingAccountOnDevice.deviceLoginCount + 1
              : 1,
          })
        );

        setExistingAccountOnDevice(userWithoutTokens);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      if (err.error) {
        Alert.alert('Error', err.error.message || 'Failed to sign in');
      } else {
        Alert.alert('Error', err?.data?.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['tokens', 'userData']);
      setUser(null);
      setLoginStatusState(LoginStatus.INACTIVE);
      dispatch(setLoginStatus(LoginStatus.INACTIVE));
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      loginStatus,
      signIn,
      signOut,
      completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}