import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading = true while we check "is there already a valid token?" on app load.
  // Without this, every page would flash a logged-out state for a split second.
  const [loading, setLoading] = useState(true);

  // On first mount: if a token exists, ask the backend who it belongs to.
  // This is what keeps a user logged in after a page refresh.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        // Token was invalid/expired - api.js interceptor already clears it
        // and redirects, but we still clear local state defensively.
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login({ email, password }) {
    const { token, user } = await authService.loginUser({ email, password });
    localStorage.setItem('token', token); // ONLY the token is persisted
    setUser(user);
    return user;
  }

  async function register({ name, email, password }) {
    const { token, user } = await authService.registerUser({ name, email, password });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  async function refreshProfile(updates) {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}