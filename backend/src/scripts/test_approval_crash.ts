
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

const runTest = async () => {
    try {
        const timestamp = Date.now();
        console.log('1. Registering Owner...');
        const ownerEmail = `owner_${timestamp}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: ownerEmail,
            password: 'password123',
            name: 'Owner',
            role: 'student',
            zipCode: '12345'
        });
        const loginOwner = await axios.post(`${BASE_URL}/auth/login`, {
            email: ownerEmail,
            password: 'password123'
        });
        const tokenOwner = loginOwner.data.token;

        console.log('2. Adding Book...');
        const bookRes = await axios.post(`${BASE_URL}/books`, {
            isbn: '9780140328721',
            condition: 'New',
            isForExchange: true
        }, { headers: { Authorization: `Bearer ${tokenOwner}` } });
        const bookId = bookRes.data.id;

        console.log('3. Registering Requester...');
        const requesterEmail = `requester_${timestamp}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: requesterEmail,
            password: 'password123',
            name: 'Requester',
            role: 'student',
            zipCode: '12345'
        });
        const loginRequester = await axios.post(`${BASE_URL}/auth/login`, {
            email: requesterEmail,
            password: 'password123'
        });
        const tokenRequester = loginRequester.data.token;

        console.log('4. Requesting Book...');
        const reqRes = await axios.post(`${BASE_URL}/exchange`, {
            bookId: bookId,
            type: 'exchange'
        }, { headers: { Authorization: `Bearer ${tokenRequester}` } });
        const requestId = reqRes.data.id;

        console.log('5. Owner Approving Request...');
        await axios.put(`${BASE_URL}/exchange/${requestId}`, {
            status: 'approved'
        }, { headers: { Authorization: `Bearer ${tokenOwner}` } });

        console.log('✅ SUCCESS: Request Approved!');

    } catch (error: any) {
        console.error('❌ FAILURE:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
};

runTest();
