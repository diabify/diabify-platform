const { PrismaClient } = require('@prisma/client');

async function assignTemplatesToProfessionals() {
  console.log('🔧 ASIGNANDO PLANTILLAS A PROFESIONALES');
  console.log('=======================================');

  try {
    const prisma = new PrismaClient();

    // 1. Obtener plantilla existente
    let sessionTemplate = await prisma.sessionTemplate.findFirst();
    
    if (!sessionTemplate) {
      console.log('📋 Creando plantilla de sesión...');
      
      // Crear duration si no existe
      let duration = await prisma.sessionDuration.findFirst();
      if (!duration) {
        duration = await prisma.sessionDuration.create({
          data: {
            name: '60 minutos',
            minutes: 60,
            isActive: true
          }
        });
        console.log('   ⏱️ Duración creada: 60 minutos');
      }

      sessionTemplate = await prisma.sessionTemplate.create({
        data: {
          title: 'Consulta General',
          description: 'Consulta general personalizada',
          basePrice: 50.0,
          durationId: duration.id,
          category: 'CONSULTATION',
          modality: 'ONLINE',
          isActive: true
        }
      });
      console.log('   ✅ Plantilla de sesión creada');
    }

    // 2. Obtener todos los profesionales
    const professionals = await prisma.professional.findMany({
      include: {
        user: { select: { name: true } },
        sessionTemplates: true
      }
    });

    console.log(`\n👨‍⚕️ Procesando ${professionals.length} profesionales...`);

    // 3. Asignar plantilla a cada profesional que no la tenga
    for (const professional of professionals) {
      const hasTemplate = professional.sessionTemplates.some(
        pt => pt.sessionTemplateId === sessionTemplate.id
      );

      if (!hasTemplate) {
        await prisma.professionalSessionTemplate.create({
          data: {
            professionalId: professional.id,
            sessionTemplateId: sessionTemplate.id,
            customPrice: null, // Usar precio base
            isEnabled: true
          }
        });
        
        console.log(`   ✅ ${professional.user.name} - Plantilla asignada`);
      } else {
        console.log(`   ⚪ ${professional.user.name} - Ya tiene plantilla`);
      }
    }

    // 4. Verificar asignaciones
    console.log('\n📊 Verificando asignaciones...');
    
    const professionalsWithTemplates = await prisma.professional.findMany({
      include: {
        user: { select: { name: true } },
        sessionTemplates: {
          include: {
            sessionTemplate: true
          }
        }
      }
    });

    professionalsWithTemplates.forEach(prof => {
      console.log(`   ${prof.user.name}: ${prof.sessionTemplates.length} plantilla(s)`);
      prof.sessionTemplates.forEach(template => {
        const price = template.customPrice || template.sessionTemplate.basePrice;
        console.log(`      - ${template.sessionTemplate.title} (€${price})`);
      });
    });

    await prisma.$disconnect();

    console.log('\n🎉 ¡PLANTILLAS ASIGNADAS EXITOSAMENTE!');
    console.log('\n✅ Beneficios:');
    console.log('   - Los profesionales pueden recibir citas');
    console.log('   - El sistema de reservas funcionará completamente');
    console.log('   - Los emails de confirmación incluirán información correcta');

  } catch (error) {
    console.error('❌ Error asignando plantillas:', error);
  }
}

// Ejecutar script
if (require.main === module) {
  assignTemplatesToProfessionals()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { assignTemplatesToProfessionals };
