import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar que se envíen email y contraseña
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email (con campos necesarios)
    const user = await (prisma.user as any).findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isVerified: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!user.password) {
      return NextResponse.json(
        { error: 'Esta cuenta no tiene contraseña configurada' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar si la cuenta está verificada
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Por favor verifica tu cuenta antes de iniciar sesión. Revisa tu email.' },
        { status: 401 }
      );
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Crear respuesta
    const response = NextResponse.json({
      message: 'Autenticación exitosa',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Establecer cookie con el token JWT
    response.cookies.set('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    });

    console.log('✅ Usuario autenticado exitosamente:', user.email);

    return response;

  } catch (error) {
    console.error('❌ Error during authentication:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
