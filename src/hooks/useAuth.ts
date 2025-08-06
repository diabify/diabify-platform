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
      // Verificar tanto admin como user tokens
      const adminToken = localStorage.getItem('adminToken');
      const adminExpiry = localStorage.getItem('adminTokenExpiry');
      
      // Verificar token de usuario de las cookies
      const userToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('userToken='))
        ?.split('=')[1];

      // Verificar admin token primero
      if (adminToken && adminExpiry) {
        const expiryTime = parseInt(adminExpiry);
        const now = Date.now();

        if (now <= expiryTime) {
          setAuthState({ isAuthenticated: true, isLoading: false, token: adminToken });
          console.log('🔐 Admin autenticado');
          return;
        } else {
          // Token de admin expirado
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminTokenExpiry');
        }
      }

      // Verificar user token
      if (userToken) {
        setAuthState({ isAuthenticated: true, isLoading: false, token: userToken });
        console.log('🔐 Usuario autenticado');
        return;
      }

      // No hay tokens válidos
      setAuthState({ isAuthenticated: false, isLoading: false, token: null });
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
