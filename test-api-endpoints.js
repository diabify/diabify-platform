// Test API endpoints
console.log('🧪 Testing API endpoints...');

// Test 1: Check if profile endpoint responds
fetch('https://services.diabify.com/api/user/profile')
  .then(response => {
    console.log('📡 Profile endpoint status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    return response.json();
  })
  .then(data => {
    console.log('📡 Profile response:', data);
  })
  .catch(error => {
    console.error('❌ Profile endpoint error:', error);
  });

// Test 2: Check if we can reach any API endpoint
fetch('https://services.diabify.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com'
  })
})
  .then(response => {
    console.log('📡 Register endpoint reachable:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📡 Register response:', data);
  })
  .catch(error => {
    console.error('❌ Register endpoint error:', error);
  });

console.log('🎯 Tests initiated. Check console for results.');
