const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating test user for verification...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        isVerified: false,
        verificationToken: verificationToken,
        verificationExpires: verificationExpires,
        role: 'USER'
      }
    });
    
    console.log('✅ Test user created:', testUser.id);
    console.log('📧 Verification token:', verificationToken);
    console.log('🔗 Verification link:', `http://localhost:3000/auth/verify?token=${verificationToken}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
