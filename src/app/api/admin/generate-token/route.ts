import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAdminToken, logAdminAccess } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }
    
    // 1. Buscar usuario con todos los campos necesarios
    const user = await prisma.user.findUnique({
      where: { email }
    }) as any; // Usar any para evitar problemas de tipos temporalmente

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 2. Verificar contraseña
    if (!user.password) {
      return NextResponse.json(
        { error: 'Usuario sin contraseña configurada' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 3. Verificar rol ADMIN
    if (user.role !== 'ADMIN') {
      await logAdminAccess(user.id, 'ADMIN_ACCESS_DENIED', { email });
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // 4. Verificar email verificado
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email no verificado' },
        { status: 401 }
      );
    }    // 5. Generar token de admin
    const adminToken = generateAdminToken(user.id);
    
    // 6. Log de acceso exitoso
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await logAdminAccess(user.id, 'ADMIN_TOKEN_GENERATED', { 
      email: user.email,
      ip: clientIP
    });
    
    return NextResponse.json({
      success: true,
      adminToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      expiresIn: '1h'
    });
    
  } catch (error) {
    console.error('Error generating admin token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Rate limiting simple (en producción usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset contador después de 15 minutos
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Máximo 5 intentos por IP
  if (attempts.count >= 5) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}
