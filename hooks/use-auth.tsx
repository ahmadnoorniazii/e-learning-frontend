"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthUser, authService } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string, role?: 'student' | 'instructor') => Promise<AuthUser>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    
    if (currentUser) {
      console.log('🔄 AuthProvider: Restored user:', currentUser.role);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
      console.log('🔄 AuthProvider: Login successful, user role:', user.role);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor' = 'student'): Promise<AuthUser> => {
    try {
      const user = await authService.register(name, email, password, role);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loading
    }}>
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