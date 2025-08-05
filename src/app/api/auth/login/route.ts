import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Contraseña de administrador (en producción debería estar en variables de entorno)
const ADMIN_PASSWORD = 'Diabify2024!Admin';

// Función para generar token seguro
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Función para hash de password (simple comparación por ahora)
function verifyPassword(inputPassword: string): boolean {
  return inputPassword === ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Validar que se envíe la contraseña
    if (!password) {
      return NextResponse.json(
        { error: 'La contraseña es requerida' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generar token
    const token = generateToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

    // Crear respuesta con cookie
    const response = NextResponse.json({
      token,
      expiresAt,
      message: 'Autenticación exitosa'
    });

    // Establecer cookie httpOnly para seguridad
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 horas en segundos
    });

    console.log('🔐 Token generado y cookie establecida:', token.substring(0, 8) + '...');
    
    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para verificar token (para uso en middleware)
export function verifyToken(token: string): boolean {
  // En una implementación real, verificarías el token contra la base de datos
  // Por simplicidad, cualquier token de 64 caracteres hex es válido
  return /^[a-f0-9]{64}$/.test(token);
}
