import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Settings, 
  Plus,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';

export default function AdminSessionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Sesiones</h1>
          <p className="text-muted-foreground">
            Gestiona plantillas, duraciones, especialidades y asignaciones de profesionales
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesionales Asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              80% de profesionales verificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duraciones Disponibles</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              30min - 2h disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Todas las áreas cubiertas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Plantillas de Sesión</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="durations">Duraciones</TabsTrigger>
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Sesión</CardTitle>
              <CardDescription>
                Gestiona las plantillas disponibles para los profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Cargando plantillas...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones de Profesionales</CardTitle>
              <CardDescription>
                Asigna plantillas de sesión a profesionales con precios personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Cargando asignaciones...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="durations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duraciones de Sesión</CardTitle>
              <CardDescription>
                Configura las duraciones disponibles para las sesiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Cargando duraciones...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Especialidades de Sesión</CardTitle>
              <CardDescription>
                Gestiona las especialidades y categorías de sesiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Cargando especialidades...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
