import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/payments/webhook - Webhook para confirmación de pagos
export async function POST(request: NextRequest) {
  try {
    // En producción, verificarías la firma del webhook de Stripe aquí
    const body = await request.json();
    
    const { paymentId, status, stripePaymentId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Actualizar el estado del pago
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status.toUpperCase(),
        ...(stripePaymentId && { stripePaymentId })
      },
      include: {
        session: {
          include: {
            client: true,
            professional: {
              include: { user: true }
            }
          }
        }
      }
    });

    // Si el pago fue exitoso, confirmar la cita
    if (status === 'SUCCEEDED') {
      await prisma.session.update({
        where: { id: payment.sessionId! },
        data: { status: 'COMPLETED' } // Usando un estado válido del enum
      });

      console.log('✅ Payment confirmed and session status updated');
      
      // TODO: Enviar email de confirmación de pago
      // TODO: Notificar al profesional
    }

    return NextResponse.json({
      success: true,
      paymentStatus: payment.status
    });

  } catch (error) {
    console.error('❌ Error processing payment webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}
