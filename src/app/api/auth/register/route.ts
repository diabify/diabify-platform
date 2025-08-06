import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear el usuario con los campos de verificación
    const newUser = await (prisma.user as any).create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        isVerified: false,
        verificationToken: verificationToken,
        verificationExpires: verificationExpires,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    console.log('✅ Usuario registrado exitosamente:', newUser.id);

    // Enviar email de bienvenida y verificación
    try {
      await sendWelcomeEmail({
        userName: newUser.name || 'Usuario',
        userEmail: newUser.email,
        verificationToken
      });
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // No fallar el registro por un error de email
    }

    return NextResponse.json({
      message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
      user: newUser,
      emailSent: true
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error during user registration:', error);
    
    // Manejo específico de errores de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
