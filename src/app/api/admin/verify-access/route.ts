import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, verifyAdminRole, logAdminAccess } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { adminToken } = await req.json();
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Token de admin requerido', authorized: false },
        { status: 400 }
      );
    }
    
    // 1. Validar token de admin
    const tokenValidation = validateAdminToken(adminToken);
    if (!tokenValidation.valid || !tokenValidation.userId) {
      return NextResponse.json(
        { error: 'Token de admin inválido o expirado', authorized: false },
        { status: 401 }
      );
    }
    
    // 2. Verificar rol ADMIN en base de datos
    const isAdmin = await verifyAdminRole(tokenValidation.userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Privilegios de administrador requeridos', authorized: false },
        { status: 403 }
      );
    }
    
    // 3. Obtener datos del usuario para respuesta
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: tokenValidation.userId },
      select: { id: true, email: true, role: true, name: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', authorized: false },
        { status: 404 }
      );
    }
    
    // 4. Log del acceso exitoso
    await logAdminAccess(
      user.id,
      'ADMIN_PANEL_ACCESS',
      { 
        endpoint: '/admin',
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }
    );
    
    return NextResponse.json({
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', authorized: false },
      { status: 500 }
    );
  }
}
