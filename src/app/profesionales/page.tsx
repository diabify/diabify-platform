'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Professional {
  id: string;
  type: string;
  description?: string;
  experience?: number;
  rating?: number;
  hourlyRate?: number;
  verified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  specialties: Array<{
    id: string;
    diabetesType: string;
    description?: string;
  }>;
  _count: {
    sessions: number;
  };
}

interface ProfessionalsResponse {
  professionals: Professional[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    total: number;
    verified: number;
    averageRating: number;
  };
}

export default function ProfesionalesPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, verified: 0, averageRating: 0 });
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    diabetesType: '',
    verified: '',
    minRating: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchProfessionals();
  }, [currentPage, filters]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      // Agregar filtros no vacíos
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          params.append(key, value);
        }
      });

      console.log('🔄 Fetching professionals with params:', params.toString());

      const response = await fetch(`/api/professionals?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProfessionalsResponse = await response.json();
      
      setProfessionals(data.professionals);
      setTotalPages(data.pagination.totalPages);
      setStats(data.stats);
      
      console.log('✅ Professionals loaded:', data.professionals.length);

    } catch (err) {
      console.error('❌ Error fetching professionals:', err);
      setError('Error al cargar profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      diabetesType: '',
      verified: '',
      minRating: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };

  const getProfessionalTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'DIETISTA': 'Dietista',
      'NUTRICIONISTA': 'Nutricionista',
      'EDUCADOR': 'Educador en Diabetes',
      'ENTRENADOR': 'Entrenador Personal',
      'PSICOLOGO': 'Psicólogo',
      'MEDICO': 'Médico'
    };
    return labels[type] || type;
  };

  const getDiabetesTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'TYPE_1': 'Diabetes Tipo 1',
      'TYPE_2': 'Diabetes Tipo 2',
      'GESTATIONAL': 'Diabetes Gestacional',
      'PREDIABETES': 'Prediabetes',
      'INFANTIL': 'Diabetes Infantil'
    };
    return labels[type] || type;
  };

  if (loading && professionals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando profesionales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProfessionals}>
            🔄 Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Profesionales Especializados
            </h1>
            <p className="mt-2 text-gray-600">
              Conecta con profesionales verificados especializados en diabetes y nutrición
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profesionales
              </CardTitle>
              <div className="text-2xl">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verificados
              </CardTitle>
              <div className="text-2xl">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">
                Profesionales verificados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rating Promedio
              </CardTitle>
              <div className="text-2xl">⭐</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Valoración general
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🔍 Filtrar Profesionales
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar</label>
                <Input
                  placeholder="Nombre o descripción..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="DIETISTA">Dietista</option>
                  <option value="NUTRICIONISTA">Nutricionista</option>
                  <option value="EDUCADOR">Educador en Diabetes</option>
                  <option value="ENTRENADOR">Entrenador Personal</option>
                  <option value="PSICOLOGO">Psicólogo</option>
                  <option value="MEDICO">Médico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Especialidad</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.diabetesType}
                  onChange={(e) => handleFilterChange('diabetesType', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="TYPE_1">Diabetes Tipo 1</option>
                  <option value="TYPE_2">Diabetes Tipo 2</option>
                  <option value="GESTATIONAL">Diabetes Gestacional</option>
                  <option value="PREDIABETES">Prediabetes</option>
                  <option value="INFANTIL">Diabetes Infantil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Solo verificados</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Solo verificados</option>
                  <option value="false">No verificados</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating mínimo</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3.0">3.0+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Precio máximo (€/hora)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Profesionales */}
        {professionals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron profesionales
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros o buscar términos diferentes
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {professionals.map((professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {professional.user.avatar ? (
                            <img 
                              src={professional.user.avatar} 
                              alt={professional.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold">
                              {professional.user.name?.charAt(0) || 'P'}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {professional.user.name || 'Profesional'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getProfessionalTypeLabel(professional.type)}
                          </p>
                        </div>
                      </div>
                      {professional.verified && (
                        <Badge className="bg-green-100 text-green-800">
                          ✅ Verificado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {professional.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {professional.description}
                        </p>
                      )}
                      
                      {professional.specialties.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Especialidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {professional.specialties.map((specialty) => (
                              <Badge key={specialty.id} variant="secondary" className="text-xs">
                                {getDiabetesTypeLabel(specialty.diabetesType)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {professional.rating && (
                            <span className="flex items-center">
                              ⭐ {professional.rating.toFixed(1)}
                            </span>
                          )}
                          {professional.experience && (
                            <span className="text-gray-600">
                              {professional.experience} años
                            </span>
                          )}
                        </div>
                        {professional.hourlyRate && (
                          <span className="font-semibold text-green-600">
                            €{professional.hourlyRate}/hora
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {professional._count.sessions} sesiones completadas
                      </div>
                      
                      <Button className="w-full mt-3">
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </Button>
                
                <span className="px-3 py-2 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}

        {/* Información adicional */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">🏥 Sistema de Profesionales</h3>
          <p className="text-blue-800 text-sm mb-3">
            Plataforma completa para conectar con profesionales especializados en diabetes. 
            Incluye sistema de filtros, verificación, y próximamente sistema de citas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-1">✅ Funcionalidades implementadas:</h4>
              <ul className="space-y-1 text-xs">
                <li>• API completa de profesionales</li>
                <li>• Sistema de filtros avanzado</li>
                <li>• Perfiles detallados</li>
                <li>• Sistema de verificación</li>
                <li>• Especialidades por tipo de diabetes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">🔄 En desarrollo:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Sistema de citas</li>
                <li>• Pagos integrados</li>
                <li>• Chat profesional-paciente</li>
                <li>• Calendario de disponibilidad</li>
                <li>• Sistema de reseñas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
