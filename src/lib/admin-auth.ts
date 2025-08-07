import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Genera un token temporal para acceso admin
 */
export function generateAdminToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign(
    { 
      userId, 
      type: 'admin-access',
      iat: Date.now() 
    },
    secret,
    { expiresIn: '1h' } // Token válido por 1 hora
  );
}

/**
 * Valida token de admin desde URL
 */
export function validateAdminToken(token: string): { valid: boolean; userId?: string } {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type !== 'admin-access') {
      return { valid: false };
    }
    
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Verifica si el usuario tiene rol ADMIN
 */
export async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === 'ADMIN';
  } catch (error) {
    return false;
  }
}

/**
 * Middleware completo de autenticación admin
 */
export async function requireAdminAuth(req: NextRequest): Promise<{
  authorized: boolean;
  user?: AdminUser;
  response?: NextResponse;
}> {
  try {
    // 1. Verificar token en URL
    const url = new URL(req.url);
    const adminToken = url.searchParams.get('token');
    
    if (!adminToken) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Token de admin requerido' },
          { status: 401 }
        )
      };
    }
    
    // 2. Validar token
    const tokenValidation = validateAdminToken(adminToken);
    if (!tokenValidation.valid || !tokenValidation.userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Token de admin inválido o expirado' },
          { status: 401 }
        )
      };
    }
    
    // 3. Verificar autenticación de usuario (JWT session)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Autenticación requerida' },
          { status: 401 }
        )
      };
    }
    
    const sessionToken = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const sessionDecoded = jwt.verify(sessionToken, secret) as any;
    
    // 4. Verificar que coincidan los usuarios
    if (sessionDecoded.userId !== tokenValidation.userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Token de admin no coincide con sesión' },
          { status: 403 }
        )
      };
    }
    
    // 5. Verificar rol ADMIN
    const isAdmin = await verifyAdminRole(tokenValidation.userId);
    if (!isAdmin) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Privilegios de administrador requeridos' },
          { status: 403 }
        )
      };
    }
    
    // 6. Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: tokenValidation.userId },
      select: { id: true, email: true, role: true }
    });
    
    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      };
    }
    
    return {
      authorized: true,
      user: user as AdminUser
    };
    
  } catch (error) {
    console.error('Error en autenticación admin:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Error interno de autenticación' },
        { status: 500 }
      )
    };
  }
}

/**
 * Registra acceso administrativo para auditoría
 */
export async function logAdminAccess(
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  try {
    console.log(`[ADMIN ACCESS] User: ${userId}, Action: ${action}`, details);
    
    // Aquí podrías guardar en una tabla de logs si la creas
    // await prisma.adminLog.create({...})
    
  } catch (error) {
    console.error('Error logging admin access:', error);
  }
}
