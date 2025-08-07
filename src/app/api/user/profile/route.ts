import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('userToken')?.value;
    console.log('🔍 Token presente:', !!token);
    console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no encontrado' },
        { status: 401 }
      );
    }

    // Verificar el token
    try {
      console.log('🔍 Verificando token con JWT_SECRET...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as any;
      console.log('✅ Token decodificado:', { userId: decoded.userId, exp: decoded.exp });
      
      if (!decoded || !decoded.userId) {
        console.log('❌ Token sin userId');
        return NextResponse.json(
          { error: 'Token inválido - sin userId' },
          { status: 401 }
        );
      }

      // Buscar el usuario en la base de datos (sin select para obtener todos los campos)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        console.log('❌ Usuario no encontrado para ID:', decoded.userId);
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, isVerified: (user as any).isVerified });

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          isVerified: (user as any).isVerified || false
        }
      }, { status: 200 });

    } catch (jwtError) {
      console.error('❌ JWT verification error:', jwtError);
      console.log('🔍 JWT_SECRET being used:', process.env.JWT_SECRET ? 'ENV_VAR' : 'default-secret-key');
      console.log('🔍 Token that failed:', token.substring(0, 50) + '...');
      return NextResponse.json(
        { error: 'Token inválido', details: jwtError instanceof Error ? jwtError.message : 'JWT error' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
