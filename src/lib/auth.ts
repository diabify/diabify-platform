import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipos para autenticación
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'VISITOR' | 'USER' | 'PROFESSIONAL' | 'ADMIN';
}

// Verificar si el usuario es admin
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Obtener usuario desde token/session (simulado por ahora)
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Por ahora vamos a usar un header para simular autenticación
    // En producción esto sería JWT/session real
    const authHeader = request.headers.get('authorization');
    const userIdHeader = request.headers.get('x-user-id');
    
    if (!authHeader && !userIdHeader) {
      return null;
    }

    // Si tenemos un ID de usuario directamente (para testing)
    if (userIdHeader) {
      const user = await prisma.user.findUnique({
        where: { id: userIdHeader },
        select: { id: true, email: true, name: true, role: true }
      });
      
      return user as AuthUser;
    }

    // TODO: Implementar validación de JWT real
    // const token = authHeader?.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Middleware de autenticación para APIs
export async function requireAuth(request: NextRequest, requiredRole?: string): Promise<{ user: AuthUser | null; error?: string }> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return { user: null, error: 'No autenticado' };
  }

  if (requiredRole && user.role !== requiredRole) {
    return { user: null, error: `Rol requerido: ${requiredRole}` };
  }

  return { user };
}

// Crear usuario admin (función de utilidad)
export async function createAdminUser(email: string, name: string): Promise<AuthUser> {
  const adminUser = await prisma.user.create({
    data: {
      email,
      name,
      role: 'ADMIN'
    },
    select: { id: true, email: true, name: true, role: true }
  });

  return adminUser as AuthUser;
}

// Verificar permisos para verificar profesionales
export async function canVerifyProfessionals(userId: string): Promise<boolean> {
  return await isAdmin(userId);
}

// Logs de actividad admin
export async function logAdminActivity(adminId: string, action: string, details: any) {
  try {
    // Por ahora solo log en consola, después podríamos crear tabla de logs
    console.log(`[ADMIN] ${adminId} - ${action}:`, details);
    
    // TODO: Implementar tabla de logs en base de datos
    // await prisma.adminLog.create({
    //   data: {
    //     adminId,
    //     action,
    //     details: JSON.stringify(details),
    //     timestamp: new Date()
    //   }
    // });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}
