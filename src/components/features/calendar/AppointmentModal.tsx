'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Mail,
  Euro,
  Edit,
  Trash2,
  VideoIcon,
  CreditCard,
  Download
} from 'lucide-react';

interface AppointmentModalProps {
  appointment: {
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    modality: 'ONLINE' | 'PRESENCIAL';
    finalPrice: number;
    notes?: string;
    client: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    professional: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    sessionTemplate?: {
      category: string;
      description: string;
    };
    payment?: {
      status: string;
      amount: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (appointmentId: string, updates: any) => void;
  onCancel?: (appointmentId: string) => void;
  onStartVideo?: (appointmentId: string) => void;
  onInitiatePayment?: (appointmentId: string) => void;
  currentUserRole?: 'USER' | 'PROFESSIONAL' | 'ADMIN';
}

export default function AppointmentModal({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onCancel,
  onStartVideo,
  onInitiatePayment,
  currentUserRole = 'USER'
}: AppointmentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge className="bg-blue-500">Programada</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completada</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <Badge className="bg-green-500">Pagado</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500">Fallido</Badge>;
      default:
        return <Badge variant="outline">Sin pago</Badge>;
    }
  };

  const canEdit = currentUserRole === 'ADMIN' || 
    (currentUserRole === 'PROFESSIONAL' && appointment.status === 'SCHEDULED');
  
  const canCancel = appointment.status === 'SCHEDULED' && 
    (currentUserRole === 'ADMIN' || currentUserRole === 'USER');
  
  const canStartVideo = appointment.status === 'SCHEDULED' && 
    appointment.modality === 'ONLINE';
  
  const canInitiatePayment = appointment.status === 'SCHEDULED' && 
    (!appointment.payment || appointment.payment.status !== 'SUCCEEDED');

  const handleSaveNotes = async () => {
    if (!onUpdate) return;
    
    setLoading(true);
    try {
      await onUpdate(appointment.id, { notes });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const { date, time } = formatDateTime(appointment.scheduledAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{appointment.title}</span>
            {getStatusBadge(appointment.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{date}</div>
                  <div className="text-sm text-gray-500 capitalize">{date}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{time}</div>
                  <div className="text-sm text-gray-500">{appointment.duration} minutos</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {appointment.modality === 'ONLINE' ? (
                  <Video className="h-4 w-4 text-blue-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <div className="font-medium">
                    {appointment.modality === 'ONLINE' ? 'Videoconferencia' : 'Presencial'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.modality === 'ONLINE' 
                      ? 'Enlace disponible el día de la cita' 
                      : 'En las instalaciones del profesional'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Euro className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium">€{appointment.finalPrice}</div>
                  <div className="text-sm text-gray-500">Precio de la sesión</div>
                </div>
              </div>

              {appointment.payment && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{getPaymentStatusBadge(appointment.payment.status)}</div>
                    <div className="text-sm text-gray-500">Estado del pago</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Participantes</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={appointment.client.avatar} />
                    <AvatarFallback>
                      {appointment.client.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{appointment.client.name}</div>
                    <div className="text-sm text-gray-500">Cliente</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-3 w-3" />
                    <span>{appointment.client.email}</span>
                  </div>
                </div>
              </div>

              {/* Profesional */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={appointment.professional.avatar} />
                    <AvatarFallback>
                      {appointment.professional.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{appointment.professional.name}</div>
                    <div className="text-sm text-gray-500">Profesional</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-3 w-3" />
                    <span>{appointment.professional.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción del servicio */}
          {appointment.sessionTemplate && (
            <div className="space-y-2">
              <h3 className="font-semibold">Descripción del servicio</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">{appointment.sessionTemplate.category}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {appointment.sessionTemplate.description}
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notas</h3>
              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Añadir notas sobre la cita..."
                  className="min-h-[100px]"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveNotes} disabled={loading}>
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setNotes(appointment.notes || '');
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg min-h-[60px]">
                {appointment.notes ? (
                  <p className="text-sm">{appointment.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin notas adicionales</p>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {canStartVideo && (
              <Button onClick={() => onStartVideo?.(appointment.id)}>
                <VideoIcon className="h-4 w-4 mr-2" />
                Iniciar Videollamada
              </Button>
            )}

            {canInitiatePayment && (
              <Button variant="outline" onClick={() => onInitiatePayment?.(appointment.id)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Realizar Pago
              </Button>
            )}

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar ICS
            </Button>

            {canCancel && (
              <Button variant="destructive" onClick={() => onCancel?.(appointment.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar Cita
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
