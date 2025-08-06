'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export default function UserDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 UserDashboard mounted, fetching data...');
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('📡 Fetching user profile...');
      console.log('🍪 Current cookies:', document.cookie);
      
      const response = await fetch('/api/user/profile', {
        credentials: 'include' // Importante para incluir cookies
      });
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User data received:', data);
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        setAuthError(errorData.error || 'Error de autenticación');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setAuthError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error de Autenticación</h2>
            <p className="text-red-600 mb-4">{authError}</p>
            <Link href="/login">
              <Button>Volver al Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ¡Bienvenido, {userData?.name || 'Usuario'}!
                </h1>
                <p className="text-gray-600">
                  Gestiona tus citas y consultas médicas
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {userData?.isVerified ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    No verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verificación de cuenta */}
        {!userData?.isVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Verifica tu cuenta
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Para acceder a todas las funcionalidades, verifica tu dirección de email.
                </p>
                <div className="mt-3">
                  <Link href="/auth/verify">
                    <Button size="sm" variant="outline">
                      Verificar ahora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <CardTitle className="text-lg">Agendar Cita</CardTitle>
                  <CardDescription>
                    Programa una consulta con nuestros profesionales
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/profesionales">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <CardTitle className="text-lg">Mis Citas</CardTitle>
                  <CardDescription>
                    Ver y gestionar tus citas programadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/citas">
                <Button variant="outline" className="w-full">
                  Ver Citas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <CardTitle className="text-lg">Mi Perfil</CardTitle>
                  <CardDescription>
                    Actualizar información personal y de salud
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/perfil">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Información de la cuenta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900">{userData?.name || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{userData?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <p className="text-gray-900">
                  {userData?.isVerified ? 'Cuenta verificada' : 'Pendiente de verificación'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Miembro desde</label>
                <p className="text-gray-900">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!userData?.isVerified && (
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="text-sm text-yellow-800">Verificar cuenta por email</span>
                  </div>
                )}
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm text-blue-800">Completar perfil de salud</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-green-800">Agendar primera consulta</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
