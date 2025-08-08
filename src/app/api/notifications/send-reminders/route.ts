import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/email';

// GET /api/notifications/send-reminders - Enviar recordatorios automáticos
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Iniciando proceso de recordatorios automáticos...');

    // Obtener la fecha/hora actual
    const now = new Date();
    
    // Calcular rangos de tiempo para recordatorios
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    // Buscar citas que necesitan recordatorios
    const appointmentsForReminders = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: now,
          lte: in24Hours // Dentro de las próximas 24 horas
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Encontradas ${appointmentsForReminders.length} citas para revisar`);

    let remindersSent = 0;
    const results = [];

    for (const appointment of appointmentsForReminders) {
      const appointmentTime = new Date(appointment.scheduledAt);
      const timeUntilAppointment = appointmentTime.getTime() - now.getTime();
      const hoursUntil = timeUntilAppointment / (1000 * 60 * 60);

      // Determinar tipo de recordatorio
      let reminderType: '24h' | '2h' | '1h' | null = null;

      if (hoursUntil <= 25 && hoursUntil > 23) {
        reminderType = '24h';
      } else if (hoursUntil <= 2.5 && hoursUntil > 1.5) {
        reminderType = '2h';
      } else if (hoursUntil <= 1.2 && hoursUntil > 0.8) {
        reminderType = '1h';
      }

      if (reminderType) {
        try {
          // Para esta versión simplificada, enviamos el recordatorio sin verificar duplicados
          // En producción deberías implementar un sistema para evitar recordatorios duplicados
          
          // Enviar recordatorio por email
          await sendAppointmentReminder({
            appointmentId: appointment.id,
            clientName: appointment.client.name || 'Usuario',
            clientEmail: appointment.client.email,
            professionalName: appointment.professional.user.name || 'Profesional',
            professionalEmail: appointment.professional.user.email,
            serviceTitle: appointment.title,
            scheduledAt: appointment.scheduledAt,
            duration: appointment.duration,
            finalPrice: appointment.finalPrice,
            reminderType,
            timeUntil: `${Math.round(hoursUntil)} hora${Math.round(hoursUntil) !== 1 ? 's' : ''}`
          });

          remindersSent++;
          results.push({
            appointmentId: appointment.id,
            reminderType,
            clientEmail: appointment.client.email,
            professionalEmail: appointment.professional.user.email,
            scheduledAt: appointment.scheduledAt,
            status: 'sent'
          });

          console.log(`✅ Recordatorio ${reminderType} enviado para cita ${appointment.id}`);
          
        } catch (error) {
          console.error(`❌ Error enviando recordatorio para cita ${appointment.id}:`, error);
          results.push({
            appointmentId: appointment.id,
            reminderType,
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }
    }

    console.log(`🎉 Proceso completado: ${remindersSent} recordatorios enviados`);

    return NextResponse.json({
      message: 'Proceso de recordatorios completado',
      summary: {
        totalAppointmentsReviewed: appointmentsForReminders.length,
        remindersSent,
        timestamp: new Date().toISOString()
      },
      results
    });

  } catch (error) {
    console.error('❌ Error en proceso de recordatorios:', error);
    return NextResponse.json(
      { error: 'Error al enviar recordatorios' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/send-reminders - Enviar recordatorio específico
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reminderType } = await request.json();

    if (!appointmentId || !reminderType) {
      return NextResponse.json(
        { error: 'appointmentId y reminderType son requeridos' },
        { status: 400 }
      );
    }

    // Obtener información de la cita
    const appointment = await prisma.session.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    if (appointment.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar recordatorios para citas programadas' },
        { status: 400 }
      );
    }

    // Calcular tiempo hasta la cita
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const timeUntilAppointment = appointmentTime.getTime() - now.getTime();
    const hoursUntil = timeUntilAppointment / (1000 * 60 * 60);

    if (hoursUntil <= 0) {
      return NextResponse.json(
        { error: 'No se pueden enviar recordatorios para citas pasadas' },
        { status: 400 }
      );
    }

    // Enviar recordatorio
    await sendAppointmentReminder({
      appointmentId: appointment.id,
      clientName: appointment.client.name || 'Usuario',
      clientEmail: appointment.client.email,
      professionalName: appointment.professional.user.name || 'Profesional',
      professionalEmail: appointment.professional.user.email,
      serviceTitle: appointment.title,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      finalPrice: appointment.finalPrice,
      reminderType: reminderType as '24h' | '2h' | '1h',
      timeUntil: `${Math.round(hoursUntil)} hora${Math.round(hoursUntil) !== 1 ? 's' : ''}`
    });

    // Registrar notificaciones en la base de datos
    await Promise.all([
      prisma.notification.create({
        data: {
          sessionId: appointment.id,
          userId: appointment.clientId,
          type: `REMINDER_${reminderType.toUpperCase()}`,
          title: `Recordatorio de cita - ${reminderType}`,
          message: `Tu cita con ${appointment.professional.user.name} es en ${Math.round(hoursUntil)} hora${Math.round(hoursUntil) !== 1 ? 's' : ''}`,
          status: 'SENT',
          sentAt: new Date()
        }
      }),
      prisma.notification.create({
        data: {
          sessionId: appointment.id,
          userId: appointment.professional.userId,
          type: `REMINDER_${reminderType.toUpperCase()}_PROFESSIONAL`,
          title: `Recordatorio de cita - ${reminderType}`,
          message: `Tienes una cita con ${appointment.client.name} en ${Math.round(hoursUntil)} hora${Math.round(hoursUntil) !== 1 ? 's' : ''}`,
          status: 'SENT',
          sentAt: new Date()
        }
      })
    ]);

    console.log(`✅ Recordatorio manual ${reminderType} enviado para cita ${appointmentId}`);

    return NextResponse.json({
      message: 'Recordatorio enviado exitosamente',
      appointmentId,
      reminderType,
      sentAt: new Date().toISOString(),
      timeUntilAppointment: `${Math.round(hoursUntil)} hora${Math.round(hoursUntil) !== 1 ? 's' : ''}`,
      notificationsCreated: 2
    });

  } catch (error) {
    console.error('❌ Error enviando recordatorio manual:', error);
    return NextResponse.json(
      { error: 'Error al enviar recordatorio' },
      { status: 500 }
    );
  }
}
