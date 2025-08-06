'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
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
  Euro, 
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  Settings
} from 'lucide-react';

interface ProfessionalAssignment {
  id: string;
  customPrice: number | null;
  isEnabled: boolean;
  createdAt: string;
  sessionTemplate: {
    id: string;
    title: string;
    basePrice: number;
    category: string;
    duration: {
      name: string;
      minutes: number;
    };
    specialty: {
      name: string;
      color: string;
    } | null;
  };
  professional: {
    id: string;
    type: string;
    rating: number;
    verified: boolean;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function ProfessionalAssignmentsTab() {
  const [assignments, setAssignments] = useState<ProfessionalAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/admin/professional-sessions');
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'MEDICO': 'bg-red-100 text-red-800',
      'NUTRICIONISTA': 'bg-green-100 text-green-800',
      'PSICOLOGO': 'bg-purple-100 text-purple-800',
      'EDUCADOR': 'bg-blue-100 text-blue-800',
      'DIETISTA': 'bg-yellow-100 text-yellow-800',
      'ENTRENADOR': 'bg-orange-100 text-orange-800',
    };

    const labels: Record<string, string> = {
      'MEDICO': 'Médico',
      'NUTRICIONISTA': 'Nutricionista',
      'PSICOLOGO': 'Psicólogo',
      'EDUCADOR': 'Educador',
      'DIETISTA': 'Dietista',
      'ENTRENADOR': 'Entrenador',
    };

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {labels[type] || type}
      </Badge>
    );
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
      <Badge variant="outline" className={variants[category]}>
        {labels[category] || category}
      </Badge>
    );
  };

  const getFinalPrice = (assignment: ProfessionalAssignment) => {
    return assignment.customPrice || assignment.sessionTemplate.basePrice;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">Cargando asignaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Asignaciones de Profesionales</h3>
          <p className="text-sm text-muted-foreground">
            {assignments.length} asignaciones activas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profesional</TableHead>
                <TableHead>Plantilla</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Precio Final</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-gray-500" />
                        </div>
                      </Avatar>
                      <div>
                        <div className="font-medium">{assignment.professional.user.name}</div>
                        <div className="flex items-center space-x-2">
                          {getProfessionalTypeBadge(assignment.professional.type)}
                          {assignment.professional.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.sessionTemplate.title}</div>
                      {assignment.sessionTemplate.specialty && (
                        <Badge 
                          variant="outline" 
                          className="mt-1"
                          style={{ 
                            backgroundColor: assignment.sessionTemplate.specialty.color + '20',
                            borderColor: assignment.sessionTemplate.specialty.color,
                            color: assignment.sessionTemplate.specialty.color 
                          }}
                        >
                          {assignment.sessionTemplate.specialty.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(assignment.sessionTemplate.category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {assignment.sessionTemplate.duration.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Euro className="mr-1 h-3 w-3" />
                      {assignment.sessionTemplate.basePrice}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Euro className="mr-1 h-3 w-3" />
                      <span className={assignment.customPrice ? "font-semibold text-blue-600" : ""}>
                        {getFinalPrice(assignment)}
                      </span>
                      {assignment.customPrice && (
                        <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200">
                          Personalizado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.isEnabled ? "default" : "secondary"}>
                      {assignment.isEnabled ? "Activa" : "Inactiva"}
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
                          <Edit className="mr-2 h-4 w-4" />
                          Editar precio
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          {assignment.isEnabled ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar asignación
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
