'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar,
  Clock,
  Euro,
  MapPin,
  Star,
  CheckCircle,
  ArrowLeft,
  Video
} from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  avatar: string | null;
  type: string;
  verified: boolean;
  rating: number;
  experience: number;
}

interface Service {
  id: string;
  professionalServiceId: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  finalPrice: number;
  duration: {
    id: string;
    name: string;
    minutes: number;
  };
  specialty: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

interface AvailableDay {
  date: string;
  dayName: string;
  available: boolean;
  slots: TimeSlot[];
}

export default function BookingPage() {
  const params = useParams();
  const professionalId = params.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailableDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: servicio, 2: fecha/hora, 3: confirmación

  // Estados del booking
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (professionalId) {
      fetchProfessionalData();
    }
  }, [professionalId]);

  useEffect(() => {
    if (selectedService && step === 2) {
      fetchAvailability();
    }
  }, [selectedService, step]);

  const fetchProfessionalData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del profesional y sus servicios
      const [profResponse, servicesResponse] = await Promise.all([
        fetch(`/api/professionals/${professionalId}`),
        fetch(`/api/professionals/${professionalId}/services`)
      ]);

      if (profResponse.ok && servicesResponse.ok) {
        const profData = await profResponse.json();
        const servicesData = await servicesResponse.json();

        setProfessional(profData.professional);
        setServices(servicesData.services);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/professionals/${professionalId}/availability?days=14`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setStep(3);
  };

  const createAppointment = async () => {
    if (!selectedService || !selectedSlot || !selectedDate) return;

    try {
      const appointmentData = {
        // No enviamos clientId, la API lo obtiene del usuario autenticado
        professionalId,
        sessionTemplateId: selectedService.id,
        scheduledAt: selectedSlot.start,
        notes
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar header de autenticación cuando esté implementado
          // 'Authorization': `Bearer ${token}`,
          'x-user-id': 'temp-user-id' // Temporal para testing
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('¡Cita creada exitosamente!');
        // TODO: Redirigir a confirmación o dashboard
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    }
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

  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profesional no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={professional.avatar || ''} />
                <AvatarFallback>
                  {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{professional.name}</h1>
                  {professional.verified && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{professional.type}</span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {professional.rating}
                  </span>
                  <span>{professional.experience} años exp.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2">Seleccionar Servicio</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2">Fecha y Hora</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Step 1: Seleccionar Servicio */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Selecciona el tipo de sesión</h2>
            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleServiceSelect(service)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{service.title}</h3>
                          <Badge variant="outline">{service.category}</Badge>
                          {service.specialty && (
                            <Badge style={{ backgroundColor: service.specialty.color || '#gray' }}>
                              {service.specialty.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{service.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration.name}
                          </span>
                          <span className="flex items-center">
                            {service.modality === 'ONLINE' ? (
                              <Video className="h-4 w-4 mr-1" />
                            ) : (
                              <MapPin className="h-4 w-4 mr-1" />
                            )}
                            {service.modality === 'ONLINE' ? 'Online' : 'Presencial'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          €{service.finalPrice}
                        </div>
                        <div className="text-sm text-gray-500">
                          por sesión
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Seleccionar Fecha y Hora */}
        {step === 2 && selectedService && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Selecciona fecha y hora</h2>
              <Button variant="outline" onClick={() => setStep(1)}>
                Cambiar Servicio
              </Button>
            </div>

            {/* Servicio seleccionado */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedService.title}</h3>
                    <p className="text-sm text-gray-600">{selectedService.duration.name} • €{selectedService.finalPrice}</p>
                  </div>
                  <Badge variant="outline">{selectedService.modality === 'ONLINE' ? 'Online' : 'Presencial'}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Calendario */}
            <div className="grid gap-4">
              {availability.map((day) => (
                <Card key={day.date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {formatDate(day.date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {day.available && day.slots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {day.slots.map((slot, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSlotSelect(day.date, slot)}
                            className="text-sm"
                          >
                            {formatTime(slot.start)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay horarios disponibles</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirmación */}
        {step === 3 && selectedService && selectedSlot && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Confirmar reserva</h2>
              <Button variant="outline" onClick={() => setStep(2)}>
                Cambiar Horario
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumen de la cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicio:</span>
                  <span className="font-semibold">{selectedService.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-semibold">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-semibold">{formatTime(selectedSlot.start)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-semibold">{selectedService.duration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modalidad:</span>
                  <span className="font-semibold">{selectedService.modality === 'ONLINE' ? 'Online' : 'Presencial'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">€{selectedService.finalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas adicionales */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Notas adicionales (opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={3}
                  placeholder="¿Hay algo específico que quieras comentar sobre la sesión?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button className="flex-1" size="lg" onClick={createAppointment}>
                Confirmar Reserva
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
