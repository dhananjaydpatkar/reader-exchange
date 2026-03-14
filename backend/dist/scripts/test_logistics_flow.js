import axios from 'axios';
const BASE_URL = 'http://localhost:3001/api';
const runTest = async () => {
    try {
        const timestamp = Date.now();
        console.log('1. Registering Owner...');
        const ownerEmail = `owner_log_${timestamp}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: ownerEmail,
            password: 'password123',
            name: 'Owner Log',
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
        const requesterEmail = `requester_log_${timestamp}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: requesterEmail,
            password: 'password123',
            name: 'Requester Log',
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
        console.log('Request Approved.');
        console.log('6. Registering Local Admin...');
        const adminEmail = `admin_log_${timestamp}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: adminEmail,
            password: 'password123',
            name: 'Local Admin',
            role: 'local_admin',
            zipCode: '12345'
        });
        const loginAdmin = await axios.post(`${BASE_URL}/auth/login`, {
            email: adminEmail,
            password: 'password123'
        });
        const tokenAdmin = loginAdmin.data.token;
        console.log('7. Admin Updating Status to COLLECTED...');
        // Trying UPPERCASE to simulate typical frontend pattern involved in previous bug
        await axios.put(`${BASE_URL}/exchange/${requestId}`, {
            status: 'COLLECTED'
        }, { headers: { Authorization: `Bearer ${tokenAdmin}` } });
        console.log('✅ SUCCESS: Status updated to COLLECTED!');
    }
    catch (error) {
        console.error('❌ FAILURE:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
};
runTest();
//# sourceMappingURL=test_logistics_flow.js.map