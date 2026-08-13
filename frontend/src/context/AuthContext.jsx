import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

// Minutes of no mouse/keyboard/touch activity before an authenticated
// session is force-logged-out. Independent of the JWT's own expiry —
// this fires even if the access token is still technically valid.
const IDLE_TIMEOUT_MINUTES = 15;
const IDLE_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      setIsAuthenticated(authenticated);
      setUser(authenticated ? currentUser : null);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    return result;
  };

  const forgotPassword = async (email) => authService.forgotPassword(email);

  const resetPassword = async (token, newPassword) => authService.resetPassword(token, newPassword);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Idle-timeout watcher — only active while signed in.
  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MINUTES * 60 * 1000);
    };

    IDLE_EVENTS.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      IDLE_EVENTS.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [isAuthenticated, logout]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAdmin: () => user?.role === 'admin',
    isDoctor: () => user?.role === 'doctor',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};