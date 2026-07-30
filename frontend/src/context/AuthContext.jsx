import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.profile();
      const profile = data.user || data;
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Auth profile refresh failed:', error.message || error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const profile = response.user || response;
    setUser(profile);
    return profile;
  };

  const signup = async (data) => {
    await authApi.signup(data);
    return true;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
