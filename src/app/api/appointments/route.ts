import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendAppointmentConfirmation } from '@/lib/email';

// GET /api/appointments - Obtener citas con filtros
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtrado
    let clientId = searchParams.get('clientId');
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status') as any;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Si no es admin, solo puede ver sus propias citas
    if (currentUser.role !== 'ADMIN') {
      if (currentUser.role === 'PROFESSIONAL') {
        // Los profesionales ven citas donde son el profesional
        const professional = await prisma.professional.findFirst({
          where: { userId: currentUser.id }
        });
        if (!professional) {
          return NextResponse.json({ appointments: [], pagination: {}, stats: {} });
        }
        // Override para mostrar solo citas del profesional
        if (!professionalId) {
          // Si no se especifica professionalId, usar el del usuario actual
          const whereClause: any = { professionalId: professional.id };
          if (status) whereClause.status = status;
          if (dateFrom || dateTo) {
            whereClause.scheduledAt = {};
            if (dateFrom) whereClause.scheduledAt.gte = new Date(dateFrom);
            if (dateTo) whereClause.scheduledAt.lte = new Date(dateTo);
          }
        }
      } else {
        // Los usuarios normales solo ven sus propias citas como cliente
        clientId = currentUser.id;
      }
    }
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtros
    const whereClause: any = {};
    
    if (clientId) whereClause.clientId = clientId;
    if (professionalId) whereClause.professionalId = professionalId;
    if (status) whereClause.status = status;
    
    if (dateFrom || dateTo) {
      whereClause.scheduledAt = {};
      if (dateFrom) whereClause.scheduledAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.scheduledAt.lte = new Date(dateTo);
    }

    // Obtener citas con relaciones
    const [appointments, total] = await Promise.all([
      prisma.session.findMany({
        where: whereClause,
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
          sessionTemplate: {
            include: {
              specialty: true
            }
          },
          payment: true
        },
        orderBy: [
          { scheduledAt: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.session.count({ where: whereClause })
    ]);

    // Calcular estadísticas
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      appointments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      stats: {
        total,
        scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    let {
      clientId,
      professionalId,
      sessionTemplateId,
      scheduledAt,
      notes
    } = data;

    // Si no es admin, usar el ID del usuario actual como clientId
    if (currentUser.role !== 'ADMIN') {
      clientId = currentUser.id;
    }

    // Validaciones básicas
    if (!clientId || !professionalId || !sessionTemplateId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar presentes' },
        { status: 400 }
      );
    }

    // Verificar que el profesional existe y está verificado
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: { name: true, email: true }
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
        { error: 'El profesional no está verificado' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la plantilla de sesión existe y está asignada al profesional
    const professionalTemplate = await prisma.professionalSessionTemplate.findFirst({
      where: {
        professionalId,
        sessionTemplateId,
        isEnabled: true
      },
      include: {
        sessionTemplate: {
          include: {
            duration: true,
            specialty: true
          }
        }
      }
    });

    if (!professionalTemplate) {
      return NextResponse.json(
        { error: 'El profesional no ofrece este tipo de sesión' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad del horario
    const appointmentDate = new Date(scheduledAt);
    const existingAppointment = await prisma.session.findFirst({
      where: {
        professionalId,
        scheduledAt: appointmentDate,
        status: { in: ['SCHEDULED'] }
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'El horario ya está ocupado' },
        { status: 400 }
      );
    }

    // Verificar que el horario no sea en el pasado
    if (appointmentDate <= new Date()) {
      return NextResponse.json(
        { error: 'No se pueden programar citas en el pasado' },
        { status: 400 }
      );
    }

    // Calcular precio final (custom price del profesional o precio base)
    const finalPrice = professionalTemplate.customPrice || professionalTemplate.sessionTemplate.basePrice;

    // Crear la cita
    const appointment = await prisma.session.create({
      data: {
        clientId,
        professionalId,
        sessionTemplateId,
        title: professionalTemplate.sessionTemplate.title,
        description: professionalTemplate.sessionTemplate.description,
        scheduledAt: appointmentDate,
        duration: professionalTemplate.sessionTemplate.duration.minutes,
        finalPrice,
        status: 'SCHEDULED',
        notes
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

    console.log('✅ Appointment created:', appointment.id);

    // Enviar emails de confirmación
    try {
      await sendAppointmentConfirmation({
        appointmentId: appointment.id,
        clientName: appointment.client.name || 'Usuario',
        clientEmail: appointment.client.email,
        professionalName: appointment.professional.user.name || 'Profesional',
        professionalEmail: appointment.professional.user.email,
        serviceTitle: appointment.title,
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration,
        finalPrice: appointment.finalPrice,
        modality: professionalTemplate.sessionTemplate.modality || 'PRESENCIAL',
        notes: appointment.notes || undefined
      });
      console.log('✅ Confirmation emails sent');
    } catch (emailError) {
      console.error('❌ Error sending confirmation emails:', emailError);
      // No fallar la creación de la cita por un error de email
    }

    return NextResponse.json({
      appointment,
      message: 'Cita creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    );
  }
}
