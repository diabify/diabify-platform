const { PrismaClient } = require('@prisma/client');

async function cleanTestUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Cleaning test users...');
    
    // Borrar usuario de prueba
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@test.com']
        }
      }
    });
    
    console.log(`✅ Deleted ${deletedUsers.count} test users`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestUsers();
