import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/professionals/[id]/availability-settings - Obtener configuración de disponibilidad
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id: professionalId } = params;

    // Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const canAccess = currentUser.role === 'ADMIN' || 
      (currentUser.role === 'PROFESSIONAL' && professional.userId === currentUser.id);

    if (!canAccess) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }

    // Obtener configuración de disponibilidad
    const availability = professional.availability || getDefaultAvailability();

    return NextResponse.json({
      professional: {
        id: professional.id,
        name: professional.user.name,
        email: professional.user.email
      },
      availability,
      lastUpdated: professional.updatedAt
    });

  } catch (error) {
    console.error('❌ Error fetching availability settings:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración de disponibilidad' },
      { status: 500 }
    );
  }
}

// PUT /api/professionals/[id]/availability-settings - Actualizar configuración de disponibilidad
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id: professionalId } = params;
    const { availability } = await request.json();

    // Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const canUpdate = currentUser.role === 'ADMIN' || 
      (currentUser.role === 'PROFESSIONAL' && professional.userId === currentUser.id);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar esta información' },
        { status: 403 }
      );
    }

    // Validar formato de disponibilidad
    if (!isValidAvailability(availability)) {
      return NextResponse.json(
        { error: 'Formato de disponibilidad inválido' },
        { status: 400 }
      );
    }

    // Actualizar disponibilidad
    const updatedProfessional = await prisma.professional.update({
      where: { id: professionalId },
      data: {
        availability: availability,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`✅ Availability updated for professional ${professionalId}`);

    return NextResponse.json({
      message: 'Disponibilidad actualizada exitosamente',
      professional: {
        id: updatedProfessional.id,
        name: updatedProfessional.user.name
      },
      availability: updatedProfessional.availability,
      updatedAt: updatedProfessional.updatedAt
    });

  } catch (error) {
    console.error('❌ Error updating availability settings:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración de disponibilidad' },
      { status: 500 }
    );
  }
}

// Función para obtener disponibilidad por defecto
function getDefaultAvailability() {
  return {
    monday: { available: true, hours: ['09:00-17:00'] },
    tuesday: { available: true, hours: ['09:00-17:00'] },
    wednesday: { available: true, hours: ['09:00-17:00'] },
    thursday: { available: true, hours: ['09:00-17:00'] },
    friday: { available: true, hours: ['09:00-17:00'] },
    saturday: { available: false, hours: [] },
    sunday: { available: false, hours: [] }
  };
}

// Función para validar formato de disponibilidad
function isValidAvailability(availability: any): boolean {
  if (!availability || typeof availability !== 'object') {
    return false;
  }

  const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of requiredDays) {
    if (!availability[day]) {
      return false;
    }

    const dayData = availability[day];
    
    if (typeof dayData.available !== 'boolean' || !Array.isArray(dayData.hours)) {
      return false;
    }

    // Validar formato de horarios
    for (const timeRange of dayData.hours) {
      if (!isValidTimeRange(timeRange)) {
        return false;
      }
    }
  }

  return true;
}

// Función para validar rango de tiempo
function isValidTimeRange(range: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!regex.test(range)) {
    return false;
  }

  const [start, end] = range.split('-');
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes > startMinutes;
}
