/**
 * Utilidad para obtener la URL base de la aplicación
 * Detecta automáticamente el entorno y devuelve la URL correcta
 */

export function getBaseUrl(): string {
  // 1. Si está definida explícitamente, usarla
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. En Vercel (producción/preview), usar la URL de Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Para desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // 4. Fallback para producción custom
  return 'https://services.diabify.com';
}

export function getApiBaseUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api`;
}

/**
 * Para usar en el lado del cliente (componentes React)
 */
export function getClientBaseUrl(): string {
  // En el cliente, podemos usar window.location
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // En SSR, usar la función normal
  return getBaseUrl();
}

/**
 * Logs para debugging - muestra qué URL se está usando
 */
export function debugUrls() {
  console.log('🔍 URL Debug Info:');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Resolved Base URL:', getBaseUrl());
}
