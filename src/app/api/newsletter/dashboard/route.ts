import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todas las suscripciones ordenadas por fecha de creación
    const subscriptions = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular estadísticas
    const total = subscriptions.length;
    const active = subscriptions.filter(sub => sub.isActive && !sub.isBlocked).length;
    const blocked = subscriptions.filter(sub => sub.isBlocked).length;
    
    // Suscripciones de las últimas 24 horas
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recent = subscriptions.filter(sub => 
      new Date(sub.createdAt) > oneDayAgo
    ).length;

    const stats = {
      total,
      active,
      blocked,
      recent
    };

    return NextResponse.json({
      subscriptions,
      stats
    });

  } catch (error) {
    console.error('Error fetching newsletter dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
