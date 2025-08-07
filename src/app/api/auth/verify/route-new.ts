import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Handler para GET (cuando se hace clic en el enlace del email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Usar any para evitar problemas de tipos temporalmente
    const userQuery = prisma.user as any;

    // Buscar usuario con el token de verificación
    const user = await userQuery.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de verificación inválido o cuenta ya verificada' },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Actualizar usuario como verificado
    const updatedUser = await userQuery.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true
      }
    });

    console.log('✅ Usuario verificado exitosamente:', updatedUser.id);

    return NextResponse.json({
      message: 'Cuenta verificada exitosamente',
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error during email verification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Handler para POST (para compatibilidad con frontend)
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Usar any para evitar problemas de tipos temporalmente
    const userQuery = prisma.user as any;

    // Buscar usuario con el token de verificación
    const user = await userQuery.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de verificación inválido o cuenta ya verificada' },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Actualizar usuario como verificado
    const updatedUser = await userQuery.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true
      }
    });

    console.log('✅ Usuario verificado exitosamente:', updatedUser.id);

    return NextResponse.json({
      message: 'Cuenta verificada exitosamente',
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error during email verification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
