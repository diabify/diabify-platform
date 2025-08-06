'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    const verifyEmail = async () => {
      try {
        // Usar GET en lugar de POST ya que el enlace del email usa GET
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('¡Tu cuenta ha sido verificada exitosamente!');
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push('/login?message=Cuenta verificada exitosamente');
          }, 3000);
        } else {
          if (data.error === 'Token expirado') {
            setStatus('expired');
            setMessage('El enlace de verificación ha expirado');
          } else {
            setStatus('error');
            setMessage(data.error || 'Error en la verificación');
          }
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setStatus('error');
        setMessage('Error de conexión. Intenta nuevamente.');
      }
    };

    verifyEmail();
  }, [token, router]);

  const resendVerificationEmail = async () => {
    // Implementar reenvío de email de verificación
    console.log('Resending verification email...');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            {status === 'loading' && (
              <div className="bg-blue-100 p-3 rounded-full">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
            {(status === 'error' || status === 'expired') && (
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl text-center">
            {status === 'loading' && 'Verificando cuenta...'}
            {status === 'success' && '¡Verificación exitosa!'}
            {status === 'error' && 'Error de verificación'}
            {status === 'expired' && 'Enlace expirado'}
          </CardTitle>
          
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Tu cuenta está ahora verificada y puedes acceder a todas las funcionalidades de Diabify.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Serás redirigido al login automáticamente...
              </p>
              <Link href="/login">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Ir al login ahora
                </Button>
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  El enlace de verificación ha expirado. Puedes solicitar uno nuevo.
                </p>
              </div>
              <Button 
                onClick={resendVerificationEmail} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Reenviar email de verificación
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  Hubo un problema con la verificación. Por favor, intenta nuevamente o contacta soporte.
                </p>
              </div>
              <div className="flex space-x-2">
                <Link href="/register" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Volver al registro
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full">
                    Ir al login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
