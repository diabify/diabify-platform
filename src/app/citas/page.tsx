'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MessageCircle,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Download
} from 'lucide-react';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  finalPrice: number;
  duration: number; // minutes
  professional: {
    id: string;
    type: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  sessionTemplate: {
    id: string;
    title: string;
    description: string;
    category: string;
    modality: string;
  };
  specialty: {
    id: string;
    name: string;
    color: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800'
};

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió'
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentUser, setCurrentUser] = useState<{id: string; name: string; email: string} | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        console.error('Error fetching current user:', response.status);
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/appointments', {
        headers: {
          // Usar el ID del usuario autenticado dinámicamente
          'x-user-id': currentUser.id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Usar el ID del usuario autenticado dinámicamente
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar la cita');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      await updateAppointmentStatus(appointmentId, 'CANCELLED');
    }
  };

  const joinVideoCall = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/video/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'temp-user-id'
        },
        body: JSON.stringify({ sessionId: appointmentId })
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.meetingUrl, '_blank');
      } else {
        alert('Error al acceder a la videollamada');
      }
    } catch (error) {
      console.error('Error joining video call:', error);
      alert('Error al unirse a la videollamada');
    }
  };

  const downloadCalendarEvent = async (appointmentId: string, format: 'google' | 'ics' = 'google') => {
    if (!currentUser) return;
    
    try {
      const url = `/api/calendar/event/${appointmentId}${format === 'ics' ? '?format=ics' : ''}`;
      
      if (format === 'ics') {
        // Descargar archivo ICS
        const response = await fetch(url, {
          headers: { 'x-user-id': currentUser.id }
        });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `cita-${appointmentId}.ics`;
        a.click();
      } else {
        // Abrir Google Calendar
        const response = await fetch(url, {
          headers: { 'x-user-id': currentUser.id }
        });
        const data = await response.json();
        window.open(data.googleCalendarUrl, '_blank');
      }
    } catch (error) {
      console.error('Error with calendar event:', error);
      alert('Error al gestionar evento de calendario');
    }
  };

  const initiatePayment = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'temp-user-id'
        },
        body: JSON.stringify({ sessionId: appointmentId })
      });

      if (response.ok) {
        const data = await response.json();
        // En producción, aquí integrarías con Stripe Elements
        alert(`Pago iniciado. ID: ${data.paymentIntent.id}\nMonto: €${data.paymentIntent.amount}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error al iniciar el pago');
    }
  };

  const rescheduleAppointment = (appointmentId: string) => {
    // TODO: Implementar modal de reprogramación
    alert('Función de reprogramación en desarrollo');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.scheduledAt);
    const now = new Date();
    return appointmentDate > now && ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(appointment.status);
  };

  const isPast = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.scheduledAt);
    const now = new Date();
    return appointmentDate <= now || ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status);
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter(isPast);

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.professional.user?.avatar || ''} />
              <AvatarFallback>
                {appointment.professional.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg">{appointment.sessionTemplate.title}</h3>
                <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                  {statusLabels[appointment.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-2">
                con {appointment.professional.user?.name || 'Profesional'} • {appointment.professional.type}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(appointment.scheduledAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(appointment.scheduledAt)} ({appointment.duration} min)
                </div>
                <div className="flex items-center">
                  {appointment.sessionTemplate.modality === 'ONLINE' ? (
                    <Video className="h-4 w-4 mr-2" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {appointment.sessionTemplate.modality === 'ONLINE' ? 'Sesión Online' : 'Presencial'}
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-semibold">
                    €{appointment.finalPrice}
                  </span>
                </div>
              </div>

              {appointment.specialty && (
                <Badge 
                  className="mb-3"
                  style={{ backgroundColor: appointment.specialty.color || '#gray' }}
                >
                  {appointment.specialty.name}
                </Badge>
              )}

              {appointment.notes && (
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>Notas:</strong> {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            {/* Botones según el estado */}
            {appointment.status === 'PENDING' && (
              <>
                <Button 
                  size="sm"
                  onClick={() => initiatePayment(appointment.id)}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Pagar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadCalendarEvent(appointment.id, 'ics')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  .ics
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => rescheduleAppointment(appointment.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reprogramar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => cancelAppointment(appointment.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}

            {appointment.status === 'CONFIRMED' && isUpcoming(appointment) && (
              <>
                {appointment.sessionTemplate.modality === 'ONLINE' && (
                  <Button 
                    size="sm"
                    onClick={() => joinVideoCall(appointment.id)}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Unirse
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadCalendarEvent(appointment.id, 'google')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendario
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => rescheduleAppointment(appointment.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reprogramar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => cancelAppointment(appointment.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}

            {appointment.status === 'COMPLETED' && (
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Comentar
              </Button>
            )}

            {appointment.sessionTemplate.modality === 'ONLINE' && ['CONFIRMED', 'IN_PROGRESS'].includes(appointment.status) && (
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-1" />
                Contactar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Citas</h1>
          <p className="text-gray-600">Gestiona tus sesiones y consultas médicas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximas</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pastAppointments.filter(a => a.status === 'COMPLETED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'PENDING').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              Próximas Citas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Historial ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tienes citas próximas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Reserva una consulta con nuestros profesionales
                  </p>
                  <Button>
                    Buscar Profesionales
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay citas en el historial
                  </h3>
                  <p className="text-gray-600">
                    Aquí aparecerán tus citas completadas y pasadas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
