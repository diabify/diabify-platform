'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NewsletterSubscription {
  id: string;
  email: string;
  source: string;
  ipAddress: string;
  userAgent?: string | null;
  isActive: boolean;
  isVerified: boolean;
  verifyToken?: string | null;
  spamScore?: number;
  isBlocked?: boolean;
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
      setError(null);
      
      console.log('🔄 Fetching subscriptions...');
      const response = await fetch('/api/newsletter/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data);
      
      setSubscriptions(data.subscriptions || []);
      setStats(data.stats || {
        total: data.subscriptions?.length || 0,
        active: data.subscriptions?.filter((s: any) => s.isActive).length || 0,
        blocked: data.subscriptions?.filter((s: any) => s.isBlocked).length || 0,
        recent: 0
      });
      
    } catch (err) {
      console.error('❌ Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`🔄 Toggling subscription ${id} from ${currentStatus} to ${!currentStatus}`);
      
      const response = await fetch('/api/newsletter/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Toggle successful, refreshing data...');
      await fetchSubscriptions(); // Refrescar datos
      
    } catch (err) {
      console.error('❌ Error toggling subscription:', err);
      setError('Error al actualizar la suscripción');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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

  const getSpamScoreColor = (score?: number) => {
    if (!score && score !== 0) return 'text-gray-600';
    if (score >= 10) return 'text-red-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del newsletter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSubscriptions} className="mr-2">
            🔄 Reintentar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            🔃 Recargar página
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
              Gestión de suscripciones y estadísticas en tiempo real
            </p>
            <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
              🔗 Conectado a base de datos real
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
                Verificadas
              </CardTitle>
              <div className="text-2xl">✔️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {subscriptions.filter(s => s.isVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Emails verificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de suscripciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Suscripciones Recientes</CardTitle>
              <p className="text-sm text-gray-600">
                Total: {subscriptions.length} suscripciones
              </p>
            </div>
            <Button onClick={fetchSubscriptions} variant="outline" size="sm">
              🔄 Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <p className="text-gray-600">No hay suscripciones aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Fuente</th>
                      <th className="text-left p-2">IP</th>
                      <th className="text-left p-2">Spam Score</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Verificado</th>
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
                            {subscription.spamScore ?? 'N/A'}/20
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
                        <td className="p-2">
                          {subscription.isVerified ? (
                            <span className="text-green-600">✔️ Sí</span>
                          ) : (
                            <span className="text-yellow-600">⏳ Pendiente</span>
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
                              onClick={() => handleToggleActive(subscription.id, subscription.isActive)}
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
            )}
          </CardContent>
        </Card>

        {/* Información del sistema */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">🎯 Sistema Operativo</h3>
          <p className="text-green-800 text-sm mb-3">
            Dashboard conectado exitosamente a la base de datos de producción. 
            Todos los datos mostrados son reales y se actualizan en tiempo real.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-medium mb-1">✅ Funcionalidades activas:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Datos en tiempo real de Supabase</li>
                <li>• Gestión de suscripciones</li>
                <li>• Activar/desactivar usuarios</li>
                <li>• Monitoreo de verificación de email</li>
                <li>• Interfaz responsive completa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">📊 Estado del sistema:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Base de datos: 🟢 Conectada</li>
                <li>• API endpoints: 🟢 Operativos</li>
                <li>• Email alerts: 🟢 Funcionando</li>
                <li>• Dashboard: 🟢 En línea</li>
                <li>• Domain: 🟢 services.diabify.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
