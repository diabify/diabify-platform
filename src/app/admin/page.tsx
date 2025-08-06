'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  Star, 
  Calendar,
  Settings,
  Activity
} from 'lucide-react';

// Importar componentes de pestañas
import SessionTemplatesTab from '@/components/admin/SessionTemplatesTab';
import ProfessionalAssignmentsTab from '@/components/admin/ProfessionalAssignmentsTab';
import SessionDurationsTab from '@/components/admin/SessionDurationsTab';
import SessionSpecialtiesTab from '@/components/admin/SessionSpecialtiesTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">Sistema de Gestión de Sesiones - Diabify 2.0</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Settings className="h-4 w-4 mr-1" />
              Admin Dashboard
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plantillas de Sesión</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">plantillas configuradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duraciones</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">opciones disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">categorías activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">profesionales asignados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gestión del Sistema de Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Plantillas
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Asignaciones
                </TabsTrigger>
                <TabsTrigger value="durations" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duraciones
                </TabsTrigger>
                <TabsTrigger value="specialties" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Especialidades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-6">
                <SessionTemplatesTab />
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <ProfessionalAssignmentsTab />
              </TabsContent>

              <TabsContent value="durations" className="mt-6">
                <SessionDurationsTab />
              </TabsContent>

              <TabsContent value="specialties" className="mt-6">
                <SessionSpecialtiesTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
