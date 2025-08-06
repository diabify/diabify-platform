import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Funciones para generar eventos de calendario
// En producción, integrarías con Google Calendar API

interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
}

function generateICSContent(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.startTime);
  const endDate = formatDate(event.endTime);
  const uid = `${Date.now()}@diabify.com`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Diabify//Diabify 2.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
${event.location ? `LOCATION:${event.location}` : ''}
${event.attendees.map(email => `ATTENDEE:mailto:${email}`).join('\n')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.startTime);
  const endDate = formatDate(event.endTime);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    ...(event.location && { location: event.location })
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// GET /api/calendar/event/[sessionId] - Generar evento de calendario
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    // Obtener la sesión
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
        professional: {
          include: { user: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Verificar autorización
    const isProfessional = await prisma.professional.findFirst({
      where: { 
        id: session.professionalId,
        userId: currentUser.id 
      }
    });

    if (session.clientId !== currentUser.id && !isProfessional && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Crear evento de calendario
    const endTime = new Date(session.scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + session.duration);

    const calendarEvent: CalendarEvent = {
      title: `${session.title} - Diabify`,
      description: `Sesión médica con ${session.professional.user.name}\n\n` +
                  `Descripción: ${session.description || 'N/A'}\n` +
                  `Duración: ${session.duration} minutos\n` +
                  `Precio: €${session.finalPrice}\n\n` +
                  `${session.meetingUrl ? `Enlace de reunión: ${session.meetingUrl}\n` : ''}` +
                  `${session.notes ? `Notas: ${session.notes}\n` : ''}` +
                  `\nGestionado por Diabify 2.0`,
      startTime: session.scheduledAt,
      endTime,
      attendees: [session.client.email, session.professional.user.email],
      location: session.meetingUrl || 'Consulta presencial'
    };

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'google';

    if (format === 'ics') {
      // Devolver archivo ICS
      const icsContent = generateICSContent(calendarEvent);
      
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="diabify-session-${sessionId}.ics"`
        }
      });
    } else {
      // Devolver URL de Google Calendar
      const googleCalendarUrl = generateGoogleCalendarUrl(calendarEvent);
      
      return NextResponse.json({
        googleCalendarUrl,
        event: calendarEvent
      });
    }

  } catch (error) {
    console.error('❌ Error generating calendar event:', error);
    return NextResponse.json(
      { error: 'Error al generar evento de calendario' },
      { status: 500 }
    );
  }
}
