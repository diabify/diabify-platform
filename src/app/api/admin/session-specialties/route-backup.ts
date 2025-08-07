import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/session-specialties - Obtener todas las especialidades
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

    const specialties = await prisma.sessionSpecialty.findMany({
      include: {
        _count: {
          select: { templates: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ specialties });

  } catch (error) {
    console.error('Error fetching session specialties:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/session-specialties - Crear nueva especialidad
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

    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      );
    }

    const specialty = await prisma.sessionSpecialty.create({
      data: {
        name,
        description: description || null,
        color: color || null
      },
      include: {
        _count: {
          select: { templates: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Especialidad de sesión creada exitosamente',
      specialty
    });

  } catch (error) {
    console.error('Error creating session specialty:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
