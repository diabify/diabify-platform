const { PrismaClient } = require('@prisma/client');

async function deleteUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Deleting test users...');
    
    // Borrar usuarios específicos
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['jfcanor@gmail.com', 'kniq10@gmail.com']
        }
      }
    });
    
    console.log(`✅ Deleted ${deletedUsers.count} users`);
    
    // Mostrar usuarios restantes
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Remaining users:');
    remainingUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Verified: ${user.isVerified} - Created: ${user.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();
