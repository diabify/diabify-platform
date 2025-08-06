import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentCancellation } from '@/lib/email';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/appointments/[id] - Obtener cita específica
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    const appointment = await prisma.session.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        payment: true
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Error al obtener la cita' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Actualizar cita
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const {
      scheduledAt,
      status,
      notes,
      meetingUrl,
      recordingUrl
    } = data;

    // Verificar que la cita existe
    const existingAppointment = await prisma.session.findUnique({
      where: { id },
      include: {
        professional: true,
        client: {
          select: { name: true, email: true }
        }
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (scheduledAt !== undefined) {
      const newDate = new Date(scheduledAt);
      
      // Verificar que no sea en el pasado
      if (newDate <= new Date()) {
        return NextResponse.json(
          { error: 'No se puede reprogramar para el pasado' },
          { status: 400 }
        );
      }

      // Verificar disponibilidad del nuevo horario
      const conflictingAppointment = await prisma.session.findFirst({
        where: {
          professionalId: existingAppointment.professionalId,
          scheduledAt: newDate,
          status: { in: ['SCHEDULED'] },
          id: { not: id } // Excluir la cita actual
        }
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'El nuevo horario ya está ocupado' },
          { status: 400 }
        );
      }

      updateData.scheduledAt = newDate;
    }

    if (status !== undefined) {
      // Validar transiciones de estado válidas
      const validTransitions: Record<string, string[]> = {
        'SCHEDULED': ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
        'COMPLETED': [], // No se puede cambiar desde completada
        'CANCELLED': ['SCHEDULED'], // Solo se puede reactivar
        'NO_SHOW': ['SCHEDULED'] // Solo se puede reactivar
      };

      const currentStatus = existingAppointment.status;
      const allowedStatuses = validTransitions[currentStatus] || [];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: `No se puede cambiar de ${currentStatus} a ${status}` },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    if (notes !== undefined) updateData.notes = notes;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;

    // Actualizar la cita
    const updatedAppointment = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        payment: true
      }
    });

    console.log('✅ Appointment updated:', id);

    // Enviar notificaciones por email si hay cambios importantes
    if (status === 'CANCELLED') {
      try {
        await sendAppointmentCancellation({
          appointmentId: updatedAppointment.id,
          clientName: updatedAppointment.client.name || 'Usuario',
          clientEmail: updatedAppointment.client.email,
          professionalName: updatedAppointment.professional.user.name || 'Profesional',
          professionalEmail: updatedAppointment.professional.user.email,
          serviceTitle: updatedAppointment.title,
          scheduledAt: updatedAppointment.scheduledAt,
          duration: updatedAppointment.duration,
          finalPrice: updatedAppointment.finalPrice,
          modality: 'PRESENCIAL', // TODO: Obtener modalidad real
          notes: updatedAppointment.notes || undefined
        });
        console.log('✅ Cancellation emails sent');
      } catch (emailError) {
        console.error('❌ Error sending cancellation emails:', emailError);
      }
    }

    if (scheduledAt) {
      console.log('📅 Appointment rescheduled, should send notification');
      // TODO: Implementar email de reprogramación
    }

    return NextResponse.json({
      appointment: updatedAppointment,
      message: 'Cita actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cita' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Cancelar/Eliminar cita
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Usuario solicitó cancelación';

    // Verificar que la cita existe
    const existingAppointment = await prisma.session.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        client: {
          select: { name: true, email: true }
        },
        payment: true
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // No permitir cancelar citas ya completadas
    if (existingAppointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'No se puede cancelar una cita ya completada' },
        { status: 400 }
      );
    }

    // Verificar si se puede cancelar (ej: no menos de 24h antes)
    const appointmentDate = new Date(existingAppointment.scheduledAt);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24 && existingAppointment.status === 'SCHEDULED') {
      return NextResponse.json(
        { error: 'No se puede cancelar con menos de 24 horas de antelación' },
        { status: 400 }
      );
    }

    // Cancelar la cita
    const cancelledAppointment = await prisma.session.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: existingAppointment.notes 
          ? `${existingAppointment.notes}\n\nCancelada: ${reason}`
          : `Cancelada: ${reason}`
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Appointment cancelled:', id);

    // TODO: Procesar reembolso si hay pago
    if (existingAppointment.payment && existingAppointment.payment.status === 'COMPLETED') {
      console.log('💰 Should process refund for payment:', existingAppointment.payment.id);
    }

    // TODO: Enviar notificaciones de cancelación

    return NextResponse.json({
      appointment: cancelledAppointment,
      message: 'Cita cancelada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la cita' },
      { status: 500 }
    );
  }
}
