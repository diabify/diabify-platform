import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/professional-sessions - Obtener asignaciones de sesiones por profesional
export async function GET(request: NextRequest) {
  try {
    // Por ahora sin autenticación para testing
    // const { user, error } = await requireAuth(request, 'ADMIN');
    // if (error || !user) {
    //   return NextResponse.json(
    //     { error: error || 'Acceso denegado' },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');

    if (professionalId) {
      // Obtener asignaciones de un profesional específico
      const assignments = await prisma.professionalSessionTemplate.findMany({
        where: { professionalId },
        include: {
          sessionTemplate: {
            include: {
              duration: true,
              specialty: true
            }
          },
          professional: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ assignments });
    } else {
      // Obtener todas las asignaciones con resumen por profesional
      const assignments = await prisma.professionalSessionTemplate.findMany({
        include: {
          sessionTemplate: {
            include: {
              duration: true,
              specialty: true
            }
          },
          professional: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ assignments });
    }

  } catch (error) {
    console.error('Error fetching professional session assignments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/professional-sessions - Asignar plantilla de sesión a profesional
export async function POST(request: NextRequest) {
  try {
    // Por ahora sin autenticación para testing
    // const { user, error } = await requireAuth(request, 'ADMIN');
    // if (error || !user) {
    //   return NextResponse.json(
    //     { error: error || 'Acceso denegado' },
    //     { status: 403 }
    //   );
    // }

    const { professionalId, sessionTemplateId, customPrice } = await request.json();

    if (!professionalId || !sessionTemplateId) {
      return NextResponse.json(
        { error: 'ID del profesional y ID de la plantilla son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la plantilla existe
    const sessionTemplate = await prisma.sessionTemplate.findUnique({
      where: { id: sessionTemplateId },
      include: { duration: true, specialty: true }
    });

    if (!sessionTemplate) {
      return NextResponse.json(
        { error: 'Plantilla de sesión no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no existe ya la asignación
    const existingAssignment = await prisma.professionalSessionTemplate.findUnique({
      where: {
        professionalId_sessionTemplateId: {
          professionalId,
          sessionTemplateId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'El profesional ya tiene asignada esta plantilla de sesión' },
        { status: 409 }
      );
    }

    // Crear la asignación
    const assignment = await prisma.professionalSessionTemplate.create({
      data: {
        professionalId,
        sessionTemplateId,
        customPrice: customPrice ? parseFloat(customPrice) : null
      },
      include: {
        sessionTemplate: {
          include: {
            duration: true,
            specialty: true
          }
        },
        professional: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Plantilla de sesión asignada exitosamente al profesional',
      assignment
    });

  } catch (error) {
    console.error('Error assigning session template to professional:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/professional-sessions - Actualizar asignación existente
export async function PUT(request: NextRequest) {
  try {
    // Por ahora sin autenticación para testing
    // const { user, error } = await requireAuth(request, 'ADMIN');
    // if (error || !user) {
    //   return NextResponse.json(
    //     { error: error || 'Acceso denegado' },
    //     { status: 403 }
    //   );
    // }

    const { id, customPrice, isEnabled } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la asignación es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la asignación existe
    const existingAssignment = await prisma.professionalSessionTemplate.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (customPrice !== undefined) updateData.customPrice = customPrice ? parseFloat(customPrice) : null;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

    const assignment = await prisma.professionalSessionTemplate.update({
      where: { id },
      data: updateData,
      include: {
        sessionTemplate: {
          include: {
            duration: true,
            specialty: true
          }
        },
        professional: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Asignación actualizada exitosamente',
      assignment
    });

  } catch (error) {
    console.error('Error updating professional session assignment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/professional-sessions - Eliminar asignación
export async function DELETE(request: NextRequest) {
  try {
    // Por ahora sin autenticación para testing
    // const { user, error } = await requireAuth(request, 'ADMIN');
    // if (error || !user) {
    //   return NextResponse.json(
    //     { error: error || 'Acceso denegado' },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la asignación es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la asignación existe
    const existingAssignment = await prisma.professionalSessionTemplate.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    await prisma.professionalSessionTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Asignación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting professional session assignment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
