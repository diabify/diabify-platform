const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🧪 Creando datos de prueba para desarrollo...');

  try {
    // Limpiar datos existentes (solo en desarrollo)
    console.log('🗑️  Limpiando datos existentes...');
    await prisma.user.deleteMany();
    await prisma.newsletter.deleteMany();

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    
    const testUsers = [
      {
        email: 'admin@diabify-dev.com',
        name: 'Admin Desarrollo',
        role: 'ADMIN',
        isVerified: true,
        password: await bcrypt.hash('admin123', 10)
      },
      {
        email: 'user1@diabify-dev.com',
        name: 'Usuario Prueba 1',
        role: 'USER',
        isVerified: true,
        password: await bcrypt.hash('user123', 10)
      },
      {
        email: 'user2@diabify-dev.com',
        name: 'Usuario Prueba 2',
        role: 'USER',
        isVerified: false,
        password: await bcrypt.hash('user123', 10)
      },
      {
        email: 'professional@diabify-dev.com',
        name: 'Profesional Prueba',
        role: 'PROFESSIONAL',
        isVerified: true,
        password: await bcrypt.hash('prof123', 10)
      }
    ];

    for (const userData of testUsers) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✅ Usuario creado: ${user.email}`);
    }

    // Crear suscripciones de newsletter de prueba
    console.log('📧 Creando suscripciones de newsletter de prueba...');
    
    const newsletterSubs = [
      {
        email: 'newsletter1@diabify-dev.com',
        source: 'MAINTENANCE_PAGE',
        isVerified: true,
        isActive: true
      },
      {
        email: 'newsletter2@diabify-dev.com',
        source: 'LANDING_PAGE',
        isVerified: false,
        isActive: true
      }
    ];

    for (const subData of newsletterSubs) {
      const sub = await prisma.newsletter.create({
        data: subData
      });
      console.log(`✅ Suscripción creada: ${sub.email}`);
    }

    console.log('\\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('\\n📋 Credenciales de prueba:');
    console.log('Admin: admin@diabify-dev.com / admin123');
    console.log('Usuario: user1@diabify-dev.com / user123');
    console.log('Profesional: professional@diabify-dev.com / prof123');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

module.exports = { createTestData };
