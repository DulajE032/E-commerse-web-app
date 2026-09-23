"use client";
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuthTokens, getStoredRefreshToken, getStoredToken, setAuthTokens } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? getStoredToken() : null));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(typeof window !== 'undefined' ? Boolean(getStoredToken()) : false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const profile = await api.getProfile(storedToken);
        if (isMounted) {
          setUser(profile);
          setToken(storedToken);
        }
      } catch {
        clearAuthTokens();
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
  }, []);

  const establishSession = useCallback(async (accessToken, refreshToken) => {
    setAuthTokens(accessToken, refreshToken);
    setToken(accessToken);
    const profile = await api.getProfile(accessToken);
    setUser(profile);
    setIsInitializing(false);
    return profile;
  }, []);

  const login = useCallback(async (email, password, turnstileToken) => {
    const response = await api.login({ email, password, turnstile_token: turnstileToken });
    return establishSession(response.access_token, response.refresh_token);
  }, [establishSession]);

  const adminLogin = useCallback(async (email, password, turnstileToken) => {
    const response = await api.adminLogin({ email, password, turnstile_token: turnstileToken });
    const profile = await establishSession(response.access_token, response.refresh_token);
    if (profile.role !== 'admin') {
      throw new Error('Admin access required');
    }
    return profile;
  }, [establishSession]);

  const signup = useCallback(async ({ fullName, email, password, turnstileToken }) => {
    const response = await api.signup({
      full_name: fullName,
      email,
      password,
      turnstile_token: turnstileToken,
    });
    return establishSession(response.access_token, response.refresh_token);
  }, [establishSession]);

  const logout = useCallback(async () => {
    const currentRefreshToken = getStoredRefreshToken();
    if (currentRefreshToken) {
      try {
        await api.serverLogout(currentRefreshToken);
      } catch {
        // Ignore server error on logout
      }
    }
    clearAuthTokens();
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
      adminLogin,
      signup,
      logout,
      establishSession,
    }),
    [token, user, isInitializing, login, adminLogin, signup, logout, establishSession],
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
