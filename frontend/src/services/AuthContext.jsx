/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const profile = await api.getProfile(token);
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        localStorage.removeItem('token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const establishSession = useCallback(async (accessToken) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    const profile = await api.getProfile(accessToken);
    setUser(profile);
    setIsInitializing(false);
    return profile;
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.login({ email, password });
    return establishSession(response.access_token);
  }, [establishSession]);

  const signup = useCallback(async ({ fullName, email, password }) => {
    await api.signup({
      full_name: fullName,
      email,
      password,
    });
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsInitializing(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isInitializing,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, isInitializing, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
