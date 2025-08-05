import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para calcular spam score
function calculateSpamScore(email: string, source: string): number {
  let score = 0;
  
  // Verificaciones de email
  if (email.includes('temp') || email.includes('10minutemail') || email.includes('guerrillamail')) {
    score += 5;
  }
  
  if (email.length < 5) {
    score += 3;
  }
  
  // Verificaciones de fuente
  if (source === 'unknown') {
    score += 2;
  }
  
  return score;
}

// Función para enviar email de alerta
async function sendAlertEmail(email: string, source: string, ipAddress: string, spamScore: number) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'juanfran@diabify.com',
      subject: '🔔 Nueva suscripción al newsletter - Diabify 2.0',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nueva suscripción al newsletter</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles del suscriptor:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Fuente:</strong> ${source}</p>
            <p><strong>IP:</strong> ${ipAddress}</p>
            <p><strong>Spam Score:</strong> ${spamScore}/20 ${spamScore >= 10 ? '⚠️ ALTO RIESGO' : '✅ SEGURO'}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #0369a1;">
              Dashboard: <a href="https://services.diabify.com/newsletter" style="color: #2563eb;">Ver todas las suscripciones</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email de alerta enviado exitosamente');
  } catch (error) {
    console.error('❌ Error enviando email de alerta:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    // Validaciones básicas
    if (!email || !source) {
      return NextResponse.json(
        { error: 'Email and source are required' },
        { status: 400 }
      );
    }

    // Mapear fuente a enum válido
    const validSources = ['MAINTENANCE_PAGE', 'LANDING_PAGE', 'BLOG', 'SOCIAL_MEDIA', 'REFERRAL'];
    const newsletterSource = validSources.includes(source.toUpperCase()) 
      ? source.toUpperCase() 
      : 'MAINTENANCE_PAGE';

    // Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Verificar si ya existe
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }

    // Calcular spam score
    const spamScore = calculateSpamScore(email, source);
    const isBlocked = spamScore >= 10;

    // Crear suscripción en la base de datos
    await prisma.newsletter.create({
      data: {
        email,
        source: newsletterSource as 'MAINTENANCE_PAGE' | 'LANDING_PAGE' | 'BLOG' | 'SOCIAL_MEDIA' | 'REFERRAL',
        ipAddress,
        spamScore,
        isBlocked,
        isActive: !isBlocked,
      },
    });

    // Enviar email de alerta
    await sendAlertEmail(email, source, ipAddress, spamScore);

    console.log(`📬 Nueva suscripción: ${email} desde ${source} (Score: ${spamScore})`);

    return NextResponse.json({
      message: isBlocked 
        ? 'Subscription blocked due to security concerns' 
        : 'Successfully subscribed to newsletter',
      blocked: isBlocked,
      spamScore,
    });

  } catch (error) {
    console.error('Error creating newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
