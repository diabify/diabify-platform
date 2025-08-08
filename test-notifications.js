const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log('🧪 PROBANDO SISTEMA DE NOTIFICACIONES');
  console.log('=====================================');

  try {
    // 1. Verificar que el modelo Notification está disponible
    console.log('📋 Verificando modelo Notification...');
    const notificationCount = await prisma.notification.count();
    console.log(`   ✅ Modelo disponible. Notificaciones existentes: ${notificationCount}`);

    // 2. Buscar una cita programada para probar
    console.log('\n📅 Buscando citas programadas...');
    const appointments = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date() // Solo citas futuras
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      take: 1
    });

    if (appointments.length === 0) {
      console.log('   ⚠️  No se encontraron citas programadas futuras');
      console.log('   💡 Creando cita de prueba...');
      
      // Crear usuario de prueba si no existe
      let testUser = await prisma.user.findFirst({
        where: { email: 'test@diabify.com' }
      });

      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            email: 'test@diabify.com',
            name: 'Usuario Test',
            role: 'USER',
            isVerified: true,
            password: '$2a$10$dummy.hash.for.testing'
          }
        });
        console.log('   ✅ Usuario de prueba creado');
      }

      // Buscar un profesional
      let professional = await prisma.professional.findFirst({
        include: {
          user: true
        }
      });

      if (!professional) {
        // Crear profesional de prueba
        const profUser = await prisma.user.create({
          data: {
            email: 'prof-test@diabify.com',
            name: 'Profesional Test',
            role: 'PROFESSIONAL',
            isVerified: true,
            password: '$2a$10$dummy.hash.for.testing'
          }
        });

        professional = await prisma.professional.create({
          data: {
            userId: profUser.id,
            type: 'NUTRICIONISTA',
            description: 'Profesional de prueba',
            experience: 5,
            rating: 4.5,
            hourlyRate: 50.0,
            verified: true
          },
          include: {
            user: true
          }
        });
        console.log('   ✅ Profesional de prueba creado');
      }

      // Crear cita de prueba
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 25); // 25 horas en el futuro

      // Buscar o crear un sessionTemplate
      let sessionTemplate = await prisma.sessionTemplate.findFirst();
      
      if (!sessionTemplate) {
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
        }

        sessionTemplate = await prisma.sessionTemplate.create({
          data: {
            title: 'Consulta General',
            description: 'Consulta general de prueba',
            basePrice: 50.0,
            durationId: duration.id,
            category: 'CONSULTATION',
            modality: 'ONLINE',
            isActive: true
          }
        });
        console.log('   ✅ Template de sesión creado');
      }

      const testAppointment = await prisma.session.create({
        data: {
          clientId: testUser.id,
          professionalId: professional.id,
          sessionTemplateId: sessionTemplate.id,
          title: 'Consulta de Prueba',
          description: 'Cita creada para probar notificaciones',
          scheduledAt: futureDate,
          duration: 60,
          status: 'SCHEDULED',
          finalPrice: 50.0
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          professional: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      console.log(`   ✅ Cita de prueba creada: ${testAppointment.id}`);
      appointments.push(testAppointment);
    }

    const appointment = appointments[0];
    console.log(`   ✅ Usando cita: ${appointment.id}`);
    console.log(`   📅 Programada para: ${appointment.scheduledAt.toLocaleString('es-ES')}`);

    // 3. Probar creación de notificación directa
    console.log('\n🔔 Probando creación de notificación...');
    const testNotification = await prisma.notification.create({
      data: {
        sessionId: appointment.id,
        userId: appointment.clientId,
        type: 'TEST_NOTIFICATION',
        title: 'Notificación de Prueba',
        message: `Esta es una notificación de prueba para la cita ${appointment.title}`,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    console.log(`   ✅ Notificación creada: ${testNotification.id}`);

    // 4. Verificar que se puede leer la notificación con relaciones
    console.log('\n📖 Verificando lectura con relaciones...');
    const notificationWithRelations = await prisma.notification.findUnique({
      where: { id: testNotification.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        session: {
          select: {
            title: true,
            scheduledAt: true
          }
        }
      }
    });

    console.log('   ✅ Notificación con relaciones:');
    console.log(`      - Usuario: ${notificationWithRelations.user.name}`);
    console.log(`      - Cita: ${notificationWithRelations.session.title}`);
    console.log(`      - Fecha: ${notificationWithRelations.session.scheduledAt.toLocaleString('es-ES')}`);

    // 5. Probar consultas de notificaciones por usuario
    console.log('\n👤 Probando consultas por usuario...');
    const userNotifications = await prisma.notification.findMany({
      where: {
        userId: appointment.clientId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`   ✅ ${userNotifications.length} notificaciones encontradas para el usuario`);

    console.log('\n🎉 ¡SISTEMA DE NOTIFICACIONES FUNCIONANDO CORRECTAMENTE!');
    console.log('\n📋 Resumen de la prueba:');
    console.log(`✅ Modelo Notification operativo`);
    console.log(`✅ Relaciones con User y Session funcionando`);
    console.log(`✅ Creación de notificaciones exitosa`);
    console.log(`✅ Consultas con JOIN funcionando`);
    console.log(`✅ Cita de prueba: ${appointment.id}`);
    console.log(`✅ Notificación de prueba: ${testNotification.id}`);

  } catch (error) {
    console.error('❌ Error en prueba de notificaciones:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
if (require.main === module) {
  testNotificationSystem()
    .then(() => {
      console.log('\n✅ Prueba completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en prueba:', error);
      process.exit(1);
    });
}

module.exports = { testNotificationSystem };
