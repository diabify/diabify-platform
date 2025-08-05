import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'ID and isActive status are required' },
        { status: 400 }
      );
    }

    // Actualizar el estado de la suscripción
    const updatedSubscription = await prisma.newsletter.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({
      message: `Subscription ${isActive ? 'activated' : 'deactivated'} successfully`,
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('Error toggling newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
