import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/url';

// Usar la misma configuración de email que ya tienes en newsletter
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

// Interfaces para los emails
interface AppointmentEmailData {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  professionalName: string;
  professionalEmail: string;
  serviceTitle: string;
  scheduledAt: Date;
  duration: number;
  finalPrice: number;
  modality: string;
  notes?: string;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  verificationToken: string;
}

interface PasswordResetEmailData {
  userName: string;
  userEmail: string;
  resetUrl: string;
}

// Plantillas de email
const generateAppointmentConfirmationHTML = (data: AppointmentEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Cita Confirmada - Diabify</h1>
    </div>
    <div class="content">
      <h2>¡Hola ${data.clientName}!</h2>
      <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
      
      <div class="appointment-details">
        <h3>📅 Detalles de la Cita</h3>
        <p><strong>Servicio:</strong> ${data.serviceTitle}</p>
        <p><strong>Profesional:</strong> ${data.professionalName}</p>
        <p><strong>Fecha y Hora:</strong> ${data.scheduledAt.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p><strong>Duración:</strong> ${data.duration} minutos</p>
        <p><strong>Modalidad:</strong> ${data.modality === 'ONLINE' ? '💻 Online' : '🏥 Presencial'}</p>
        <p><strong>Precio:</strong> €${data.finalPrice}</p>
        ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${getBaseUrl()}/citas" class="button">Ver Mis Citas</a>
      </div>

      <p><strong>Próximos pasos:</strong></p>
      <ul>
        <li>Recibirás un recordatorio 24 horas antes de tu cita</li>
        <li>Si es una sesión online, recibirás el enlace de la videollamada</li>
        <li>Puedes gestionar tu cita desde tu panel de usuario</li>
      </ul>
    </div>
    <div class="footer">
      <p>Diabify - Cuidando tu salud con tecnología</p>
      <p>Si necesitas cancelar o reprogramar, visita tu panel de usuario</p>
    </div>
  </div>
</body>
</html>
`;

// Funciones para enviar emails
export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  try {
    // Email al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.clientEmail,
      subject: `✅ Cita Confirmada - ${data.serviceTitle}`,
      html: generateAppointmentConfirmationHTML(data)
    });

    // Email al profesional
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.professionalEmail,
      subject: `📅 Nueva Cita Programada - ${data.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nueva Cita Programada</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Cliente:</strong> ${data.clientName} (${data.clientEmail})</p>
            <p><strong>Servicio:</strong> ${data.serviceTitle}</p>
            <p><strong>Fecha:</strong> ${data.scheduledAt.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Duración:</strong> ${data.duration} minutos</p>
            <p><strong>Modalidad:</strong> ${data.modality === 'ONLINE' ? 'Online' : 'Presencial'}</p>
            ${data.notes ? `<p><strong>Notas del cliente:</strong> ${data.notes}</p>` : ''}
          </div>
          <p><a href="${getBaseUrl()}/admin/sessions" style="color: #2563eb;">Ver en Panel Admin</a></p>
        </div>
      `
    });

    console.log('✅ Appointment confirmation emails sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending appointment confirmation emails:', error);
    return { success: false, error };
  }
}

export async function sendAppointmentCancellation(data: AppointmentEmailData) {
  try {
    // Email al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.clientEmail,
      subject: `❌ Cita Cancelada - ${data.serviceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Cita Cancelada</h2>
          <p>Tu cita del ${data.scheduledAt.toLocaleDateString('es-ES')} con ${data.professionalName} ha sido cancelada.</p>
          <p>Puedes programar una nueva cita cuando gustes.</p>
          <p><a href="${getBaseUrl()}/profesionales" style="color: #2563eb;">Buscar Profesionales</a></p>
        </div>
      `
    });

    // Email al profesional
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.professionalEmail,
      subject: `❌ Cita Cancelada - ${data.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Cita Cancelada</h2>
          <p>La cita del ${data.scheduledAt.toLocaleDateString('es-ES')} con ${data.clientName} ha sido cancelada.</p>
          <p>Tu horario está ahora disponible para nuevas reservas.</p>
        </div>
      `
    });

    console.log('✅ Appointment cancellation emails sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending appointment cancellation emails:', error);
    return { success: false, error };
  }
}

// Plantilla de email de bienvenida
const generateWelcomeEmailHTML = (data: WelcomeEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .welcome-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
    .verification-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
    .button:hover { background: #059669; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
    .feature { background: #f9fafb; padding: 15px; border-radius: 6px; text-align: center; }
    .feature-icon { font-size: 24px; margin-bottom: 10px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido a Diabify! 🎉</h1>
      <p>Tu plataforma de salud digital</p>
    </div>
    
    <div class="content">
      <div class="welcome-box">
        <h2 style="color: #059669; margin-top: 0;">¡Hola ${data.userName}!</h2>
        <p>Estamos emocionados de tenerte en nuestra comunidad. Diabify es tu compañero confiable para el cuidado de la salud digital.</p>
      </div>

      <div class="verification-box">
        <h3 style="color: #1d4ed8; margin-top: 0;">📧 Confirma tu cuenta</h3>
        <p>Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu dirección de email.</p>
        <a href="${getBaseUrl()}/auth/verify?token=${data.verificationToken}" class="button">
          Verificar mi cuenta
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 15px;">
          Si el botón no funciona, copia este enlace: ${getBaseUrl()}/auth/verify?token=${data.verificationToken}
        </p>
      </div>

      <h3 style="color: #374151;">🚀 ¿Qué puedes hacer en Diabify?</h3>
      <div class="features">
        <div class="feature">
          <div class="feature-icon">🩺</div>
          <h4>Consultas Online</h4>
          <p>Conecta con profesionales de la salud desde casa</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📅</div>
          <h4>Agenda Inteligente</h4>
          <p>Programa y gestiona tus citas fácilmente</p>
        </div>
        <div class="feature">
          <div class="feature-icon">💊</div>
          <h4>Seguimiento</h4>
          <p>Monitorea tu progreso y resultados</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📚</div>
          <h4>Recursos</h4>
          <p>Accede a guías y materiales educativos</p>
        </div>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h4 style="color: #92400e; margin-top: 0;">⚡ Primeros pasos:</h4>
        <ol style="color: #92400e; margin: 0;">
          <li>Verifica tu cuenta haciendo clic en el botón de arriba</li>
          <li>Completa tu perfil de salud</li>
          <li>Explora nuestros profesionales verificados</li>
          <li>Agenda tu primera consulta</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <p><strong>Diabify Team</strong></p>
      <p>Tu salud, nuestra prioridad</p>
      <p style="font-size: 12px; margin-top: 15px;">
        Si tienes alguna pregunta, responde a este email o contáctanos en soporte@diabify.com
      </p>
    </div>
  </div>
</body>
</html>
`;

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    console.log('📧 Sending welcome email to:', data.userEmail);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'info@diabify.com',
      to: data.userEmail,
      subject: '🎉 ¡Bienvenido a Diabify! Confirma tu cuenta',
      html: generateWelcomeEmailHTML(data),
      text: `¡Hola ${data.userName}!

¡Bienvenido a Diabify! Estamos emocionados de tenerte en nuestra comunidad.

Para completar tu registro, por favor verifica tu cuenta haciendo clic en este enlace:
${getBaseUrl()}/auth/verify?token=${data.verificationToken}

¿Qué puedes hacer en Diabify?
- Consultas online con profesionales verificados
- Agenda inteligente para gestionar tus citas
- Seguimiento de tu progreso de salud
- Acceso a recursos educativos

Primeros pasos:
1. Verifica tu cuenta
2. Completa tu perfil de salud
3. Explora nuestros profesionales
4. Agenda tu primera consulta

¡Gracias por unirte a Diabify!

El equipo de Diabify
Tu salud, nuestra prioridad`
    });

    console.log('✅ Welcome email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  try {
    // Verificar si SMTP está configurado
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 SMTP not configured, simulating password reset email send to:', data.userEmail);
      console.log('Reset URL would be:', data.resetUrl);
      return; // Simular éxito para desarrollo
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: data.userEmail,
      subject: 'Restablecer contraseña - Diabify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Restablecer tu contraseña</h2>
          <p>Hola ${data.userName},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Diabify.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${data.resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Restablecer contraseña
          </a>
          <p style="color: #666; font-size: 14px;">
            Este enlace expirará en 1 hora por seguridad.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste este cambio, puedes ignorar este email de forma segura.
          </p>
          <br>
          <p>Saludos,<br>El equipo de Diabify</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent successfully to:', data.userEmail);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    // No lanzar error para evitar que falle la API en desarrollo
    console.log('📧 Email sending failed but continuing for development purposes');
  }
}
