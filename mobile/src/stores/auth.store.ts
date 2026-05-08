import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
  role: 'RESIDENT' | 'ADMIN' | 'DRIVER';
  residentProfile?: {
    id: string;
    zoneId: string | null;
    buildingName: string | null;
    block: string | null;
    street: string | null;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingComplete: false,

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    
    // Check if user already has a profile with a zoneId
    const isDone = !!(user.residentProfile?.zoneId);
    if (isDone) {
      await AsyncStorage.setItem('onboardingComplete', 'true');
    }
    
    set({ user, token, isAuthenticated: true, onboardingComplete: isDone });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      const onboarding = await AsyncStorage.getItem('onboardingComplete');

      if (token && userStr) {
        set({ 
          user: JSON.parse(userStr), 
          token, 
          isAuthenticated: true, 
          isLoading: false,
          onboardingComplete: onboarding === 'true'
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    set({ onboardingComplete: true });
  }
}));
