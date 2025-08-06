'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Llamar API de logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirigir al home
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar logout local incluso si falla la API
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  const refreshUser = () => {
    checkUserAuth();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refreshUser
  };
}
