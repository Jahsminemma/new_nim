import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  accountType: 'individual' | 'brand';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, accountType: 'individual' | 'brand') => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Simulate retrieving user from storage
        const storedUser = null; // In a real app, this would be AsyncStorage.getItem('user')
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Mock sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be a call to your authentication API
      const userData: User = {
        id: '1',
        email,
        name: 'Jane Doe',
        username: 'janedoe',
        accountType: 'individual',
      };
      
      setUser(userData);
      // In a real app, store the user data
      // await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock sign up function
  const signUp = async (email: string, password: string, name: string, accountType: 'individual' | 'brand') => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be a call to your authentication API
      const userData: User = {
        id: '1',
        email,
        name,
        accountType,
      };
      
      setUser(userData);
      // In a real app, store the user data
      // await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock sign out function
  const signOut = () => {
    setUser(null);
    // In a real app, remove the user data
    // AsyncStorage.removeItem('user');
    router.replace('/login');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}