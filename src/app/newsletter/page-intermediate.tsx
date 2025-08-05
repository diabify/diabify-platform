'use client';

import { useState } from 'react';

interface DashboardStats {
  total: number;
  active: number;
  blocked: number;
  recent: number;
}

export default function NewsletterDashboard() {
  const [stats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    blocked: 0,
    recent: 0
  });
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📧 Newsletter Dashboard
        </h1>
        <p className="text-gray-600">
          Gestión de suscripciones al newsletter de Diabify 2.0
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-400">Suscripciones totales</p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-gray-400">Suscriptores activos</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              <p className="text-xs text-gray-400">Por spam score alto</p>
            </div>
            <span className="text-2xl">🚫</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recientes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.recent}</p>
              <p className="text-xs text-gray-400">Últimas 24 horas</p>
            </div>
            <span className="text-2xl">🆕</span>
          </div>
        </div>
      </div>

      {/* Tabla de suscripciones */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📋 Lista de Suscripciones</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              🔄 Actualizar
            </button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500">No hay suscripciones todavía</p>
            <p className="text-sm text-gray-400 mt-2">
              Las nuevas suscripciones aparecerán aquí automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
