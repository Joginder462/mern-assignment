// Test script for auth microservice
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAuthMicroservice() {
    console.log('🧪 Testing Auth Microservice...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Health check passed:', healthResponse.data);
        console.log('');

        // Test 2: Register new admin
        console.log('2. Testing admin registration...');
        const registerData = {
            name: 'Test Admin',
            email: 'test@example.com',
            password: 'password123'
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
            console.log('✅ Registration successful:', registerResponse.data);
            console.log('');
        } catch (error) {
            if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
                console.log('ℹ️ Admin already exists, continuing with login test...');
            } else {
                throw error;
            }
        }

        // Test 3: Login
        console.log('3. Testing admin login...');
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };

        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        console.log('✅ Login successful:', loginResponse.data);
        
        const token = loginResponse.data.data.token;
        console.log('');

        // Test 4: Protected route
        console.log('4. Testing protected route...');
        const protectedResponse = await axios.get(`${BASE_URL}/auth/admin-only`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Protected route accessed:', protectedResponse.data);
        console.log('');

        // Test 5: Health endpoint
        console.log('5. Testing auth health endpoint...');
        const authHealthResponse = await axios.get(`${BASE_URL}/auth/health`);
        console.log('✅ Auth health check passed:', authHealthResponse.data);
        console.log('');

        console.log('🎉 All tests passed! Auth microservice is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    testAuthMicroservice();
}

module.exports = { testAuthMicroservice };
