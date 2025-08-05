'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, Shield, Users, Clock, Star } from 'lucide-react';

interface Professional {
  id: string;
  type: string;
  description: string;
  experience: number;
  rating: number;
  hourlyRate: number;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  specialties: Array<{
    id: string;
    diabetesType: string;
    description: string;
  }>;
  _count: {
    sessions: number;
  };
}

const AdminDashboard = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    averageRating: 0
  });
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Simular admin ID para testing (en producción vendría de la sesión)
  const ADMIN_ID = 'admin-test-id';

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/professionals');
      const data = await response.json();
      
      setProfessionals(data.professionals);
      setStats({
        total: data.stats.total,
        verified: data.stats.verified,
        pending: data.stats.total - data.stats.verified,
        averageRating: data.stats.averageRating
      });
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (professionalId: string, verified: boolean) => {
    try {
      setIsVerifying(true);
      
      const response = await fetch(`/api/professionals/${professionalId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': ADMIN_ID // Simular header de admin
        },
        body: JSON.stringify({
          verified,
          verificationNotes
        })
      });

      if (response.ok) {
        // Actualizar la lista
        await fetchProfessionals();
        setSelectedProfessional(null);
        setVerificationNotes('');
        alert(`Profesional ${verified ? 'verificado' : 'desverificado'} exitosamente`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error verifying professional:', error);
      alert('Error al procesar la verificación');
    } finally {
      setIsVerifying(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'MEDICO': '👨‍⚕️',
      'NUTRICIONISTA': '🥗',
      'DIETISTA': '🍎',
      'EDUCADOR': '👩‍🏫',
      'ENTRENADOR': '💪',
      'PSICOLOGO': '🧠'
    };
    return icons[type] || '👤';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">Gestión de profesionales - Diabify 2.0</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              {stats.total} Profesionales
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profesionales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verificados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Profesionales */}
        <Card>
          <CardHeader>
            <CardTitle>Profesionales Registrados</CardTitle>
            <CardDescription>Gestiona la verificación y estado de los profesionales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {professionals.map((professional) => (
                <div key={professional.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={professional.user.avatar || ''} />
                      <AvatarFallback>
                        {getTypeIcon(professional.type)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{professional.user.name}</h3>
                        {professional.verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{professional.user.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{professional.type}</span>
                        <span className="text-sm text-gray-500">{professional.experience} años exp.</span>
                        <span className="text-sm text-gray-500">⭐ {professional.rating}</span>
                        <span className="text-sm text-gray-500">{professional._count.sessions} sesiones</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProfessional(professional)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles del Profesional</DialogTitle>
                          <DialogDescription>
                            Información completa y opciones de verificación
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedProfessional && (
                          <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedProfessional.user.avatar || ''} />
                                <AvatarFallback className="text-2xl">
                                  {getTypeIcon(selectedProfessional.type)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-semibold">{selectedProfessional.user.name}</h3>
                                <p className="text-gray-600">{selectedProfessional.user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{selectedProfessional.type}</Badge>
                                  {selectedProfessional.verified && (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      ✓ Verificado
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Descripción</h4>
                              <p className="text-gray-700">{selectedProfessional.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Experiencia</h4>
                                <p>{selectedProfessional.experience} años</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Tarifa</h4>
                                <p>€{selectedProfessional.hourlyRate}/hora</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Especialidades</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProfessional.specialties.map((specialty) => (
                                  <Badge key={specialty.id} variant="outline">
                                    {specialty.diabetesType}: {specialty.description}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="verificationNotes">Notas de Verificación</Label>
                              <Input
                                id="verificationNotes"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                placeholder="Agregar notas sobre la verificación..."
                                className="mt-1"
                              />
                            </div>

                            <div className="flex gap-2">
                              {!selectedProfessional.verified ? (
                                <Button
                                  onClick={() => handleVerification(selectedProfessional.id, true)}
                                  disabled={isVerifying}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isVerifying ? 'Verificando...' : 'Verificar Profesional'}
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleVerification(selectedProfessional.id, false)}
                                  disabled={isVerifying}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {isVerifying ? 'Procesando...' : 'Remover Verificación'}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
