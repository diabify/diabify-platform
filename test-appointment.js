const fs = require('fs');

async function testAppointmentCreation() {
  const appointmentData = {
    professionalId: "cmdyylo3e000bursoz1y5nlv4",
    sessionTemplateId: "cme1tfrxw0002ur2wyk64jyy8", 
    scheduledAt: "2025-08-15T10:00:00.000Z",
    notes: "Prueba de reserva desde script"
  };

  try {
    console.log('🔧 PROBANDO CREACIÓN DE CITA');
    console.log('============================');
    console.log('Datos a enviar:', JSON.stringify(appointmentData, null, 2));
    console.log('');

    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'cmdzqd1nw0002uruc9jz698bo' // Usuario real
      },
      body: JSON.stringify(appointmentData)
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const result = await response.json();
    console.log('Respuesta:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ ¡Cita creada exitosamente!');
    } else {
      console.log('❌ Error al crear cita:', result.error);
    }

  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testAppointmentCreation();
