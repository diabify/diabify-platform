import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log('🧪 Iniciando prueba de email...');
  
  try {
    const { config } = await request.json().catch(() => ({ config: 'ssl' }));
    
    // Diferentes configuraciones para probar
    const configs = {
      ssl: {
        host: 'smtp.office365.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        debug: true,
        logger: true,
      },
      starttls: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        debug: true,
        logger: true,
        tls: {
          rejectUnauthorized: false
        }
      },
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        debug: true,
        logger: true,
      }
    };

    const selectedConfig = configs[config as keyof typeof configs] || configs.ssl;
    console.log(`🔧 Usando configuración: ${config}`);
    
    // Configuración del transporter
    const transporter = nodemailer.createTransport(selectedConfig);

    console.log('📋 Configuración SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'CONFIGURADO' : 'NO_CONFIGURADO',
      pass: process.env.SMTP_PASS ? 'CONFIGURADO' : 'NO_CONFIGURADO',
      from: process.env.EMAIL_FROM
    });

    console.log('🔗 Verificando conexión SMTP...');
    
    // Verificar conexión primero
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');

    console.log('📧 Enviando email de prueba...');
    
    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@diabify.com',
      to: 'juanfran@diabify.com',
      subject: '🧪 Prueba de Email - Diabify 2.0',
      text: 'Este es un email de prueba del sistema de newsletter.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Email de Prueba</h2>
          <p>Este es un email de prueba del sistema de newsletter de Diabify 2.0.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p>Si recibes este email, la configuración SMTP está funcionando correctamente.</p>
        </div>
      `,
    });

    console.log('✅ Email enviado exitosamente:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      details: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      }
    });

  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    
    if (error instanceof Error) {
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        code: (error as any).code,
        command: (error as any).command,
        responseCode: (error as any).responseCode,
        stack: error.stack
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Error al enviar email de prueba',
      details: error instanceof Error ? {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command
      } : 'Error desconocido'
    }, { status: 500 });
  }
}
