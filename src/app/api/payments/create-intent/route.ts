import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Esta es una implementación básica de pagos
// En producción deberías usar Stripe, PayPal u otro procesador real

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  sessionId: string;
}

// POST /api/payments/create-intent - Crear intención de pago
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requerido' },
        { status: 400 }
      );
    }

    // Verificar que la sesión existe y pertenece al usuario
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        payment: true,
        professional: {
          include: { user: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (session.clientId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Verificar si ya existe un pago
    if (session.payment) {
      return NextResponse.json({
        paymentIntent: {
          id: session.payment.id,
          amount: session.payment.amount,
          currency: session.payment.currency,
          status: session.payment.status,
          sessionId: session.id
        }
      });
    }

    // Calcular comisiones
    const totalAmount = session.finalPrice;
    const platformFee = totalAmount * 0.15; // 15% para la plataforma
    const professionalAmount = totalAmount - platformFee;

    // Crear registro de pago
    const payment = await prisma.payment.create({
      data: {
        userId: currentUser.id,
        sessionId: session.id,
        amount: totalAmount,
        currency: 'EUR',
        status: 'PENDING',
        professionalAmount,
        platformAmount: platformFee
      }
    });

    // En una implementación real, aquí crearías el PaymentIntent con Stripe:
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe usa centavos
      currency: 'eur',
      metadata: {
        sessionId: session.id,
        userId: currentUser.id
      }
    });
    
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripePaymentId: paymentIntent.id }
    });
    */

    console.log('✅ Payment intent created:', payment.id);

    return NextResponse.json({
      paymentIntent: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        sessionId: session.id,
        // En producción retornarías: clientSecret: paymentIntent.client_secret
        clientSecret: `mock_secret_${payment.id}` // Mock para desarrollo
      }
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error al crear intención de pago' },
      { status: 500 }
    );
  }
}
