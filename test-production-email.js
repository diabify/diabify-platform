const https = require('https');

async function testProductionEmail() {
  try {
    console.log('🚀 Testing email in production...');
    console.log('📧 Creating user: test.verification.url.final@gmail.com');
    console.log('🔗 Expected verification email URL: https://services.diabify.com/auth/verify?token=...');
    console.log('');
    console.log('✅ Go to https://services.diabify.com/register manually to test:');
    console.log('   - Email: test.verification.url.final@gmail.com');
    console.log('   - Password: TestPassword123!');
    console.log('   - Name: Usuario Test URLs');
    console.log('');
    console.log('� Then check the email to verify the URL is correct!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductionEmail();
