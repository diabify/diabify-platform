const fs = require('fs');

async function testAppointmentWithCorrectUser() {
  const appointmentData = {
    professionalId: "cmdyylo3e000bursoz1y5nlv4",
    sessionTemplateId: "cme1tfrxw0002ur2wyk64jyy8", 
    scheduledAt: "2025-08-16T14:00:00.000Z",
    notes: "Prueba con usuario correcto (kniq10@gmail.com)"
  };

  try {
    console.log('🔧 PROBANDO CREACIÓN DE CITA CON USUARIO CORRECTO');
    console.log('=================================================');
    console.log('Usuario: kniq10@gmail.com (ID: cme1ktj9k0000jx042tvt5uwl)');
    console.log('Datos a enviar:', JSON.stringify(appointmentData, null, 2));
    console.log('');

    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'cme1ktj9k0000jx042tvt5uwl' // Usuario correcto (kniq10@gmail.com)
      },
      body: JSON.stringify(appointmentData)
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const result = await response.json();
    console.log('');
    
    if (response.ok) {
      console.log('✅ ¡Cita creada exitosamente!');
      console.log('Cita ID:', result.appointment.id);
      console.log('Cliente:', result.appointment.client.name, `(${result.appointment.client.email})`);
      console.log('Profesional:', result.appointment.professional.user.name);
      console.log('Fecha:', result.appointment.scheduledAt);
      console.log('');
      console.log('🎯 Ahora el email debería llegar a:', result.appointment.client.email);
    } else {
      console.log('❌ Error al crear cita:', result.error);
    }

  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testAppointmentWithCorrectUser();
