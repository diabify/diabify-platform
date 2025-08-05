import { NextRequest, NextResponse } from 'next/server';

// Lista de IPs autorizadas para acceder a la versión completa
const ALLOWED_IPS = [
  '127.0.0.1',           // Localhost
  '::1',                 // IPv6 localhost
  '93.176.157.194',      // Tu IP actual (oficina)
  '147.161.65.28',       // Tu IP actual (casa)
  // Agrega aquí más IPs que necesites autorizar
  // '192.168.1.100',    // Ejemplo de IP de oficina
  // '203.0.113.1',      // Ejemplo de IP externa
];

// Rutas que siempre deben estar accesibles (página de mantenimiento)
const PUBLIC_ROUTES = [
  '/maintenance',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/preview',
  '/login',              // Página de login debe ser pública
];

// Rutas que requieren autenticación de administrador
const ADMIN_ROUTES: string[] = [
  '/newsletter',         // Dashboard del newsletter protegido
  '/dashboard',          // Panel de administración general
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acceso a rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // VERIFICACIÓN DE AUTENTICACIÓN PARA RUTAS DE ADMIN
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    // Obtener token del cookie o header
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar formato del token (básico)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token válido, continuar
    console.log('🔐 Token válido para:', pathname);
  }

  // VERIFICACIÓN DE IP PARA TODAS LAS DEMÁS RUTAS
  // Obtener IP del cliente
  const clientIP = getClientIP(request);
  
  // Verificar si hay un parámetro de preview válido
  const previewKey = request.nextUrl.searchParams.get('preview');
  const isPreviewAccess = previewKey === process.env.PREVIEW_SECRET_KEY;
  
  // Verificar si la IP está en la lista de permitidas
  const isAllowedIP = ALLOWED_IPS.includes(clientIP);
  
  // Si no está autorizado, redirigir a página de mantenimiento
  if (!isAllowedIP && !isPreviewAccess) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

function getClientIP(request: NextRequest): string {
  // Intentar obtener la IP real del cliente
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  // Fallback a localhost
  return '127.0.0.1';
}

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - api routes (manejadas por separado)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
