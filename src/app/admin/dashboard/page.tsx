'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Clock, 
  Star, 
  TrendingUp,
  Mail,
  Calendar,
  Settings,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Stats {
  users: {
    total: number;
    byRole: Record<string, number>;
    recentRegistrations: number;
  };
  professionals: {
    total: number;
    verified: number;
    pending: number;
    byType: Record<string, number>;
    averageRating: number;
    recentRegistrations: number;
  };
  sessions: {
    total: number;
    recent: number;
  };
  newsletter: {
    total: number;
    active: number;
    inactive: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  professional?: {
    id: string;
    type: string;
    verified: boolean;
    rating: number;
    _count: { sessions: number };
  };
}

const AdminDashboardComplete = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [roleReason, setRoleReason] = useState('');

  // Simular admin ID para testing
  const ADMIN_ID = 'admin-test-id';

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': ADMIN_ID }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: { 'x-user-id': ADMIN_ID }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setIsUpdatingRole(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': ADMIN_ID
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole,
          reason: roleReason
        })
      });

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
        setSelectedUser(null);
        setNewRole('');
        setRoleReason('');
        alert('Rol actualizado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error al actualizar el rol');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'PROFESSIONAL': 'bg-blue-100 text-blue-800',
      'USER': 'bg-green-100 text-green-800',
      'VISITOR': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel completo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Panel de Administración Completo
              </h1>
              <p className="text-gray-600 mt-1">Gestión integral - Diabify 2.0</p>
            </div>
            <Button variant="outline" onClick={fetchStats}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar Stats
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="professionals">Profesionales</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.users.total}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.users.recentRegistrations} esta semana
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profesionales</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.professionals.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.professionals.verified} verificados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sesiones Total</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.sessions.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.sessions.recent} últimos 30 días
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.professionals.averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      De profesionales verificados
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Distribución por roles */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Usuarios por Rol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.users.byRole).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <Badge variant="outline" className={getRoleColor(role)}>
                            {role}
                          </Badge>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profesionales por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.professionals.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tab: Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra roles y permisos de usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            {user.professional?.verified && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                ✓ Profesional
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Registrado: {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Gestionar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gestionar Usuario</DialogTitle>
                            <DialogDescription>
                              Cambiar rol y permisos de {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newRole">Nuevo Rol</Label>
                              <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="VISITOR">Visitante</SelectItem>
                                  <SelectItem value="USER">Usuario</SelectItem>
                                  <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
                                  <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="reason">Razón del cambio</Label>
                              <Input
                                id="reason"
                                value={roleReason}
                                onChange={(e) => setRoleReason(e.target.value)}
                                placeholder="Motivo del cambio de rol..."
                              />
                            </div>

                            <Button
                              onClick={handleRoleChange}
                              disabled={isUpdatingRole || newRole === user.role}
                              className="w-full"
                            >
                              {isUpdatingRole ? 'Actualizando...' : 'Actualizar Rol'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Profesionales */}
          <TabsContent value="professionals">
            <div className="text-center py-8">
              <p className="text-gray-600">
                La gestión de profesionales está disponible en el panel principal de admin
              </p>
              <Button asChild className="mt-4">
                <a href="/admin">Ir al Panel de Profesionales</a>
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajustes y configuraciones administrativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" asChild>
                    <a href="/admin/setup">Crear Nuevo Admin</a>
                  </Button>
                  <Button variant="outline" onClick={fetchStats}>
                    Actualizar Estadísticas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardComplete;
