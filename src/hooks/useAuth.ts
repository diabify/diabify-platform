'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Para el cliente, seguimos usando localStorage como fallback
      // Pero el middleware usará las cookies httpOnly
      const token = localStorage.getItem('adminToken');
      const expiry = localStorage.getItem('adminTokenExpiry');

      if (!token || !expiry) {
        setAuthState({ isAuthenticated: false, isLoading: false, token: null });
        return;
      }

      const expiryTime = parseInt(expiry);
      const now = Date.now();

      if (now > expiryTime) {
        // Token expirado
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminTokenExpiry');
        setAuthState({ isAuthenticated: false, isLoading: false, token: null });
        return;
      }

      // Token válido
      setAuthState({ isAuthenticated: true, isLoading: false, token });
      console.log('🔐 Usuario autenticado con token:', token.substring(0, 8) + '...');
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthState({ isAuthenticated: false, isLoading: false, token: null });
    }
  };

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Intentando login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('🔐 Login exitoso, guardando token...');
        // Guardar en localStorage para el cliente (la cookie httpOnly se maneja automáticamente)
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminTokenExpiry', data.expiresAt.toString());
        setAuthState({ isAuthenticated: true, isLoading: false, token: data.token });
        return { success: true };
      } else {
        console.log('🔐 Login fallido:', data.error);
        return { success: false, error: data.error || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('🔐 Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    try {
      // Llamar API de logout para limpiar cookie del servidor
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error en logout API:', error);
    }
    
    // Limpiar localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    setAuthState({ isAuthenticated: false, isLoading: false, token: null });
    
    console.log('🔐 Usuario desconectado');
    // Forzar recarga para asegurar limpieza completa
    window.location.href = '/login';
  };

  const redirectToLogin = (currentPath?: string) => {
    const loginUrl = currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : '/login';
    router.push(loginUrl);
  };

  return {
    ...authState,
    login,
    logout,
    redirectToLogin,
    checkAuth
  };
}
