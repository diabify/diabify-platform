import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Generador de enlaces de reunión
// En producción, integrarías con Zoom, Google Meet, Jitsi, etc.

function generateMeetingRoom(sessionId: string): string {
  // Para desarrollo, creamos un enlace a Jitsi Meet
  const roomName = `diabify-session-${sessionId}`;
  return `https://meet.jit.si/${roomName}`;
}

function generateMeetingPassword(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// POST /api/video/create-room - Crear sala de videoconferencia
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requerido' },
        { status: 400 }
      );
    }

    // Verificar que la sesión existe
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

    // Verificar autorización (cliente o profesional de la sesión)
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

    // Verificar que la sesión sea online (cuando tengamos modalidad en el modelo)
    // TODO: Verificar modalidad cuando esté disponible

    // Generar enlace de reunión si no existe
    let meetingUrl = session.meetingUrl;
    
    if (!meetingUrl) {
      meetingUrl = generateMeetingRoom(sessionId);
      
      // Actualizar la sesión con el enlace
      await prisma.session.update({
        where: { id: sessionId },
        data: { meetingUrl }
      });
    }

    console.log('✅ Video room created/retrieved:', sessionId);

    return NextResponse.json({
      meetingUrl,
      sessionId,
      sessionTitle: session.title,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      participants: {
        client: {
          name: session.client.name,
          email: session.client.email
        },
        professional: {
          name: session.professional.user.name,
          email: session.professional.user.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating video room:', error);
    return NextResponse.json(
      { error: 'Error al crear sala de video' },
      { status: 500 }
    );
  }
}
