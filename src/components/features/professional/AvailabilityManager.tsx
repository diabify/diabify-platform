'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Check 
} from 'lucide-react';

interface TimeRange {
  start: string;
  end: string;
}

interface DayAvailability {
  available: boolean;
  hours: string[]; // Array de rangos como ["09:00-12:00", "14:00-18:00"]
}

interface WeekAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

interface AvailabilityManagerProps {
  professionalId: string;
  initialAvailability?: WeekAvailability;
  onSave?: (availability: WeekAvailability) => void;
  className?: string;
}

export default function AvailabilityManager({
  professionalId,
  initialAvailability,
  onSave,
  className = ''
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<WeekAvailability>({
    monday: { available: false, hours: [] },
    tuesday: { available: false, hours: [] },
    wednesday: { available: false, hours: [] },
    thursday: { available: false, hours: [] },
    friday: { available: false, hours: [] },
    saturday: { available: false, hours: [] },
    sunday: { available: false, hours: [] }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability);
    } else {
      fetchAvailability();
    }
  }, [initialAvailability, professionalId]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/professionals/${professionalId}/availability-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.availability) {
          setAvailability(data.availability);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const toggleDayAvailability = (day: keyof WeekAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        hours: !prev[day].available ? ['09:00-17:00'] : []
      }
    }));
    setSaved(false);
  };

  const addTimeRange = (day: keyof WeekAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: [...prev[day].hours, '09:00-17:00']
      }
    }));
    setSaved(false);
  };

  const removeTimeRange = (day: keyof WeekAvailability, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: prev[day].hours.filter((_, i) => i !== index)
      }
    }));
    setSaved(false);
  };

  const updateTimeRange = (day: keyof WeekAvailability, index: number, newRange: string) => {
    if (!isValidTimeRange(newRange)) return;

    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: prev[day].hours.map((range, i) => i === index ? newRange : range)
      }
    }));
    setSaved(false);
  };

  const isValidTimeRange = (range: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(range)) return false;

    const [start, end] = range.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes;
  };

  const copyToAllDays = (sourceDay: keyof WeekAvailability) => {
    const sourceDayData = availability[sourceDay];
    const updatedAvailability = { ...availability };
    
    Object.keys(dayLabels).forEach(day => {
      if (day !== sourceDay) {
        updatedAvailability[day as keyof WeekAvailability] = {
          available: sourceDayData.available,
          hours: [...sourceDayData.hours]
        };
      }
    });

    setAvailability(updatedAvailability);
    setSaved(false);
  };

  const setQuickSchedule = (schedule: 'business' | 'extended' | 'weekend') => {
    let newAvailability = { ...availability };

    switch (schedule) {
      case 'business':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newAvailability[day as keyof WeekAvailability] = {
            available: true,
            hours: ['09:00-17:00']
          };
        });
        ['saturday', 'sunday'].forEach(day => {
          newAvailability[day as keyof WeekAvailability] = {
            available: false,
            hours: []
          };
        });
        break;
      
      case 'extended':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newAvailability[day as keyof WeekAvailability] = {
            available: true,
            hours: ['08:00-12:00', '14:00-20:00']
          };
        });
        newAvailability.saturday = { available: true, hours: ['09:00-14:00'] };
        newAvailability.sunday = { available: false, hours: [] };
        break;
      
      case 'weekend':
        ['saturday', 'sunday'].forEach(day => {
          newAvailability[day as keyof WeekAvailability] = {
            available: true,
            hours: ['10:00-18:00']
          };
        });
        break;
    }

    setAvailability(newAvailability);
    setSaved(false);
  };

  const saveAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/professionals/${professionalId}/availability-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar auth header
        },
        body: JSON.stringify({ availability })
      });

      if (response.ok) {
        setSaved(true);
        onSave?.(availability);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('Error saving availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalHours = () => {
    let total = 0;
    Object.values(availability).forEach(day => {
      if (day.available) {
        day.hours.forEach(range => {
          const [start, end] = range.split('-');
          const [startHour, startMin] = start.split(':').map(Number);
          const [endHour, endMin] = end.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          total += (endMinutes - startMinutes) / 60;
        });
      }
    });
    return total;
  };

  const getAvailableDays = () => {
    return Object.values(availability).filter(day => day.available).length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Gestión de Disponibilidad</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {saved && (
              <Badge className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Guardado
              </Badge>
            )}
            <Button onClick={saveAvailability} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{getAvailableDays()} días disponibles</span>
          <span>•</span>
          <span>{getTotalHours()} horas semanales</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plantillas rápidas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Plantillas rápidas</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule('business')}>
              Horario Comercial (L-V 9-17h)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule('extended')}>
              Horario Extendido (L-S)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule('weekend')}>
              Solo Fines de Semana
            </Button>
          </div>
        </div>

        {/* Configuración por días */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Disponibilidad por días</Label>
          
          {Object.entries(dayLabels).map(([day, label]) => {
            const dayKey = day as keyof WeekAvailability;
            const dayData = availability[dayKey];
            
            return (
              <div key={day} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={dayData.available}
                      onCheckedChange={() => toggleDayAvailability(dayKey)}
                    />
                    <Label className="font-medium">{label}</Label>
                    {dayData.available && (
                      <Badge variant="outline" className="text-xs">
                        {dayData.hours.length} rango{dayData.hours.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {dayData.available && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeRange(dayKey)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir horario
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToAllDays(dayKey)}
                      >
                        Copiar a todos
                      </Button>
                    </div>
                  )}
                </div>

                {dayData.available && dayData.hours.length > 0 && (
                  <div className="space-y-2 ml-6">
                    {dayData.hours.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <Input
                          value={range}
                          onChange={(e) => updateTimeRange(dayKey, index, e.target.value)}
                          placeholder="09:00-17:00"
                          className="w-32"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeRange(dayKey, index)}
                          disabled={dayData.hours.length === 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {!isValidTimeRange(range) && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Información importante:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Los horarios se dividen automáticamente en citas de 30 minutos</li>
                <li>• Los clientes podrán reservar solo en estos horarios disponibles</li>
                <li>• Puedes tener múltiples rangos horarios por día (ej: mañana y tarde)</li>
                <li>• El formato debe ser HH:MM-HH:MM (ejemplo: 09:00-17:00)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
