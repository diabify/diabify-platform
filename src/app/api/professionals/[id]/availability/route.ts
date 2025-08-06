import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/professionals/[id]/availability - Obtener horarios disponibles
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: professionalId } = params;
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date'); // YYYY-MM-DD
    const days = parseInt(searchParams.get('days') || '7'); // Número de días hacia adelante
    
    // Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    if (!professional.verified) {
      return NextResponse.json(
        { error: 'Profesional no verificado' },
        { status: 400 }
      );
    }

    // Fecha de inicio (hoy o fecha especificada)
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Fecha de fin
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    // Obtener citas existentes en el rango de fechas
    const existingAppointments = await prisma.session.findMany({
      where: {
        professionalId,
        scheduledAt: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['SCHEDULED'] }
      },
      select: {
        scheduledAt: true,
        duration: true
      }
    });

    // Obtener la disponibilidad del profesional (del JSON)
    const availability = professional.availability as any || {};
    
    // Generar slots disponibles
    const availableSlots = generateTimeSlots(
      startDate,
      endDate,
      availability,
      existingAppointments
    );

    return NextResponse.json({
      professional: {
        id: professional.id,
        name: professional.user.name,
        verified: professional.verified
      },
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      availability: availableSlots,
      existingAppointments: existingAppointments.map(apt => ({
        scheduledAt: apt.scheduledAt,
        duration: apt.duration
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    );
  }
}

// Función auxiliar para generar slots de tiempo disponibles
function generateTimeSlots(
  startDate: Date,
  endDate: Date,
  availability: any,
  existingAppointments: any[]
) {
  const slots: any[] = [];
  const current = new Date(startDate);

  // Mapeo de días de la semana
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  while (current < endDate) {
    const dayName = dayNames[current.getDay()];
    const dayAvailability = availability[dayName];

    if (dayAvailability && dayAvailability.available && dayAvailability.hours) {
      const daySlots = [];

      // Procesar cada rango horario del día
      for (const timeRange of dayAvailability.hours) {
        const [startTime, endTime] = timeRange.split('-');
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        // Generar slots de 30 minutos en el rango
        for (let hour = startHour; hour < endHour || (hour === endHour && startMin < endMin); hour++) {
          for (let min = 0; min < 60; min += 30) {
            // Skip si es la última hora y pasamos el minuto final
            if (hour === endHour && min >= endMin) break;
            
            const slotStart = new Date(current);
            slotStart.setHours(hour, min, 0, 0);
            
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);

            // Verificar que el slot no está en el pasado
            if (slotStart <= new Date()) continue;

            // Verificar que no hay conflicto con citas existentes
            const hasConflict = existingAppointments.some(apt => {
              const aptStart = new Date(apt.scheduledAt);
              const aptEnd = new Date(aptStart);
              aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

              return (
                (slotStart >= aptStart && slotStart < aptEnd) ||
                (slotEnd > aptStart && slotEnd <= aptEnd) ||
                (slotStart <= aptStart && slotEnd >= aptEnd)
              );
            });

            if (!hasConflict) {
              daySlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                duration: 30 // minutos
              });
            }
          }
        }
      }

      if (daySlots.length > 0) {
        slots.push({
          date: current.toISOString().split('T')[0],
          dayName: dayName,
          available: true,
          slots: daySlots
        });
      }
    } else {
      // Día no disponible
      slots.push({
        date: current.toISOString().split('T')[0],
        dayName: dayName,
        available: false,
        slots: []
      });
    }

    // Siguiente día
    current.setDate(current.getDate() + 1);
  }

  return slots;
}
