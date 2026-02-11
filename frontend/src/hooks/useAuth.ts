import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage immediately
    return authService.getUser();
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const profile = await authService.getProfile();
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(profile));
        setUser(profile);
      }
    } catch (err: any) {
      // Only logout if it's an auth error (401)
      if (err.response?.status === 401) {
        authService.logout();
        setUser(null);
      }
      // For connection errors, keep the cached user
    }
  }, []);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      // Verify and refresh user data from backend
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    return response;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';
  const isOwner = user?.role === 'OWNER';
  
  // canWrite: Admin and Staff can write; Manager is view-only
  const canWrite = isAdmin || isStaff;

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin,
    isManager,
    isStaff,
    isOwner,
    canWrite,
  };
};
