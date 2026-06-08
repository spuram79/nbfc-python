/**
 * Authentication Context for Next.js
 * Manages user session and authentication state
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// User role type
export type UserRole = 'admin' | 'branch_manager' | 'loan_officer' | 'collections' | 'customer';

// User interface
export interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  company_id: string;
  is_active: boolean;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasScope: (scopes: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Scope mapping for roles
const roleScopes: Record<UserRole, string[]> = {
  admin: ['user:read', 'user:write', 'user:delete', 'loan:read', 'loan:create', 'loan:update', 'loan:disburse', 'payment:read', 'payment:create', 'customer:read', 'customer:write', 'kyc:read', 'kyc:verify'],
  branch_manager: ['loan:read', 'loan:create', 'loan:approve', 'customer:read', 'customer:write'],
  loan_officer: ['loan:read', 'loan:create', 'loan:update', 'customer:read', 'kyc:read'],
  collections: ['loan:read', 'loan:update', 'payment:read', 'payment:create'],
  customer: ['loan:read', 'loan:create', 'payment:read', 'self:read'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.access_token);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'customer') {
        router.push('/dashboard/customer');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  // Check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  // Check if user has specific scope(s)
  const hasScope = (scopes: string | string[]) => {
    if (!user) return false;
    const userScopes = roleScopes[user.role] || [];
    const scopesArray = Array.isArray(scopes) ? scopes : [scopes];
    return scopesArray.some(scope => userScopes.includes(scope));
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    hasRole,
    hasScope,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}