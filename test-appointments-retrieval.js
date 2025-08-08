const fs = require('fs');

async function testAppointmentsRetrieval() {
  try {
    console.log('🔍 PROBANDO CONSULTA DE CITAS POR USUARIO');
    console.log('=========================================');
    console.log('');
    
    // Probar con el usuario correcto (kniq10@gmail.com)
    console.log('1️⃣ Consultando citas para usuario correcto (kniq10@gmail.com):');
    const correctResponse = await fetch('http://localhost:3000/api/appointments', {
      headers: {
        'x-user-id': 'cme1ktj9k0000jx042tvt5uwl' // kniq10@gmail.com
      }
    });
    
    if (correctResponse.ok) {
      const correctData = await correctResponse.json();
      console.log(`   ✅ Encontradas ${correctData.appointments.length} citas`);
      correctData.appointments.forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt.professional.user.name} - ${apt.scheduledAt}`);
        console.log(`      Cliente: ${apt.client.name} (${apt.client.email})`);
      });
    } else {
      console.log('   ❌ Error:', correctResponse.status);
    }
    
    console.log('');
    
    // Probar con el usuario incorrecto (jfcanor@gmail.com) para comparar
    console.log('2️⃣ Consultando citas para usuario incorrecto (jfcanor@gmail.com):');
    const wrongResponse = await fetch('http://localhost:3000/api/appointments', {
      headers: {
        'x-user-id': 'cmdzqd1nw0002uruc9jz698bo' // jfcanor@gmail.com
      }
    });
    
    if (wrongResponse.ok) {
      const wrongData = await wrongResponse.json();
      console.log(`   ✅ Encontradas ${wrongData.appointments.length} citas`);
      wrongData.appointments.forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt.professional.user.name} - ${apt.scheduledAt}`);
        console.log(`      Cliente: ${apt.client.name} (${apt.client.email})`);
      });
    } else {
      console.log('   ❌ Error:', wrongResponse.status);
    }

  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testAppointmentsRetrieval();
