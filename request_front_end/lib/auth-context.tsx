"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getCSRFToken } from './api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'lecturer' | 'hod' | 'cellule' | 'admin';
  student_profile?: any;
  lecturer_profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize CSRF token and check auth status
    const initAuth = async () => {
      await getCSRFToken();
      await fetchUser();
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // User not authenticated, that's okay
      console.log('User not authenticated');
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const userData = await authAPI.login(username, password);
      setUser(userData);
      
      // Redirect based on role
      if (userData && userData.role) {
        redirectToDashboard(userData.role);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/login');
    }
  };

  const signup = async (data: any) => {
    try {
      await authAPI.signup(data);
      // After successful signup, redirect to login
      router.push('/login');
    } catch (error) {
      throw error;
    }
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'student':
        router.push('/student/dashboard');
        break;
      case 'lecturer':
      case 'hod':
        router.push('/staff/dashboard');
        break;
      case 'cellule':
        router.push('/cellule/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refetchUser }}>
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

// Hook for protected routes
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles) {
        // Check if user has access via role or cellule_informatique flag
        const hasCelluleAccess = user?.lecturer_profile?.cellule_informatique === true
        const userRole = user.role
        
        // Allow access if:
        // 1. Role is in allowedRoles, OR
        // 2. User is lecturer/hod with cellule_informatique flag and 'cellule' is in allowedRoles
        const hasAccess = allowedRoles.includes(userRole) || 
          (hasCelluleAccess && (userRole === 'lecturer' || userRole === 'hod') && allowedRoles.includes('cellule'))
        
        if (!hasAccess) {
          // Redirect to appropriate dashboard if wrong role
          switch (userRole) {
            case 'student':
              router.push('/student/dashboard');
              break;
            case 'lecturer':
            case 'hod':
              router.push('/staff/dashboard');
              break;
            case 'cellule':
              router.push('/cellule/dashboard');
              break;
            default:
              router.push('/');
          }
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  return { user, loading };
}

