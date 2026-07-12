import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setSessionToken } from '../services/api';

export type UserRole = 'ADMIN' | 'SALES' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; passwordHash: string; name: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session (silent refresh) on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { accessToken, user: userData } = response.data.data;
        setSessionToken(accessToken);
        setUser(userData);
      } catch (err) {
        // Safe to ignore on initial load (user not logged in)
        setSessionToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for axios expired session events
    const handleUnauthorized = () => {
      setUser(null);
      setSessionToken(null);
    };

    window.addEventListener('unauthorized-session', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized-session', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data.data;
      setSessionToken(accessToken);
      setUser(userData);
    } catch (error) {
      setUser(null);
      setSessionToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
    address?: string;
  }) => {
    // Map passwordHash key to password for API Zod payload alignment
    await api.post('/auth/register', {
      email: data.email,
      password: data.passwordHash,
      name: data.name,
      phone: data.phone,
      address: data.address,
    });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Proceed with local logout even if server fails
    } finally {
      setSessionToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
