import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, logAdminActivity } from '@/lib/auth';

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

    // Verificar autenticación de admin
    const { user, error } = await requireAuth(request, 'ADMIN');
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Acceso denegado. Solo administradores pueden verificar profesionales' },
        { status: 403 }
      );
    }
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

    // Log de la acción admin
    await logAdminActivity(user.id, verified ? 'VERIFY_PROFESSIONAL' : 'UNVERIFY_PROFESSIONAL', {
      professionalId: id,
      professionalName: existingProfessional.user.name,
      professionalEmail: existingProfessional.user.email,
      verificationNotes,
      timestamp: new Date().toISOString()
    });

    console.log(`${verified ? '✅ Professional verified' : '❌ Professional unverified'} by admin ${user.name}:`, {
      id,
      name: existingProfessional.user.name,
      email: existingProfessional.user.email,
      notes: verificationNotes,
      adminId: user.id
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
