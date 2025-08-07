const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createVerifiedTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating verified test user...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'testuser@test.com',
        name: 'Test User',
        password: hashedPassword,
        isVerified: true, // Ya verificado para testear directamente
        role: 'USER'
      }
    });
    
    console.log('✅ Verified test user created:', testUser.id);
    console.log('📧 Email: testuser@test.com');
    console.log('🔑 Password: test123');
    console.log('✅ Status: Verified');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createVerifiedTestUser();
