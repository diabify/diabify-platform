import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, logAdminActivity } from '@/lib/auth';

// GET /api/admin/users - Obtener lista de usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const { user, error } = await requireAuth(request, 'ADMIN');
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Acceso denegado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtros
    const whereClause: any = {};
    if (role && role !== 'ALL') {
      whereClause.role = role;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener usuarios con información relacionada
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          professional: {
            select: {
              id: true,
              type: true,
              verified: true,
              rating: true,
              _count: {
                select: { sessions: true }
              }
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Estadísticas
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const statsFormatted = stats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats: statsFormatted
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Actualizar rol de usuario (solo admin)
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const { user: adminUser, error } = await requireAuth(request, 'ADMIN');
    if (error || !adminUser) {
      return NextResponse.json(
        { error: error || 'Acceso denegado' },
        { status: 403 }
      );
    }

    const { userId, newRole, reason } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'userId y newRole son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el rol es válido
    const validRoles = ['VISITOR', 'USER', 'PROFESSIONAL', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // No permitir que un admin se quite el rol a sí mismo
    if (userId === adminUser.id && newRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propio rol de administrador' },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar rol
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    // Log de actividad
    await logAdminActivity(adminUser.id, 'CHANGE_USER_ROLE', {
      targetUserId: userId,
      targetUserName: existingUser.name,
      targetUserEmail: existingUser.email,
      oldRole: existingUser.role,
      newRole,
      reason,
      timestamp: new Date().toISOString()
    });

    console.log(`🔄 User role changed by admin ${adminUser.name}:`, {
      user: existingUser.email,
      oldRole: existingUser.role,
      newRole,
      reason
    });

    return NextResponse.json({
      user: updatedUser,
      message: `Rol actualizado de ${existingUser.role} a ${newRole}`
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return NextResponse.json(
      { error: 'Error al actualizar rol de usuario' },
      { status: 500 }
    );
  }
}
