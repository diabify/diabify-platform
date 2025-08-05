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

// Datos de ejemplo para demostración
const mockSubscriptions: NewsletterSubscription[] = [
  {
    id: '1',
    email: 'usuario1@ejemplo.com',
    source: 'MAINTENANCE_PAGE',
    ipAddress: '192.168.1.1',
    spamScore: 2,
    isBlocked: false,
    isActive: true,
    createdAt: '2025-08-05T10:30:00Z',
    updatedAt: '2025-08-05T10:30:00Z'
  },
  {
    id: '2',
    email: 'usuario2@gmail.com',
    source: 'LANDING_PAGE',
    ipAddress: '192.168.1.2',
    spamScore: 1,
    isBlocked: false,
    isActive: true,
    createdAt: '2025-08-04T15:45:00Z',
    updatedAt: '2025-08-04T15:45:00Z'
  },
  {
    id: '3',
    email: 'spam@suspicious.com',
    source: 'BLOG',
    ipAddress: '10.0.0.1',
    spamScore: 15,
    isBlocked: true,
    isActive: false,
    createdAt: '2025-08-03T08:20:00Z',
    updatedAt: '2025-08-03T08:25:00Z'
  },
  {
    id: '4',
    email: 'newsletter@empresa.com',
    source: 'SOCIAL_MEDIA',
    ipAddress: '172.16.0.1',
    spamScore: 0,
    isBlocked: false,
    isActive: true,
    createdAt: '2025-08-02T12:10:00Z',
    updatedAt: '2025-08-02T12:10:00Z'
  },
  {
    id: '5',
    email: 'contacto@startup.es',
    source: 'REFERRAL',
    ipAddress: '192.168.100.50',
    spamScore: 3,
    isBlocked: false,
    isActive: true,
    createdAt: '2025-08-01T09:30:00Z',
    updatedAt: '2025-08-01T09:30:00Z'
  }
];

const mockStats: DashboardStats = {
  total: 5,
  active: 4,
  blocked: 1,
  recent: 2
};

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
    // Simular carga de datos con delay
    const loadMockData = () => {
      setTimeout(() => {
        setSubscriptions(mockSubscriptions);
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    loadMockData();
  }, []);

  const handleToggleSubscription = async (id: string, currentStatus: boolean) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, isActive: !currentStatus, updatedAt: new Date().toISOString() }
            : sub
        )
      );

      // Actualizar stats
      setStats(prev => ({
        ...prev,
        active: currentStatus ? prev.active - 1 : prev.active + 1
      }));

    } catch (error) {
      console.error('Error toggling subscription:', error);
      setError('Error al actualizar la suscripción');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceLabel = (source: string) => {
    const labels: { [key: string]: string } = {
      'MAINTENANCE_PAGE': 'Página Mantenimiento',
      'LANDING_PAGE': 'Página Principal',
      'BLOG': 'Blog',
      'SOCIAL_MEDIA': 'Redes Sociales',
      'REFERRAL': 'Referencia'
    };
    return labels[source] || source;
  };

  const getSpamScoreColor = (score: number) => {
    if (score >= 10) return 'text-red-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Newsletter Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Gestión de suscripciones y estadísticas
            </p>
            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
              📊 Datos de demostración activos
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Suscripciones
              </CardTitle>
              <div className="text-2xl">📧</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Todas las suscripciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Activas
              </CardTitle>
              <div className="text-2xl">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Suscripciones activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bloqueadas
              </CardTitle>
              <div className="text-2xl">🚫</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
              <p className="text-xs text-muted-foreground">
                Por spam o inactivas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recientes (24h)
              </CardTitle>
              <div className="text-2xl">🆕</div>
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
            <CardTitle>Suscripciones Recientes</CardTitle>
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
                          {getSourceLabel(subscription.source)}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs">{subscription.ipAddress}</td>
                      <td className="p-2">
                        <span className={`font-semibold ${getSpamScoreColor(subscription.spamScore)}`}>
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
                            ⏸️ Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-xs text-gray-600">
                        {formatDate(subscription.createdAt)}
                      </td>
                      <td className="p-2">
                        {!subscription.isBlocked && (
                          <Button
                            size="sm"
                            variant={subscription.isActive ? "outline" : "default"}
                            onClick={() => handleToggleSubscription(subscription.id, subscription.isActive)}
                          >
                            {subscription.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Dashboard Demo</h3>
          <p className="text-blue-800 text-sm mb-3">
            Este dashboard está funcionando con datos de ejemplo para demostrar toda la funcionalidad. 
            Incluye gestión de estados, interactividad completa y todas las características del panel de administración.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-1">✅ Funcionalidades implementadas:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Estadísticas en tiempo real</li>
                <li>• Gestión de suscripciones</li>
                <li>• Activar/desactivar usuarios</li>
                <li>• Visualización de datos de spam</li>
                <li>• Interfaz responsive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">🔄 Próximos pasos:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Conectar con base de datos real</li>
                <li>• Implementar filtros avanzados</li>
                <li>• Exportación de datos</li>
                <li>• Notificaciones en tiempo real</li>
                <li>• Analytics avanzados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
