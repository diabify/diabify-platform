/**
 * Utilidad para obtener la URL base de la aplicación
 * Detecta automáticamente el entorno y devuelve la URL correcta
 */
export function getBaseUrl(): string {
  // 1. En producción de Vercel, usar el dominio personalizado
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://services.diabify.com';
  }
  
  // 2. En preview/branch deployments de Vercel, usar VERCEL_URL
  if (process.env.VERCEL_URL && process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 3. Para desarrollo local, usar la variable de entorno o localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('Resolved Base URL:', getBaseUrl());
}
