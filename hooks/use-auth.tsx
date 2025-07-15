"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthUser, authService } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string, role?: 'student' | 'instructor') => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Initializing auth...');
        
        // Check if we have a stored user and token
        const storedUser = authService.getCurrentUser();
        const token = localStorage.getItem('auth-token');
        
        if (storedUser && token) {
          console.log('🔄 AuthProvider: Found stored user and token, validating...');
          
          try {
            // Validate token by attempting to fetch current user from API
            const refreshedUser = await authService.refreshCurrentUser();
            if (refreshedUser) {
              console.log('✅ AuthProvider: Token valid, user authenticated:', refreshedUser.role);
              setUser(refreshedUser);
            } else {
              console.log('❌ AuthProvider: Token invalid, clearing auth state');
              authService.logout();
              setUser(null);
            }
          } catch (error) {
            console.log('❌ AuthProvider: Token validation failed, clearing auth state:', error);
            authService.logout();
            setUser(null);
          }
        } else {
          console.log('🔄 AuthProvider: No stored auth data found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error during auth initialization:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for automatic logout events
    const handleAutoLogout = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🚪 AuthProvider: Auto logout detected:', customEvent.detail?.reason);
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAutoLogout);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('auth-logout', handleAutoLogout);
    };
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

  const refreshUser = async (): Promise<AuthUser | null> => {
    try {
      console.log('🔄 AuthProvider: Manual user refresh requested');
      const refreshedUser = await authService.refreshCurrentUser();
      setUser(refreshedUser);
      console.log('✅ AuthProvider: User refreshed successfully:', refreshedUser?.role);
      return refreshedUser;
    } catch (error) {
      console.error('❌ AuthProvider: Failed to refresh user:', error);
      // Don't logout on refresh failure - the user might still be valid
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
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