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
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Palette,
  FileText,
  Activity
} from 'lucide-react';

interface SessionSpecialty {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    templates: number;
  };
}

export default function SessionSpecialtiesTab() {
  const [specialties, setSpecialties] = useState<SessionSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/admin/session-specialties');
      const data = await response.json();
      setSpecialties(data.specialties || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">Cargando especialidades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Especialidades de Sesión</h3>
          <p className="text-sm text-muted-foreground">
            {specialties.length} especialidades configuradas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Especialidad
        </Button>
      </div>

      {/* Vista de tarjetas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty) => (
          <Card key={specialty.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {specialty.color ? (
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: specialty.color }}
                    />
                  ) : (
                    <Palette className="h-4 w-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base">{specialty.name}</CardTitle>
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
                {specialty.description && (
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Descripción:</span>
                    </div>
                    <p className="text-sm text-gray-700">{specialty.description}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plantillas:</span>
                  <Badge variant="outline">
                    {specialty._count.templates} plantillas
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={specialty.isActive ? "default" : "secondary"}>
                    {specialty.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {specialty.color && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Color:</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: specialty.color }}
                      />
                      <span className="text-xs font-mono">{specialty.color}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vista de tabla */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Vista Detallada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especialidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Plantillas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {specialty.color ? (
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: specialty.color }}
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-full border bg-gray-200" />
                      )}
                      <span className="font-medium">{specialty.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {specialty.description ? (
                      <span className="text-sm text-gray-600">
                        {specialty.description.length > 60 
                          ? `${specialty.description.substring(0, 60)}...`
                          : specialty.description
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin descripción</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {specialty.color ? (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: specialty.color }}
                        />
                        <span className="text-xs font-mono">{specialty.color}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin color</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {specialty._count.templates}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={specialty.isActive ? "default" : "secondary"}>
                      {specialty.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(specialty.createdAt).toLocaleDateString('es-ES')}
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
