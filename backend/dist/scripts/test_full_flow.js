import axios from 'axios';
const BASE_URL = 'http://localhost:3001/api';
const runTest = async () => {
    try {
        console.log('1. Registering User...');
        const uniqueEmail = `test_${Date.now()}@test.com`;
        const userPayload = {
            email: uniqueEmail,
            password: 'password123',
            name: 'Test Author',
            role: 'student',
            zipCode: '12345'
        };
        await axios.post(`${BASE_URL}/auth/register`, userPayload);
        console.log('User registered:', uniqueEmail);
        console.log('2. Logging In...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: uniqueEmail,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token received.');
        console.log('3. Adding Book...');
        const bookPayload = {
            isbn: '9780140328721',
            condition: 'Good',
            isForExchange: true,
            isForSale: false,
            isForRent: false
        };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const addRes = await axios.post(`${BASE_URL}/books`, bookPayload, config);
        const bookId = addRes.data.id;
        console.log('Book added. ID:', bookId);
        console.log('4. Fetching Book Details...');
        const getRes = await axios.get(`${BASE_URL}/books/${bookId}`, config);
        console.log('Book Details Retrieved:');
        console.log('isForExchange:', getRes.data.isForExchange);
        console.log('isForSale:', getRes.data.isForSale);
        console.log('isForRent:', getRes.data.isForRent);
        if (getRes.data.isForExchange === true) {
            console.log('✅ SUCCESS: isForExchange is TRUE');
        }
        else {
            console.log('❌ FAILURE: isForExchange is missing or false');
        }
        console.log('5. Registering User B (Requester)...');
        const userBEmail = `test_b_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            email: userBEmail,
            password: 'password123',
            name: 'Test Requester',
            role: 'student',
            zipCode: '12345'
        });
        const loginB = await axios.post(`${BASE_URL}/auth/login`, {
            email: userBEmail,
            password: 'password123'
        });
        const tokenB = loginB.data.token;
        console.log('User B logged in.');
        console.log('6. Requesting Book (as User B)...');
        const reqConfig = { headers: { Authorization: `Bearer ${tokenB}` } };
        // Trying with UPPERCASE as frontend does
        await axios.post(`${BASE_URL}/exchange`, {
            bookId: bookId,
            type: 'EXCHANGE'
        }, reqConfig);
        console.log('✅ SUCCESS: Request created successfully with UPPERCASE type');
    }
    catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
            if (error.response.data.message && error.response.data.message.includes('enum')) {
                console.log('❌ FAILURE: Enum mismatch detected!');
            }
        }
    }
};
runTest();
//# sourceMappingURL=test_full_flow.js.map