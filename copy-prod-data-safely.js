const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Conexiones a ambas bases de datos
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.byiwyjcfekecoyuitxjn:cqj-3CzAVn%23ciQ5@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.lzmydqtntiwngcosyvtv:56eQqEmaY49H3hPd@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

// Función para anonimizar emails
function anonymizeEmail(email, index) {
  const domain = '@diabify-dev.com';
  const prefix = `user${index.toString().padStart(3, '0')}`;
  return `${prefix}${domain}`;
}

// Función para generar nombres ficticios
function generateFakeName(index) {
  const nombres = ['Ana', 'Carlos', 'María', 'José', 'Laura', 'David', 'Carmen', 'Antonio', 'Isabel', 'Francisco'];
  const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín'];
  
  const nombre = nombres[index % nombres.length];
  const apellido = apellidos[Math.floor(index / nombres.length) % apellidos.length];
  return `${nombre} ${apellido}`;
}

async function copyProductionDataDirectly() {
  console.log('🔄 COPIANDO DATOS DE PRODUCCIÓN DIRECTAMENTE');
  console.log('=============================================');
  console.log('⚠️  ADVERTENCIA: Datos personales REALES serán copiados');
  console.log('⚠️  RIESGO: Información sensible en ambiente de desarrollo');
  console.log('⚠️  ASEGÚRATE: De proteger estos datos adecuadamente');
  console.log('');

  // Confirmación de seguridad
  console.log('❗ CONFIRMA QUE ENTIENDES LOS RIESGOS:');
  console.log('   - Datos personales reales en desarrollo');
  console.log('   - Información médica sensible');
  console.log('   - Emails reales de usuarios');
  console.log('   - Posibles violaciones de privacidad');
  console.log('');

  try {
    // 1. Obtener estadísticas de producción
    console.log('📊 Obteniendo estadísticas de producción...');
    const prodStats = {
      users: await prodPrisma.user.count(),
      newsletters: await prodPrisma.newsletter.count(),
      professionals: await prodPrisma.professional.count(),
      sessions: await prodPrisma.session.count()
    };
    
    console.log(`   👥 Usuarios: ${prodStats.users}`);
    console.log(`   📧 Newsletter: ${prodStats.newsletters}`);
    console.log(`   👨‍⚕️ Profesionales: ${prodStats.professionals}`);
    console.log(`   📅 Sesiones: ${prodStats.sessions}`);
    console.log('');

    // 2. Limpiar desarrollo
    console.log('🗑️  Limpiando base de datos de desarrollo...');
    await devPrisma.session.deleteMany();
    await devPrisma.professional.deleteMany();
    await devPrisma.user.deleteMany();
    await devPrisma.newsletter.deleteMany();
    console.log('   ✅ Datos eliminados');
    console.log('');

    // 3. Copiar usuarios (SIN anonimizar - DATOS REALES)
    console.log('👥 Copiando usuarios (DATOS REALES)...');
    const prodUsers = await prodPrisma.user.findMany();

    for (let i = 0; i < prodUsers.length; i++) {
      const prodUser = prodUsers[i];
      
      // Copiar usuario exactamente como está, pero limpiar tokens sensibles
      const userData = {
        id: prodUser.id,
        email: prodUser.email, // EMAIL REAL
        name: prodUser.name,   // NOMBRE REAL
        avatar: prodUser.avatar,
        role: prodUser.role,
        createdAt: prodUser.createdAt,
        updatedAt: prodUser.updatedAt,
        isVerified: prodUser.isVerified,
        password: prodUser.password, // PASSWORD HASH REAL
        verificationExpires: prodUser.verificationExpires,
        // IMPORTANTE: Limpiar tokens sensibles para seguridad
        verificationToken: null, // Limpiado por seguridad
        resetToken: null,        // Limpiado por seguridad
        resetTokenExpiry: null   // Limpiado por seguridad
      };

      await devPrisma.user.create({ data: userData });
      
      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ ${i + 1}/${prodUsers.length} usuarios procesados`);
      }
    }
    console.log(`   ✅ ${prodUsers.length} usuarios copiados CON DATOS REALES`);
    console.log('   ⚠️  TOKENS DE SEGURIDAD LIMPIADOS (verificación/reset)');
    console.log('');

    // 4. Copiar newsletter (EMAILS REALES)
    console.log('📧 Copiando suscripciones de newsletter (EMAILS REALES)...');
    const prodNewsletters = await prodPrisma.newsletter.findMany();

    for (let i = 0; i < prodNewsletters.length; i++) {
      const prodNews = prodNewsletters[i];
      
      const newsletterData = {
        id: prodNews.id,
        email: prodNews.email, // EMAIL REAL
        source: prodNews.source,
        ipAddress: prodNews.ipAddress,
        userAgent: prodNews.userAgent,
        isActive: prodNews.isActive,
        isVerified: prodNews.isVerified,
        spamScore: prodNews.spamScore,
        isBlocked: prodNews.isBlocked,
        blockReason: prodNews.blockReason,
        createdAt: prodNews.createdAt,
        updatedAt: prodNews.updatedAt,
        verifiedAt: prodNews.verifiedAt,
        interests: prodNews.interests,
        // IMPORTANTE: Limpiar token sensible
        verifyToken: null // Limpiado por seguridad
      };

      await devPrisma.newsletter.create({ data: newsletterData });
    }
    console.log(`   ✅ ${prodNewsletters.length} suscripciones copiadas CON EMAILS REALES`);
    console.log('   ⚠️  TOKENS DE VERIFICACIÓN LIMPIADOS');
    console.log('');

    // 5. Copiar profesionales si existen
    if (prodStats.professionals > 0) {
      console.log('👨‍⚕️ Copiando profesionales...');
      const prodProfessionals = await prodPrisma.professional.findMany();
      
      for (const prodProf of prodProfessionals) {
        await devPrisma.professional.create({
          data: {
            id: prodProf.id,
            userId: prodProf.userId,
            type: prodProf.type,
            description: prodProf.description,
            experience: prodProf.experience,
            rating: prodProf.rating,
            hourlyRate: prodProf.hourlyRate,
            verified: prodProf.verified,
            verifiedAt: prodProf.verifiedAt,
            availability: prodProf.availability,
            createdAt: prodProf.createdAt,
            updatedAt: prodProf.updatedAt
          }
        });
      }
      console.log(`   ✅ ${prodProfessionals.length} profesionales copiados`);
      console.log('');
    }

    console.log('🎉 ¡COPIA DIRECTA COMPLETADA!');
    console.log('');
    console.log('📋 RESUMEN:');
    console.log(`✅ ${prodUsers.length} usuarios CON DATOS PERSONALES REALES`);
    console.log(`✅ ${prodNewsletters.length} suscripciones CON EMAILS REALES`);
    console.log('✅ Contraseñas originales mantenidas');
    console.log('✅ Tokens sensibles LIMPIADOS por seguridad');
    console.log('');
    console.log('⚠️  IMPORTANTE RECORDAR:');
    console.log('   - NO enviar emails desde desarrollo');
    console.log('   - PROTEGER esta base de datos');
    console.log('   - CONSIDERAR regulaciones de privacidad');
    console.log('   - USUARIOS pueden login con sus passwords reales');

  } catch (error) {
    console.error('❌ Error en copia directa:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
    await devPrisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  copyProductionDataDirectly()
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en proceso:', error);
      process.exit(1);
    });
}

module.exports = { copyProductionDataDirectly };
