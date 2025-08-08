const { PrismaClient } = require('@prisma/client');

async function testAppointmentsAPI() {
  console.log('🧪 PROBANDO API DE APPOINTMENTS');
  console.log('===============================');

  try {
    // Simular una petición HTTP usando Node.js nativo
    const http = require('http');
    
    console.log('📍 Probando endpoint GET /api/appointments...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/appointments',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ API de appointments funcionando correctamente');
          try {
            const jsonData = JSON.parse(data);
            console.log(`📅 Citas encontradas: ${jsonData.appointments?.length || 0}`);
          } catch (e) {
            console.log('📄 Respuesta recibida (texto):', data.substring(0, 200));
          }
        } else if (res.statusCode === 401) {
          console.log('🔒 Error de autenticación (esperado sin token)');
        } else if (res.statusCode === 500) {
          console.log('❌ Error 500 - Revisar logs del servidor');
          console.log('📄 Error:', data);
        } else {
          console.log(`📄 Respuesta (${res.statusCode}):`, data);
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Error: Servidor no accesible en localhost:3000');
        console.log('💡 Verifica que el servidor esté ejecutándose con: npm run dev');
      } else {
        console.log('❌ Error de conexión:', error.message);
      }
    });

    req.end();

    // Dar tiempo para la respuesta
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🔍 También verificando estado de la base de datos...');
    
    const prisma = new PrismaClient();
    
    const stats = {
      users: await prisma.user.count(),
      sessions: await prisma.session.count(),
      professionals: await prisma.professional.count(),
      notifications: await prisma.notification.count()
    };
    
    console.log('📊 Estadísticas de BD:');
    console.log(`   👥 Usuarios: ${stats.users}`);
    console.log(`   📅 Sesiones: ${stats.sessions}`);
    console.log(`   👨‍⚕️ Profesionales: ${stats.professionals}`);
    console.log(`   🔔 Notificaciones: ${stats.notifications}`);
    
    await prisma.$disconnect();

    console.log('\n✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar prueba
if (require.main === module) {
  testAppointmentsAPI()
    .then(() => {
      console.log('\n🎉 Prueba finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { testAppointmentsAPI };
