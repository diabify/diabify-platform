import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, logAdminAccess } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { adminToken } = await req.json();
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Token de admin requerido', authorized: false },
        { status: 400 }
      );
    }
    
    // Usar el middleware de autenticación admin
    const authResult = await requireAdminAuth(req);
    
    if (!authResult.authorized) {
      return authResult.response || NextResponse.json(
        { error: 'Acceso no autorizado', authorized: false },
        { status: 401 }
      );
    }
    
    // Log del acceso exitoso
    await logAdminAccess(
      authResult.user!.id,
      'ADMIN_PANEL_ACCESS',
      { 
        endpoint: '/admin',
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      }
    );
    
    return NextResponse.json({
      authorized: true,
      user: {
        id: authResult.user!.id,
        email: authResult.user!.email,
        role: authResult.user!.role
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
