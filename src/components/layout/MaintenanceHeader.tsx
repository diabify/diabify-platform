'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function MaintenanceHeader() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        {/* Logo centrado */}
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="text-gray-900">Diabify</span>
          <span className="text-blue-600">2.0</span>
        </Link>
      </div>
    </header>
  );
}
