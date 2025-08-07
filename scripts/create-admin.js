import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'administracion@diabify.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      return;
    }
    
    // Generar password seguro
    const adminPassword = 'Admin2025$Diabify';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Crear usuario admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'administracion@diabify.com',
        name: 'Administrador Diabify',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Rol: ${adminUser.role}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda esta información de forma segura');
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
