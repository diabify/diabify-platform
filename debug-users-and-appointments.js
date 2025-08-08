const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 IDENTIFICANDO USUARIOS POR EMAIL');
    console.log('==================================');
    
    const targetEmail = 'kniq10@gmail.com';
    const wrongEmail = 'jfcanor@gmail.com';
    
    const [correctUser, wrongUser] = await Promise.all([
      prisma.user.findUnique({
        where: { email: targetEmail },
        select: { id: true, name: true, email: true }
      }),
      prisma.user.findUnique({
        where: { email: wrongEmail },
        select: { id: true, name: true, email: true }
      })
    ]);
    
    console.log('👤 Usuario que debería recibir el email (kniq10@gmail.com):');
    if (correctUser) {
      console.log(`   ID: ${correctUser.id}`);
      console.log(`   Nombre: ${correctUser.name}`);
      console.log(`   Email: ${correctUser.email}`);
    } else {
      console.log('   ❌ No encontrado');
    }
    
    console.log('');
    console.log('👤 Usuario que está recibiendo el email (jfcanor@gmail.com):');
    if (wrongUser) {
      console.log(`   ID: ${wrongUser.id}`);
      console.log(`   Nombre: ${wrongUser.name}`);
      console.log(`   Email: ${wrongUser.email}`);
    } else {
      console.log('   ❌ No encontrado');
    }
    
    console.log('');
    console.log('📋 TODAS LAS CITAS EXISTENTES:');
    console.log('=============================');
    
    const appointments = await prisma.session.findMany({
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        professional: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. Cita ID: ${apt.id}`);
      console.log(`   Cliente: ${apt.client.name} (${apt.client.email})`);
      console.log(`   Profesional: ${apt.professional.user.name}`);
      console.log(`   Fecha: ${apt.scheduledAt}`);
      console.log(`   Estado: ${apt.status}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
