import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { setAuthSessionHandler } from '../api/client';
import { login as loginRequest, register as registerRequest } from '../api/payplus';
import { User } from '../api/types';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role?: User['role']) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = 'payplus.auth';
const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { user: User; token: string };
          setUser(cached.user);
          setToken(cached.token);
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const persist = useCallback(async (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest(email.trim(), password);
      if (!response.data.token) {
        throw new Error('Login did not return an auth token.');
      }
      await persist(response.data.user, response.data.token);
    },
    [persist]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string, role: User['role'] = 'admin') => {
      const response = await registerRequest(name.trim(), email.trim(), password, role);
      if (!response.data.token || response.data.requiresApproval) {
        return true;
      }
      await persist(response.data.user, response.data.token);
      return false;
    },
    [persist]
  );

  const signOut = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    let alertVisible = false;

    setAuthSessionHandler((reason, message) => {
      setUser(null);
      setToken(null);
      AsyncStorage.removeItem(STORAGE_KEY);

      if (!alertVisible) {
        alertVisible = true;
        Alert.alert(reason === 'blocked' ? 'Account blocked' : 'Session expired', message, [
          {
            text: 'OK',
            onPress: () => {
              alertVisible = false;
            }
          }
        ]);
      }
    });

    return () => setAuthSessionHandler(undefined);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [loading, signIn, signOut, signUp, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
