import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Función para calcular spam score (simplificada)
function calculateSpamScore(email: string, source: string, ipAddress: string): number {
  let score = 0;
  
  // Verificaciones básicas de email
  if (!email.includes('@')) score += 10;
  if (email.includes('test') || email.includes('example')) score += 2;
  if (email.length < 5) score += 5;
  
  // Verificación de dominio
  const domain = email.split('@')[1];
  if (!domain) score += 10;
  
  // Dominios sospechosos
  const suspiciousDomains = ['10minutemail', 'guerrillamail', 'tempmail'];
  if (suspiciousDomains.some(d => domain?.includes(d))) score += 15;
  
  return Math.min(score, 20); // Max 20
}

// Función para obtener IP del cliente
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  
  return '127.0.0.1';
}

// Función para envío de email (simplificada inicialmente)
async function sendAlertEmail(newsletter: any): Promise<boolean> {
  try {
    console.log('🔍 Intentando enviar email de alerta...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 segundos
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    console.log('📧 Config SMTP: {', 
      'host:', process.env.SMTP_HOST,
      ', port:', process.env.SMTP_PORT,
      ', user: ***configurado***',
      ', pass: ***configurado***',
      ', from:', process.env.EMAIL_FROM,
      '}');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'juanfran@diabify.com',
      subject: '🔔 Nueva suscripción al newsletter - Diabify 2.0',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Nueva Suscripción Newsletter</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${newsletter.email}</p>
              <p style="margin: 5px 0;"><strong>Fuente:</strong> ${newsletter.source}</p>
              <p style="margin: 5px 0;"><strong>Spam Score:</strong> ${newsletter.spamScore}/20</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> ${newsletter.isBlocked ? '🚫 Bloqueado' : '✅ Activo'}</p>
              <p style="margin: 5px 0;"><strong>IP:</strong> ${newsletter.ipAddress}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(newsletter.createdAt).toLocaleString('es-ES')}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              Este email fue enviado automáticamente desde la plataforma Diabify 2.0.
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email enviado exitosamente:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return true;
    
  } catch (error) {
    console.error('❌ Error enviando email de alerta:', error);
    // No lanzamos el error para que no falle toda la suscripción
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Newsletter Hybrid API called');
    
    // 1. Parse request body
    const body = await request.json();
    console.log('📝 Body received:', body);
    
    const { email, source } = body;
    
    // 2. Validaciones básicas
    if (!email || !source) {
      return NextResponse.json({
        error: 'Email and source are required'
      }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 });
    }

    console.log('✅ Basic validation passed');

    // 3. Conectar a la base de datos
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // 4. Verificar si el email ya existe
    try {
      const existingSubscription = await prisma.newsletter.findUnique({
        where: { email }
      });

      if (existingSubscription) {
        console.log('⚠️ Email already exists:', email);
        return NextResponse.json({
          error: 'Email ya está suscrito'
        }, { status: 409 });
      }
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError);
      return NextResponse.json({
        error: 'Database query failed'
      }, { status: 500 });
    }

    // 5. Calcular datos adicionales
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const spamScore = calculateSpamScore(email, source, ipAddress);
    const isBlocked = spamScore >= 10;

    console.log('📊 Calculated spam score:', spamScore, 'blocked:', isBlocked);

    // 6. Crear el registro
    let newsletter;
    try {
      newsletter = await prisma.newsletter.create({
        data: {
          email,
          source: 'MAINTENANCE_PAGE', // Usar enum value
          spamScore,
          isActive: !isBlocked,
          isBlocked,
          blockReason: isBlocked ? `Alto spam score: ${spamScore}` : null,
          ipAddress,
          userAgent
        }
      });

      console.log('✅ Newsletter record created:', newsletter.id);
    } catch (insertError) {
      console.error('❌ Database insert failed:', insertError);
      return NextResponse.json({
        error: 'Failed to create subscription'
      }, { status: 500 });
    }

    // 7. Intentar enviar email (no bloquea si falla)
    if (!isBlocked) {
      console.log('📧 Attempting to send alert email...');
      const emailSent = await sendAlertEmail(newsletter);
      console.log('📧 Email sent:', emailSent);
    } else {
      console.log('🚫 Skipping email due to spam block');
    }

    // 8. Respuesta exitosa
    const responseData = {
      success: true,
      message: isBlocked ? 'Suscripción bloqueada por medidas anti-spam' : 'Suscripción exitosa',
      id: newsletter.id,
      isBlocked,
      spamScore
    };

    console.log('✅ Response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ General error in newsletter hybrid API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
