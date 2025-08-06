'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Activity
} from 'lucide-react';

interface SessionDuration {
  id: string;
  name: string;
  minutes: number;
  isActive: boolean;
  createdAt: string;
}

export default function SessionDurationsTab() {
  const [durations, setDurations] = useState<SessionDuration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDurations();
  }, []);

  const fetchDurations = async () => {
    try {
      const response = await fetch('/api/admin/session-durations');
      const data = await response.json();
      setDurations(data.durations || []);
    } catch (error) {
      console.error('Error fetching durations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">Cargando duraciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Duraciones de Sesión</h3>
          <p className="text-sm text-muted-foreground">
            {durations.length} duraciones configuradas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Duración
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {durations.map((duration) => (
          <Card key={duration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{duration.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duración:</span>
                  <Badge variant="outline">
                    {formatDuration(duration.minutes)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={duration.isActive ? "default" : "secondary"}>
                    {duration.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Minutos:</span>
                  <span className="text-sm font-medium">{duration.minutes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla alternativa para vista más compacta */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Vista Detallada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Minutos</TableHead>
                <TableHead>Duración Formateada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durations.map((duration) => (
                <TableRow key={duration.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{duration.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{duration.minutes}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatDuration(duration.minutes)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={duration.isActive ? "default" : "secondary"}>
                      {duration.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(duration.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
