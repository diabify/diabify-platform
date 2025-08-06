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
  Users, 
  Euro, 
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

interface SessionTemplate {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  category: string;
  modality: string;
  isActive: boolean;
  duration: {
    name: string;
    minutes: number;
  };
  specialty: {
    name: string;
    color: string;
  } | null;
  _count: {
    professionals: number;
    sessions: number;
  };
}

export default function SessionTemplatesTab() {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/session-templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      'INITIAL': 'bg-blue-100 text-blue-800',
      'FOLLOW_UP': 'bg-green-100 text-green-800',
      'EMERGENCY': 'bg-red-100 text-red-800',
      'PSYCHOLOGY': 'bg-purple-100 text-purple-800',
      'GROUP': 'bg-orange-100 text-orange-800',
      'CONSULTATION': 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      'INITIAL': 'Inicial',
      'FOLLOW_UP': 'Seguimiento',
      'EMERGENCY': 'Urgencia',
      'PSYCHOLOGY': 'Psicológico',
      'GROUP': 'Grupal',
      'CONSULTATION': 'Consulta',
    };

    return (
      <Badge className={variants[category] || variants['CONSULTATION']}>
        {labels[category] || category}
      </Badge>
    );
  };

  const getModalityBadge = (modality: string) => {
    const variants: Record<string, string> = {
      'ONLINE': 'bg-green-100 text-green-800',
      'IN_PERSON': 'bg-blue-100 text-blue-800',
      'HYBRID': 'bg-yellow-100 text-yellow-800',
    };

    const labels: Record<string, string> = {
      'ONLINE': 'Online',
      'IN_PERSON': 'Presencial',
      'HYBRID': 'Híbrido',
    };

    return (
      <Badge variant="outline" className={variants[modality]}>
        {labels[modality] || modality}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">Cargando plantillas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Plantillas de Sesión</h3>
          <p className="text-sm text-muted-foreground">
            {templates.length} plantillas configuradas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plantilla</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Profesionales</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description?.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(template.category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {template.duration.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Euro className="mr-1 h-3 w-3" />
                      {template.basePrice}
                    </div>
                  </TableCell>
                  <TableCell>
                    {template.specialty ? (
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: template.specialty.color + '20',
                          borderColor: template.specialty.color,
                          color: template.specialty.color 
                        }}
                      >
                        {template.specialty.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Sin especialidad</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getModalityBadge(template.modality)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {template._count.professionals}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Activa" : "Inactiva"}
                    </Badge>
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
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
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
