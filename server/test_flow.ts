import axios from 'axios';

async function run() {
  try {
    const email = `test_${Date.now()}@example.com`;
    console.log('Registering user:', email);
    await axios.post('http://localhost:8000/api/auth/register', {
      name: 'Test User',
      email: email,
      password: 'password123'
    });
    console.log('Registered successfully.');

    console.log('Requesting password reset...');
    const res = await axios.post('http://localhost:8000/api/auth/forgot-password', {
      email: email
    });
    console.log('Reset response:', res.status, res.data);
  } catch (err: any) {
    console.error('Error in flow:', err.response?.status, err.response?.data || err.message);
  }
}

run();
