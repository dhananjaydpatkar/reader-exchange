
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testLocalityFlow() {
    try {
        console.log('--- Starting Locality Flow Test ---');

        // 1. Register User A in "Brahmand" (Not Live)
        const emailA = `user_a_${Date.now()}@test.com`;
        console.log(`1. Registering User A (Brahmand - Not Live)...`);
        // We need to fetch localities to find Brahmand ID
        const locRes = await axios.get(`${BASE_URL}/localities`);
        const brahmand = locRes.data.find((l: any) => l.name === 'Brahmand');
        const lodha = locRes.data.find((l: any) => l.name === 'Lodha Amara');

        if (!brahmand || !lodha) {
            console.error('❌ Failed to find seeded localities.');
            return;
        }

        const regA = await axios.post(`${BASE_URL}/auth/register`, {
            email: emailA,
            password: 'password123',
            name: 'User A',
            role: 'student',
            zipCode: '12345',
            localityId: brahmand.id
        });
        const tokenA = regA.data.token;
        console.log('User A registered.');

        // 2. Register User B in "Lodha Amara" (Live)
        const emailB = `user_b_${Date.now()}@test.com`;
        console.log(`2. Registering User B (Lodha Amara - Live)...`);
        const regB = await axios.post(`${BASE_URL}/auth/register`, {
            email: emailB,
            password: 'password123',
            name: 'User B',
            role: 'student',
            zipCode: '12345',
            localityId: lodha.id
        });
        const tokenB = regB.data.token;
        console.log('User B registered.');

        // 3. User B (Live) lists a book
        console.log('3. User B listing a book...');
        const bookRes = await axios.post(`${BASE_URL}/books`,
            {
                title: 'Live Locality Book',
                author: 'Test Author',
                isbn: '9876543210',
                condition: 'New',
                isForExchange: true
            },
            { headers: { Authorization: `Bearer ${tokenB}` } }
        );
        const bookId = bookRes.data.id;
        console.log('Book listed.');

        // 4. User A (Not Live) tries to request the book - Should FAIL
        console.log('4. User A (Not Live) requesting book... (Expect Failure)');
        try {
            await axios.post(`${BASE_URL}/exchange`,
                { bookId, type: 'exchange' },
                { headers: { Authorization: `Bearer ${tokenA}` } }
            );
            console.error('❌ FAILURE: Request should have been rejected!');
        } catch (error: any) {
            if (error.response && error.response.status === 400 && error.response.data.message.includes('not yet live')) {
                console.log('✅ SUCCESS: Request rejected as expected.');
            } else {
                console.error('❌ FAILURE: Unexpected error response:', error.response?.data || error.message);
            }
        }

        // 5. User A lists a book (Allowed)
        console.log('5. User A listing a book...');
        const bookARes = await axios.post(`${BASE_URL}/books`,
            {
                title: 'Non-Live Locality Book',
                author: 'Test Author A',
                isbn: '0451524934', // valid ISBN (1984)
                condition: 'New',
                isForExchange: true
            },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        const bookAId = bookARes.data.id;
        console.log('Book A listed.');

        // 6. User B (Live) tries to request User A's book - Should FAIL (Owner not live)
        console.log('6. User B (Live) requesting User A\'s book... (Expect Failure)');
        try {
            await axios.post(`${BASE_URL}/exchange`,
                { bookId: bookAId, type: 'exchange' },
                { headers: { Authorization: `Bearer ${tokenB}` } }
            );
            console.error('❌ FAILURE: Request should have been rejected!');
        } catch (error: any) {
            if (error.response && error.response.status === 400 && error.response.data.message.includes('not yet live')) {
                console.log('✅ SUCCESS: Request rejected as expected.');
            } else {
                console.error('❌ FAILURE: Unexpected error response:', error.response?.data || error.message);
            }
        }

    } catch (error: any) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

testLocalityFlow();
