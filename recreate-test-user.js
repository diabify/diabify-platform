const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function recreateTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Deleting old test user...');
    
    // Borrar usuario anterior
    await prisma.user.deleteMany({
      where: {
        email: 'testuser@test.com'
      }
    });
    
    console.log('🔧 Creating new verified test user...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'testuser@test.com',
        name: 'Test User',
        password: hashedPassword,
        isVerified: true,
        role: 'USER'
      }
    });
    
    console.log('✅ New verified test user created:', testUser.id);
    console.log('📧 Email: testuser@test.com');
    console.log('🔑 Password: test123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateTestUser();
