"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContextData } from '../types/auth-context.interface';
import { User } from '../types/user.interface';
import fetcher, { refreshAccessToken } from '../lib/api';
import { usePathname, useRouter } from 'next/navigation';

const clearContext: AuthContextData = {
  user: null,
  accessToken: null,
  refreshToken: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  refreshAccessToken: async () => {},
};

export const AuthContext = createContext<AuthContextData>(clearContext);

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    console.log('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    } else if (pathname !== '/register') {
      router.push('/login');
    }
  }, [router]);

  const login = async (email: string, password: string) => {
    const response = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { accessToken, refreshToken, user } = response;
    console.log(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const register = async (email: string, password: string, name: string) => {
    await fetcher('/user', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    await login(email, password);
  };

  const refreshAccessTokenHandler = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const newToken = await refreshAccessToken(refreshToken);
    if (newToken) {
      setAccessToken(newToken);
      localStorage.setItem('token', newToken);
    }
  }, [refreshToken]);

  return (

    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, register, refreshAccessToken: refreshAccessTokenHandler }}>
      {children}
    </AuthContext.Provider>
  );
};
