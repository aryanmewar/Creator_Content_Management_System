import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, isLoading: false };
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    const user = localStorage.getItem('cms_user');
    if (token && user) {
      dispatch({ type: 'INIT', payload: { token, user: JSON.parse(user), isAuthenticated: true } });
    } else {
      dispatch({ type: 'INIT', payload: { isAuthenticated: false } });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const { user, token } = response.data;
    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const value = { ...state, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
