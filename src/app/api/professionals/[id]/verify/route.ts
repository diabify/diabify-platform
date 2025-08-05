import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/professionals/[id]/verify - Verificar o desverificar profesional
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const { verified, verificationNotes } = await request.json();

    // TODO: Aquí deberías verificar que el usuario es admin
    // const adminToken = request.cookies.get('adminToken')?.value;
    // if (!adminToken) { return error de autorización }

    // Verificar que el profesional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar estado de verificación
    const updatedProfessional = await prisma.professional.update({
      where: { id },
      data: {
        verified: verified === true,
        verifiedAt: verified === true ? new Date() : null
      },
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

    // Log de la acción
    console.log(`${verified ? '✅ Professional verified' : '❌ Professional unverified'}:`, {
      id,
      name: existingProfessional.user.name,
      email: existingProfessional.user.email,
      notes: verificationNotes
    });

    // TODO: Enviar email de notificación al profesional
    // await sendVerificationEmail(existingProfessional.user.email, verified);

    return NextResponse.json({
      professional: updatedProfessional,
      message: verified 
        ? 'Profesional verificado exitosamente' 
        : 'Verificación del profesional removida'
    });

  } catch (error) {
    console.error('❌ Error verifying professional:', error);
    return NextResponse.json(
      { error: 'Error al verificar profesional' },
      { status: 500 }
    );
  }
}
