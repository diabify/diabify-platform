const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 OBTENIENDO USUARIOS DISPONIBLES');
    console.log('===================================');
    
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, name: true, email: true },
      take: 5
    });
    
    console.log('Usuarios disponibles:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log('');
    });
    
    if (users.length > 0) {
      console.log(`✅ Usuario sugerido para testing: ${users[0].id}`);
    } else {
      console.log('❌ No hay usuarios disponibles');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
