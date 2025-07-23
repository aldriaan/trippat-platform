import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from '@/app/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (token: string, user: User) => {
    Cookies.set('admin_token', token, { 
      expires: 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  
  logout: () => {
    Cookies.remove('admin_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  setUser: (user: User) => set({ user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  initializeAuth: async () => {
    const token = Cookies.get('admin_token');
    if (token) {
      // Simply check if token exists, don't validate here
      // The API interceptor will handle 401s if token is invalid
      set({
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));