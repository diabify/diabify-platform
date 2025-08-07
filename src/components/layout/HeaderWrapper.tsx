'use client';

import { Suspense } from 'react';
import Header from './Header';

// Header simple para SSR fallback
function HeaderFallback() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm">♥</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Diabify</span>
            <span className="text-xl font-bold text-blue-600">2.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HeaderWrapper() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <Header />
    </Suspense>
  );
}
