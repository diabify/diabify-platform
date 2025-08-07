'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyContent() {
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
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verificado correctamente');
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          if (response.status === 410) {
            setStatus('expired');
            setMessage(data.error || 'El enlace de verificación ha expirado');
          } else {
            setStatus('error');
            setMessage(data.error || 'Error al verificar el email');
          }
        }
      } catch (error) {
        console.error('Error verificando email:', error);
        setStatus('error');
        setMessage('Error de conexión');
      }
    };

    verifyEmail();
  }, [token, router]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verificando email...';
      case 'success':
        return '¡Email verificado!';
      case 'expired':
        return 'Enlace expirado';
      case 'error':
        return 'Error de verificación';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Por favor espera mientras verificamos tu email';
      case 'success':
        return 'Tu email ha sido verificado correctamente. Serás redirigido al login.';
      case 'expired':
        return 'El enlace de verificación ha expirado. Solicita uno nuevo.';
      case 'error':
        return message || 'Ha ocurrido un error durante la verificación';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        {status !== 'loading' && (
          <CardFooter className="flex flex-col space-y-3">
            {status === 'success' && (
              <p className="text-sm text-gray-500 text-center">
                Redirigiendo automáticamente...
              </p>
            )}
            
            {(status === 'error' || status === 'expired') && (
              <div className="space-y-2 w-full">
                <Button 
                  onClick={() => router.push('/register')}
                  className="w-full"
                >
                  Registrarse de nuevo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir al login
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function VerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl">Cargando...</CardTitle>
          <CardDescription>
            Preparando verificación de email
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
