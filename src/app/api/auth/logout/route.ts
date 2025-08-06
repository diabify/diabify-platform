import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logout exitoso'
    });

    // Limpiar cookie de admin
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expira inmediatamente
    });

    // Limpiar cookie de usuario
    response.cookies.set('userToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expira inmediatamente
      path: '/'
    });

    console.log('🔐 Usuario desconectado y cookies limpiadas');
    
    return response;

  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
