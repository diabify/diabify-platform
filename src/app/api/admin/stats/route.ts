import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/stats - Obtener estadísticas del sistema (solo admin)
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

    // Estadísticas de usuarios
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const userStatsFormatted = userStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas de profesionales
    const [
      totalProfessionals,
      verifiedProfessionals,
      professionalsByType,
      averageRating,
      totalSessions,
      recentSessions
    ] = await Promise.all([
      prisma.professional.count(),
      prisma.professional.count({ where: { verified: true } }),
      prisma.professional.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.professional.aggregate({
        _avg: { rating: true }
      }),
      prisma.session.count(),
      prisma.session.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        }
      })
    ]);

    const professionalTypeStats = professionalsByType.reduce((acc, stat) => {
      acc[stat.type] = stat._count.type;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas de newsletter (usar la tabla correcta según el schema)
    const [newsletterSubscribers, activeSubscribers] = await Promise.all([
      // Ajustar según el modelo real de newsletter en tu schema
      // prisma.newsletterSubscription.count(),
      // prisma.newsletterSubscription.count({ where: { isActive: true } })
      // Por ahora usar 0 hasta tener el modelo correcto
      Promise.resolve(0),
      Promise.resolve(0)
    ]);

    // Registros recientes (últimos 7 días)
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const recentProfessionals = await prisma.professional.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Actividad de la última semana por día
    const weeklyActivity = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true }
    });

    const stats = {
      users: {
        total: Object.values(userStatsFormatted).reduce((a, b) => a + b, 0),
        byRole: userStatsFormatted,
        recentRegistrations: recentUsers
      },
      professionals: {
        total: totalProfessionals,
        verified: verifiedProfessionals,
        pending: totalProfessionals - verifiedProfessionals,
        byType: professionalTypeStats,
        averageRating: averageRating._avg.rating || 0,
        recentRegistrations: recentProfessionals
      },
      sessions: {
        total: totalSessions,
        recent: recentSessions
      },
      newsletter: {
        total: newsletterSubscribers,
        active: activeSubscribers,
        inactive: newsletterSubscribers - activeSubscribers
      },
      activity: {
        weeklyRegistrations: weeklyActivity.length
      }
    };

    return NextResponse.json({
      stats,
      generatedAt: new Date().toISOString(),
      admin: {
        id: user.id,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
