import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Shield, 
  Calendar,
  Globe,
  AlertTriangle 
} from 'lucide-react';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  // Obtener estadísticas
  const [
    totalSubscriptions,
    activeSubscriptions,
    blockedSubscriptions,
    recentSubscriptions,
    spamAttempts,
  ] = await Promise.all([
    prisma.newsletter.count(),
    prisma.newsletter.count({ where: { isActive: true } }),
    prisma.newsletter.count({ where: { isBlocked: true } }),
    prisma.newsletter.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        source: true,
        spamScore: true,
        isActive: true,
        isBlocked: true,
        createdAt: true,
        ipAddress: true,
      }
    }),
    prisma.newsletter.count({ where: { spamScore: { gte: 10 } } }),
  ]);

  // Estadísticas por fuente
  const sourceStats = await prisma.newsletter.groupBy({
    by: ['source'],
    _count: { source: true },
    orderBy: { _count: { source: 'desc' } }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Newsletter</h1>
        <p className="text-gray-600 mt-2">Gestión de suscripciones y análisis anti-spam</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suscripciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Todos los registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {totalSubscriptions > 0 ? Math.round((activeSubscriptions / totalSubscriptions) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Por medidas anti-spam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intentos Spam</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{spamAttempts}</div>
            <p className="text-xs text-muted-foreground">Score ≥ 10</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Subscriptions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suscripciones Recientes</CardTitle>
            <CardDescription>Últimas 10 suscripciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sub.email}</span>
                      {sub.isBlocked && (
                        <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                      )}
                      {!sub.isActive && !sub.isBlocked && (
                        <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                      )}
                      {sub.isActive && !sub.isBlocked && (
                        <Badge variant="default" className="text-xs bg-green-600">Activo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.createdAt).toLocaleDateString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {sub.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Score: {sub.spamScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentSubscriptions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay suscripciones registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Source Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Fuentes de Suscripción</CardTitle>
            <CardDescription>Distribución por origen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceStats.map((stat) => (
                <div key={stat.source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stat.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{stat._count.source}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalSubscriptions > 0 ? (stat._count.source / totalSubscriptions) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {sourceStats.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
