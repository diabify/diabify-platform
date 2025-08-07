import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return NextResponse.json(
        { message: 'Si el email está registrado, recibirás un enlace de recuperación' },
        { status: 200 }
      );
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Crear URL de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // Enviar email de recuperación
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - Diabify</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❤️ Diabify 2.0</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Recuperación de Contraseña</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Restablecer tu contraseña</h2>
          <p>Hola <strong>${user.name || 'Usuario'}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Diabify.</p>
          <p>Si tú no solicitaste este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Nota importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:<br/>
            <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Este email fue enviado desde <strong>Diabify 2.0</strong></p>
          <p>Si tienes problemas, contáctanos en <a href="mailto:info@diabify.com" style="color: #007bff;">info@diabify.com</a></p>
          <p style="margin-top: 20px;">© 2025 Diabify 2.0. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Recuperar Contraseña - Diabify 2.0',
      html: emailHtml
    });

    return NextResponse.json(
      { message: 'Email de recuperación enviado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
