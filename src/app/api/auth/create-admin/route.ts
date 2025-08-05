import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser } from '@/lib/auth';

// POST /api/auth/create-admin - Crear usuario administrador (solo para desarrollo/setup inicial)
export async function POST(request: NextRequest) {
  try {
    const { email, name, secretKey } = await request.json();

    // Verificar clave secreta (para evitar creación accidental de admins)
    if (secretKey !== process.env.ADMIN_CREATION_SECRET) {
      return NextResponse.json(
        { error: 'Clave secreta incorrecta' },
        { status: 401 }
      );
    }

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Crear usuario admin
    const adminUser = await createAdminUser(email, name);

    console.log('🔑 Admin user created:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });

    return NextResponse.json({
      message: 'Usuario administrador creado exitosamente',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    
    // Error de email duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear usuario administrador' },
      { status: 500 }
    );
  }
}
