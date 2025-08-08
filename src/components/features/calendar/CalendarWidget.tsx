'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  MapPin
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  modality: 'ONLINE' | 'PRESENCIAL';
  client: {
    name: string;
    avatar?: string;
  };
  professional?: {
    name: string;
  };
}

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  viewMode?: 'month' | 'week' | 'day';
  className?: string;
}

export default function CalendarWidget({
  events = [],
  onEventClick,
  onDateClick,
  viewMode = 'month',
  className = ''
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(viewMode);

  // Obtener el primer día del mes
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo

  // Generar días del calendario
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDayOfMonth);
      day.setDate(day.getDate() - i - 1);
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: day.toDateString() === today.toDateString(),
        events: getEventsForDate(day)
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        events: getEventsForDate(date)
      });
    }

    // Días del próximo mes (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        events: getEventsForDate(date)
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const calendarDays = generateCalendarDays();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Calendario de Citas</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header de días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[80px] p-1 border rounded cursor-pointer hover:bg-gray-50 transition-colors
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => onDateClick?.(day.date)}
            >
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${day.isToday ? 'text-blue-600 font-bold' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              {/* Eventos del día */}
              <div className="space-y-1">
                {day.events.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded text-white cursor-pointer hover:opacity-80
                      ${getStatusColor(event.status)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      {event.modality === 'ONLINE' ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      <span className="truncate">
                        {formatTime(event.scheduledAt)}
                      </span>
                    </div>
                    <div className="truncate font-medium">
                      {event.title}
                    </div>
                    <div className="truncate">
                      {event.client.name}
                    </div>
                  </div>
                ))}
                
                {day.events.length > 2 && (
                  <div className="text-xs text-gray-500 p-1">
                    +{day.events.length - 2} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Programada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Completada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Cancelada</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="h-3 w-3 text-gray-600" />
            <span className="text-xs text-gray-600">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 text-gray-600" />
            <span className="text-xs text-gray-600">Presencial</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
