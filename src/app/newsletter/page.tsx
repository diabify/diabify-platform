'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NewsletterSubscription {
  id: string;
  email: string;
  source: string;
  ipAddress: string;
  spamScore: number;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  total: number;
  active: number;
  blocked: number;
  recent: number;
}

export default function NewsletterDashboard() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    blocked: 0,
    recent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/newsletter/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setStats(data.stats);
    } catch (err) {
      setError('Error loading newsletter data');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/newsletter/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchSubscriptions(); // Refrescar datos
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

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
          <Button 
            onClick={fetchSubscriptions} 
            className="mt-4"
          >
            Reintentar
          </Button>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Suscripciones totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Suscriptores activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <span className="text-2xl">🚫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <p className="text-xs text-muted-foreground">
              Por spam score alto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recientes</CardTitle>
            <span className="text-2xl">🆕</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de suscripciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📋 Lista de Suscripciones</span>
            <Button onClick={fetchSubscriptions} variant="outline" size="sm">
              🔄 Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Fuente</th>
                  <th className="text-left p-2">IP</th>
                  <th className="text-left p-2">Spam Score</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{subscription.email}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {subscription.source}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600 font-mono text-xs">
                      {subscription.ipAddress}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.spamScore >= 10 
                          ? 'bg-red-100 text-red-800' 
                          : subscription.spamScore >= 5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscription.spamScore}/20
                      </span>
                    </td>
                    <td className="p-2">
                      {subscription.isBlocked ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          🚫 Bloqueado
                        </span>
                      ) : subscription.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          ✅ Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          ⏸️ Pausado
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-gray-600 text-xs">
                      {formatDate(subscription.createdAt)}
                    </td>
                    <td className="p-2">
                      {!subscription.isBlocked && (
                        <Button
                          onClick={() => handleToggleActive(subscription.id, subscription.isActive)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {subscription.isActive ? '⏸️ Pausar' : '▶️ Activar'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {subscriptions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay suscripciones todavía</p>
              <p className="text-sm text-gray-400 mt-2">
                Las nuevas suscripciones aparecerán aquí automáticamente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
