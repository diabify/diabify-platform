import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/professionals/[id] - Obtener profesional específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        },
        specialties: true,
        sessions: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            client: {
              select: {
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          },
          take: 5 // Últimas 5 sesiones completadas
        },
        _count: {
          select: {
            sessions: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas adicionales
    const completedSessions = professional._count.sessions;
    const totalRatings = await prisma.session.count({
      where: {
        professionalId: id,
        status: 'COMPLETED'
        // Aquí podrías agregar un campo de rating en las sesiones
      }
    });

    const stats = {
      completedSessions,
      totalRatings,
      memberSince: professional.user.createdAt,
      responseTime: '< 2 horas', // Esto podría calcularse de datos reales
      availability: professional.availability || {}
    };

    return NextResponse.json({
      professional: {
        ...professional,
        stats
      }
    });

  } catch (error) {
    console.error('❌ Error fetching professional:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesional' },
      { status: 500 }
    );
  }
}

// PUT /api/professionals/[id] - Actualizar profesional
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const {
      description,
      experience,
      hourlyRate,
      availability,
      specialties
    } = data;

    // Verificar que el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id },
      include: { specialties: true }
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
    if (availability !== undefined) updateData.availability = availability;

    // Actualizar profesional
    const updatedProfessional = await prisma.professional.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        specialties: true
      }
    });

    // Actualizar especialidades si se proporcionaron
    if (specialties && Array.isArray(specialties)) {
      // Eliminar especialidades existentes
      await prisma.professionalSpecialty.deleteMany({
        where: { professionalId: id }
      });

      // Crear nuevas especialidades
      if (specialties.length > 0) {
        await prisma.professionalSpecialty.createMany({
          data: specialties.map((specialty: any) => ({
            professionalId: id,
            diabetesType: specialty.diabetesType,
            description: specialty.description
          }))
        });
      }

      // Obtener especialidades actualizadas
      const updatedSpecialties = await prisma.professionalSpecialty.findMany({
        where: { professionalId: id }
      });

      updatedProfessional.specialties = updatedSpecialties;
    }

    console.log('✅ Professional updated:', id);

    return NextResponse.json({
      professional: updatedProfessional,
      message: 'Profesional actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error updating professional:', error);
    return NextResponse.json(
      { error: 'Error al actualizar profesional' },
      { status: 500 }
    );
  }
}

// DELETE /api/professionals/[id] - Eliminar profesional
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    // Verificar que el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id }
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no tenga sesiones pendientes
    const pendingSessions = await prisma.session.count({
      where: {
        professionalId: id,
        status: 'SCHEDULED'
      }
    });

    if (pendingSessions > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un profesional con sesiones pendientes' },
        { status: 400 }
      );
    }

    // Eliminar profesional (las especialidades se eliminan automáticamente por la relación)
    await prisma.professional.delete({
      where: { id }
    });

    // Actualizar el rol del usuario de vuelta a USER
    await prisma.user.update({
      where: { id: existingProfessional.userId },
      data: { role: 'USER' }
    });

    console.log('✅ Professional deleted:', id);

    return NextResponse.json({
      message: 'Profesional eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error deleting professional:', error);
    return NextResponse.json(
      { error: 'Error al eliminar profesional' },
      { status: 500 }
    );
  }
}
