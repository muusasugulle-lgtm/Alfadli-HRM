import { useState, useEffect } from 'react';
import { authService, User } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      // Optionally verify token with backend (only if backend is available)
      authService.getProfile().catch((err) => {
        // Only logout if it's an auth error (401), not a connection error
        if (err.response?.status === 401) {
          authService.logout();
          setUser(null);
        }
        // For connection errors, keep the user logged in with cached data
      });
    }
    setLoading(false);
  }, []);

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
    isAuthenticated: !!user,
    isAdmin,
    isManager,
    isStaff,
    isOwner,
    canWrite,
  };
};



