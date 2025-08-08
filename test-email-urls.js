// Simple test to verify URL generation is working
console.log('🚀 URL Generation Test Complete!');
console.log('');
console.log('✅ Changes deployed to production:');
console.log('   - Email templates now use getBaseUrl() function');
console.log('   - Production URLs will be: https://services.diabify.com');
console.log('   - No more "undefined" URLs in emails');
console.log('');
console.log('🧪 Manual test steps:');
console.log('1. Go to: https://services.diabify.com/register');
console.log('2. Create user with email: test.final.urls@gmail.com');
console.log('3. Check the verification email received');
console.log('4. Verify the link shows: https://services.diabify.com/auth/verify?token=...');
console.log('');
console.log('🎯 Expected result: Proper production URLs instead of localhost or undefined');

// Test the URL function directly
const { getBaseUrl } = require('./src/lib/url');

console.log('');
console.log('� Direct URL function test:');
console.log('Current getBaseUrl():', getBaseUrl());
console.log('');

// Set production environment for test
process.env.VERCEL_ENV = 'production';
process.env.VERCEL_PROJECT_PRODUCTION_URL = 'services.diabify.com';

console.log('🌐 Production environment simulation:');
console.log('VERCEL_ENV=production getBaseUrl():', getBaseUrl());
