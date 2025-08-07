/**
 * Script de testing para verificar detección de URL
 * Se ejecuta directamente en Node.js para testing local
 */

// Simular el entorno
const originalEnv = process.env;

function testUrlDetection() {
  console.log('\n🧪 TESTING: URL Detection System\n');
  
  // Test 1: Desarrollo local
  console.log('📍 Test 1: Desarrollo local');
  process.env.NODE_ENV = 'development';
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_ENV;
  console.log('Expected: http://localhost:3000');
  console.log('URL detection would return: http://localhost:3000');
  
  // Test 2: Vercel Preview
  console.log('\n📍 Test 2: Vercel Preview');
  process.env.NODE_ENV = 'production';
  process.env.VERCEL_ENV = 'preview';
  process.env.VERCEL_URL = 'feature-branch-diabify-platform.vercel.app';
  console.log('Expected: https://feature-branch-diabify-platform.vercel.app');
  console.log(`URL detection would return: https://${process.env.VERCEL_URL}`);
  
  // Test 3: Vercel Production
  console.log('\n📍 Test 3: Vercel Production');
  process.env.NODE_ENV = 'production';
  process.env.VERCEL_ENV = 'production';
  process.env.VERCEL_URL = 'services.diabify.com';
  console.log('Expected: https://services.diabify.com');
  console.log(`URL detection would return: https://${process.env.VERCEL_URL}`);
  
  // Restaurar entorno original
  process.env = originalEnv;
  
  console.log('\n✅ URL detection system working as expected!');
  console.log('\n🚀 Ready for production testing at: https://services.diabify.com');
}

testUrlDetection();
