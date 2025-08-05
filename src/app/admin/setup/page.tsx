'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, UserPlus, AlertTriangle } from 'lucide-react';

const CreateAdminPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    secretKey: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; admin?: any } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          admin: data.admin
        });
        setFormData({ email: '', name: '', secretKey: '' });
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al crear usuario administrador'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión. Inténtalo de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear Usuario Administrador
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configuración inicial del sistema Diabify 2.0
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Nuevo Administrador
            </CardTitle>
            <CardDescription>
              Crea el primer usuario administrador para gestionar la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@diabify.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="secretKey">Clave Secreta</Label>
                <Input
                  id="secretKey"
                  name="secretKey"
                  type="password"
                  required
                  value={formData.secretKey}
                  onChange={handleChange}
                  placeholder="Clave secreta del sistema"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Debe coincidir con ADMIN_CREATION_SECRET en las variables de entorno
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Crear Administrador
                  </div>
                )}
              </Button>
            </form>

            {result && (
              <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <div className="text-green-600">✅</div>
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </p>
                    {result.admin && (
                      <div className="mt-3 text-sm text-green-700 bg-green-100 p-3 rounded">
                        <p><strong>ID:</strong> {result.admin.id}</p>
                        <p><strong>Email:</strong> {result.admin.email}</p>
                        <p><strong>Rol:</strong> {result.admin.role}</p>
                        <p className="mt-2 text-xs text-green-600">
                          Guarda esta información de forma segura. 
                          Puedes usar este ID para autenticarte en el panel de admin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Esta página debe usarse solo para la configuración inicial del sistema
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminPage;
