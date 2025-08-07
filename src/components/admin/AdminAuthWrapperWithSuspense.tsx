'use client';

import { Suspense } from 'react';
import AdminAuthWrapper from './AdminAuthWrapper';

// Componente de carga para SSR fallback
function AdminAuthFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando acceso administrativo...</p>
      </div>
    </div>
  );
}

interface AdminAuthWrapperWithSuspenseProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapperWithSuspense({ children }: AdminAuthWrapperWithSuspenseProps) {
  return (
    <Suspense fallback={<AdminAuthFallback />}>
      <AdminAuthWrapper>
        {children}
      </AdminAuthWrapper>
    </Suspense>
  );
}
