import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar la configuración del transportador
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return false;
  }
}

// Plantilla base HTML para emails
function getEmailTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafb;
            }
            .email-container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #1F2937;
                margin-bottom: 20px;
            }
            .content {
                font-size: 16px;
                line-height: 1.8;
                color: #4B5563;
            }
            .highlight {
                background-color: #EFF6FF;
                border-left: 4px solid #3B82F6;
                padding: 16px;
                margin: 20px 0;
                border-radius: 6px;
            }
            .button {
                display: inline-block;
                background-color: #3B82F6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                text-align: center;
                font-size: 14px;
                color: #6B7280;
            }
            .appointment-details {
                background-color: #F9FAFB;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #E5E7EB;
            }
            .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            .detail-value {
                color: #6B7280;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Diabify</div>
                <h1 class="title">${title}</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>Este es un mensaje automático del sistema Diabify.</p>
                <p>Si tienes alguna pregunta, contacta con nuestro equipo de soporte.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Interfaz para datos de recordatorio
interface AppointmentReminderData {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  professionalName: string;
  professionalEmail: string;
  serviceTitle: string;
  scheduledAt: Date;
  duration: number;
  finalPrice: number;
  reminderType: '24h' | '2h' | '1h';
  timeUntil: string;
}

// Enviar recordatorio de cita
export async function sendAppointmentReminder(data: AppointmentReminderData) {
  const {
    appointmentId,
    clientName,
    clientEmail,
    professionalName,
    professionalEmail,
    serviceTitle,
    scheduledAt,
    duration,
    finalPrice,
    reminderType,
    timeUntil
  } = data;

  const appointmentDate = new Date(scheduledAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const appointmentTime = new Date(scheduledAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Contenido para el cliente
  const clientContent = `
    <p>Hola <strong>${clientName}</strong>,</p>
    
    <p>Te recordamos que tienes una cita programada ${timeUntil}.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Profesional:</span>
        <span class="detail-value">${professionalName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Hora:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duración:</span>
        <span class="detail-value">${duration} minutos</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Precio:</span>
        <span class="detail-value">€${finalPrice}</span>
      </div>
    </div>

    <div class="highlight">
      <strong>¿Necesitas hacer algún cambio?</strong><br>
      Si necesitas reprogramar o cancelar tu cita, por favor contacta con nosotros con al menos 24 horas de antelación.
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/citas" class="button">Ver mis citas</a>
    
    <p>¡Esperamos verte pronto!</p>
  `;

  // Contenido para el profesional
  const professionalContent = `
    <p>Hola <strong>${professionalName}</strong>,</p>
    
    <p>Recordatorio: Tienes una cita programada ${timeUntil}.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Cliente:</span>
        <span class="detail-value">${clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Hora:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duración:</span>
        <span class="detail-value">${duration} minutos</span>
      </div>
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesionales/dashboard" class="button">Ver agenda</a>
    
    <p>¡Que tengas una excelente sesión!</p>
  `;

  const reminderTitles = {
    '24h': 'Recordatorio: Tu cita es mañana',
    '2h': 'Recordatorio: Tu cita es en 2 horas',
    '1h': 'Recordatorio: Tu cita es en 1 hora'
  };

  const title = reminderTitles[reminderType];

  try {
    // Enviar email al cliente
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: clientEmail,
      subject: `${title} - ${serviceTitle}`,
      html: getEmailTemplate(clientContent, title)
    });

    // Enviar email al profesional
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: professionalEmail,
      subject: `Recordatorio profesional: Cita con ${clientName}`,
      html: getEmailTemplate(professionalContent, `Recordatorio: Cita con ${clientName}`)
    });

    console.log(`✅ Recordatorio ${reminderType} enviado exitosamente`);
    console.log(`   📧 Cliente: ${clientEmail}`);
    console.log(`   👨‍⚕️ Profesional: ${professionalEmail}`);

    return {
      success: true,
      clientEmail,
      professionalEmail,
      reminderType,
      appointmentId
    };

  } catch (error) {
    console.error(`❌ Error enviando recordatorio ${reminderType}:`, error);
    throw error;
  }
}

// Interfaz para confirmación de cita
interface AppointmentConfirmationData {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  professionalName: string;
  professionalEmail: string;
  serviceTitle: string;
  scheduledAt: Date;
  duration: number;
  finalPrice: number;
  meetingUrl?: string;
}

// Enviar confirmación de cita
export async function sendAppointmentConfirmation(data: AppointmentConfirmationData) {
  const {
    appointmentId,
    clientName,
    clientEmail,
    professionalName,
    professionalEmail,
    serviceTitle,
    scheduledAt,
    duration,
    finalPrice,
    meetingUrl
  } = data;

  const appointmentDate = new Date(scheduledAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const appointmentTime = new Date(scheduledAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Contenido para el cliente
  const clientContent = `
    <p>Hola <strong>${clientName}</strong>,</p>
    
    <p>¡Excelente! Tu cita ha sido confirmada exitosamente.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Profesional:</span>
        <span class="detail-value">${professionalName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Hora:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duración:</span>
        <span class="detail-value">${duration} minutos</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Precio:</span>
        <span class="detail-value">€${finalPrice}</span>
      </div>
      ${meetingUrl ? `
      <div class="detail-row">
        <span class="detail-label">Enlace de videollamada:</span>
        <span class="detail-value"><a href="${meetingUrl}" style="color: #3B82F6;">Unirse a la sesión</a></span>
      </div>
      ` : ''}
    </div>

    <div class="highlight">
      <strong>Información importante:</strong><br>
      • Recibirás recordatorios automáticos 24h y 2h antes de tu cita<br>
      • Si necesitas cancelar, hazlo con al menos 24h de antelación<br>
      ${meetingUrl ? '• Guarda el enlace de videollamada para acceder el día de tu cita' : ''}
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/citas" class="button">Ver mis citas</a>
    
    <p>¡Esperamos ayudarte en tu camino hacia una mejor salud!</p>
  `;

  // Contenido para el profesional
  const professionalContent = `
    <p>Hola <strong>${professionalName}</strong>,</p>
    
    <p>Se ha confirmado una nueva cita en tu agenda.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Cliente:</span>
        <span class="detail-value">${clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email del cliente:</span>
        <span class="detail-value">${clientEmail}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Hora:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duración:</span>
        <span class="detail-value">${duration} minutos</span>
      </div>
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesionales/dashboard" class="button">Ver agenda completa</a>
    
    <p>¡Prepárate para ofrecer el mejor servicio!</p>
  `;

  try {
    // Enviar email al cliente
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: clientEmail,
      subject: `Cita confirmada: ${serviceTitle} con ${professionalName}`,
      html: getEmailTemplate(clientContent, 'Cita confirmada')
    });

    // Enviar email al profesional
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: professionalEmail,
      subject: `Nueva cita confirmada: ${clientName} - ${serviceTitle}`,
      html: getEmailTemplate(professionalContent, `Nueva cita: ${clientName}`)
    });

    console.log(`✅ Confirmación de cita enviada exitosamente`);
    console.log(`   📧 Cliente: ${clientEmail}`);
    console.log(`   👨‍⚕️ Profesional: ${professionalEmail}`);
    console.log(`   📅 Cita: ${appointmentId}`);

    return {
      success: true,
      clientEmail,
      professionalEmail,
      appointmentId
    };

  } catch (error) {
    console.error('❌ Error enviando confirmación de cita:', error);
    throw error;
  }
}

// Función para enviar email de cancelación
export async function sendAppointmentCancellation(data: AppointmentConfirmationData) {
  const {
    appointmentId,
    clientName,
    clientEmail,
    professionalName,
    professionalEmail,
    serviceTitle,
    scheduledAt
  } = data;

  const appointmentDate = new Date(scheduledAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const appointmentTime = new Date(scheduledAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Contenido para el cliente
  const clientContent = `
    <p>Hola <strong>${clientName}</strong>,</p>
    
    <p>Te confirmamos que tu cita ha sido <strong>cancelada</strong> como solicitaste.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Profesional:</span>
        <span class="detail-value">${professionalName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha cancelada:</span>
        <span class="detail-value">${appointmentDate} a las ${appointmentTime}</span>
      </div>
    </div>

    <div class="highlight">
      <strong>¿Necesitas reprogramar?</strong><br>
      Puedes programar una nueva cita cuando gustes a través de nuestra plataforma.
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesionales" class="button">Programar nueva cita</a>
    
    <p>¡Esperamos poder ayudarte en otra ocasión!</p>
  `;

  // Contenido para el profesional
  const professionalContent = `
    <p>Hola <strong>${professionalName}</strong>,</p>
    
    <p>Te informamos que una cita ha sido <strong>cancelada</strong>.</p>
    
    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Cliente:</span>
        <span class="detail-value">${clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Servicio:</span>
        <span class="detail-value">${serviceTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Fecha cancelada:</span>
        <span class="detail-value">${appointmentDate} a las ${appointmentTime}</span>
      </div>
    </div>
    
    <p>El horario queda nuevamente disponible en tu agenda.</p>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesionales/dashboard" class="button">Ver agenda</a>
  `;

  try {
    // Enviar email al cliente
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: clientEmail,
      subject: `Cita cancelada: ${serviceTitle}`,
      html: getEmailTemplate(clientContent, 'Cita cancelada')
    });

    // Enviar email al profesional
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: professionalEmail,
      subject: `Cita cancelada: ${clientName} - ${serviceTitle}`,
      html: getEmailTemplate(professionalContent, `Cita cancelada: ${clientName}`)
    });

    console.log(`✅ Notificación de cancelación enviada exitosamente`);
    console.log(`   📧 Cliente: ${clientEmail}`);
    console.log(`   👨‍⚕️ Profesional: ${professionalEmail}`);

    return {
      success: true,
      clientEmail,
      professionalEmail,
      appointmentId
    };

  } catch (error) {
    console.error('❌ Error enviando notificación de cancelación:', error);
    throw error;
  }
}

// Función para probar la configuración de email
export async function testEmailConfiguration() {
  try {
    const testResult = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Enviar a nosotros mismos
      subject: 'Prueba de configuración - Diabify',
      html: getEmailTemplate(
        '<p>Si recibes este email, la configuración está funcionando correctamente.</p>',
        'Configuración de Email Exitosa'
      )
    });

    console.log('✅ Email de prueba enviado exitosamente');
    return { success: true, messageId: testResult.messageId };
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    throw error;
  }
}
