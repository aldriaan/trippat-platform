'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/app/stores/auth-store';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authStore = useAuthStore();

  // Initialize auth when provider mounts - only run once
  useEffect(() => {
    authStore.initializeAuth();
  }, []); // Empty dependency array to run only once

  // Adapt the Zustand store to match the Context interface
  const contextValue: AuthContextType = useMemo(() => ({
    user: authStore.user ? {
      ...authStore.user,
      _id: authStore.user.id, // Add _id field for compatibility
    } : null,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    login: authStore.login,
    logout: authStore.logout,
    setUser: authStore.setUser,
  }), [
    authStore.user,
    authStore.token,
    authStore.isAuthenticated,
    authStore.isLoading,
    authStore.login,
    authStore.logout,
    authStore.setUser,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;