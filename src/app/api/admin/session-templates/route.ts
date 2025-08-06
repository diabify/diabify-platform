import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/session-templates - Obtener todas las plantillas de sesión
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

    const templates = await prisma.sessionTemplate.findMany({
      include: {
        duration: true,
        specialty: true,
        _count: {
          select: { 
            professionals: true,
            sessions: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error fetching session templates:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/session-templates - Crear nueva plantilla
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

    const { 
      title, 
      description, 
      basePrice, 
      durationId, 
      specialtyId, 
      category, 
      modality,
      requiresPrereq,
      prerequisiteId
    } = await request.json();

    if (!title || !basePrice || !durationId) {
      return NextResponse.json(
        { error: 'Título, precio base y duración son requeridos' },
        { status: 400 }
      );
    }

    const template = await prisma.sessionTemplate.create({
      data: {
        title,
        description,
        basePrice: parseFloat(basePrice),
        durationId,
        specialtyId: specialtyId || null,
        category: category || 'CONSULTATION',
        modality: modality || 'ONLINE',
        requiresPrereq: requiresPrereq || false,
        prerequisiteId: prerequisiteId || null
      },
      include: {
        duration: true,
        specialty: true
      }
    });

    return NextResponse.json({
      message: 'Plantilla de sesión creada exitosamente',
      template
    });

  } catch (error) {
    console.error('Error creating session template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
