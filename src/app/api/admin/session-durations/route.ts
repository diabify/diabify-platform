import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/session-durations - Obtener todas las duraciones de sesión
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

    const durations = await prisma.sessionDuration.findMany({
      orderBy: { minutes: 'asc' }
    });

    return NextResponse.json({ durations });

  } catch (error) {
    console.error('Error fetching session durations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/session-durations - Crear nueva duración
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const { user, error } = await requireAuth(request, 'ADMIN');
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Acceso denegado' },
        { status: 403 }
      );
    }

    const { name, minutes } = await request.json();

    if (!name || !minutes) {
      return NextResponse.json(
        { error: 'Nombre y minutos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que no exista ya una duración con esos minutos
    const existingDuration = await prisma.sessionDuration.findUnique({
      where: { minutes: parseInt(minutes) }
    });

    if (existingDuration) {
      return NextResponse.json(
        { error: 'Ya existe una duración con esos minutos' },
        { status: 400 }
      );
    }

    const duration = await prisma.sessionDuration.create({
      data: {
        name,
        minutes: parseInt(minutes)
      }
    });

    return NextResponse.json({
      message: 'Duración creada exitosamente',
      duration
    });

  } catch (error) {
    console.error('Error creating session duration:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/session-durations - Actualizar duración
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const { user, error } = await requireAuth(request, 'ADMIN');
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Acceso denegado' },
        { status: 403 }
      );
    }

    const { id, name, minutes, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (minutes !== undefined) updateData.minutes = parseInt(minutes);
    if (isActive !== undefined) updateData.isActive = isActive;

    const duration = await prisma.sessionDuration.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      message: 'Duración actualizada exitosamente',
      duration
    });

  } catch (error) {
    console.error('Error updating session duration:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
