import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../redux/store';
import { 
  setCredentials, 
  setLoginStatus, 
  setLoading, 
  setOnboardingComplete,
  LoginStatus,
  User 
} from '../redux/slice/authSlice';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignUpRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  region: string;
  subRegion: string;
  country: string;
  currency: string;
  countryCode: string;
  pin: string;
}

interface AuthResponse {
  data: User & {
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    message: string;
  };
}

class AuthService {
  private async getHeaders() {
    const tokens = await AsyncStorage.getItem('tokens');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      if (accessToken) {
        headers['authorization'] = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  private async checkTokenExpiration() {
    try {
      const tokens = await AsyncStorage.getItem('tokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens);
        if (accessToken) {
          // You can implement JWT decode here to check expiration
          // For now, we'll just check if the token exists
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      store.dispatch(setLoading(true));
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to login');
      }

      if (data.data) {
        const { accessToken, refreshToken, ...userData } = data.data;
        
        await Promise.all([
          AsyncStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken })),
          AsyncStorage.setItem('userData', JSON.stringify(userData)),
          AsyncStorage.setItem('authStatus', JSON.stringify({ status: true }))
        ]);

        store.dispatch(setCredentials(userData));
        store.dispatch(setLoginStatus(LoginStatus.ACTIVE));
      }
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  async signUp(userData: SignUpRequest): Promise<void> {
    try {
      store.dispatch(setLoading(true));
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to sign up');
      }

      if (data.data) {
        const { accessToken, refreshToken, ...userInfo } = data.data;
        
        await Promise.all([
          AsyncStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken })),
          AsyncStorage.setItem('userData', JSON.stringify(userInfo)),
          AsyncStorage.setItem('authStatus', JSON.stringify({ status: true }))
        ]);

        store.dispatch(setCredentials(userInfo));
        store.dispatch(setLoginStatus(LoginStatus.ACTIVE));
      }
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['tokens', 'userData', 'authStatus']);
      store.dispatch(setCredentials(null));
      store.dispatch(setLoginStatus(LoginStatus.INACTIVE));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      store.dispatch(setOnboardingComplete(true));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  async initializeAuth(): Promise<{ user: User | null; hasCompletedOnboarding: boolean }> {
    try {
      const [userData, onboardingComplete] = await Promise.all([
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('onboardingComplete')
      ]);

      const hasCompletedOnboarding = onboardingComplete === 'true';
      store.dispatch(setOnboardingComplete(hasCompletedOnboarding));

      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const isTokenValid = await this.checkTokenExpiration();

        if (isTokenValid) {
          store.dispatch(setCredentials(parsedUserData));
          store.dispatch(setLoginStatus(LoginStatus.ACTIVE));
          return { user: parsedUserData, hasCompletedOnboarding };
        } else {
          store.dispatch(setLoginStatus(LoginStatus.EXPIRED));
          return { user: null, hasCompletedOnboarding };
        }
      }

      return { user: null, hasCompletedOnboarding };
    } catch (error) {
      console.error('Error initializing auth:', error);
      return { user: null, hasCompletedOnboarding: false };
    }
  }
}

export const authService = new AuthService(); 