'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle, Loader2 } from 'lucide-react';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        // 1. Verificar token en URL
        const adminToken = searchParams.get('token');
        if (!adminToken) {
          setError('Token de administrador requerido');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // 2. Verificar sesión de usuario autenticado
        const sessionToken = localStorage.getItem('authToken');
        if (!sessionToken) {
          setError('Sesión de usuario requerida');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // 3. Validar acceso admin en el backend
        const response = await fetch('/api/admin/verify-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ adminToken })
        });

        const data = await response.json();

        if (response.ok && data.authorized) {
          setIsAuthenticated(true);
          // Log del acceso exitoso
          console.log('✅ Acceso admin autorizado:', data.user?.email);
        } else {
          setError(data.error || 'Acceso no autorizado');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando acceso admin:', error);
        setError('Error de conexión');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, [searchParams]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando acceso administrativo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Acceso Denegado
            </CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta área.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Para acceder al panel administrativo necesitas:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 ml-4">
                <li>• Credenciales de administrador válidas</li>
                <li>• Token de acceso administrativo</li>
                <li>• Sesión de usuario activa</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push('/admin/login')}
                className="flex-1"
              >
                <Lock className="h-4 w-4 mr-2" />
                Iniciar Sesión Admin
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Ir a Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render admin content
  return (
    <div>
      {/* Admin Header with security indicator */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-green-700">
              <Shield className="h-4 w-4 mr-2" />
              <span>Sesión administrativa activa</span>
            </div>
            <div className="text-green-600">
              Acceso autorizado
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
