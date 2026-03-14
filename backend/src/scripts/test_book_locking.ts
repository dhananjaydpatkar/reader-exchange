import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
let tokenA = '';
let tokenB = '';
let bookId = '';
let requestId = '';

async function runTest() {
    console.log('--- Starting Book Locking Test ---');

    try {
        const id = Math.random().toString(36).substring(7);
        const emailA = `usera_${id}@lock.com`;
        const emailB = `userb_${id}@lock.com`;

        // 0. Fetch valid LIVE locality
        const resLoc = await axios.get(`${API_URL}/localities`);
        const liveLocality = resLoc.data.find((l: any) => l.isLive);
        if (!liveLocality) {
            throw new Error('No live locality found. Please seed or toggle one live.');
        }
        const localityId = liveLocality.id;
        console.log(`Using Live Locality: ${liveLocality.name} (${localityId})`);

        // 1. Register User A (Owner)
        console.log(`1. Registering User A (${emailA})...`);
        const resA = await axios.post(`${API_URL}/auth/register`, {
            name: 'User A',
            email: emailA,
            password: 'password123',
            city: 'Thane',
            zipCode: '400607',
            localityId: localityId
        });
        tokenA = resA.data.token;

        console.log('2. User A listing a book...');
        const resBook = await axios.post(`${API_URL}/books`, {
            isbn: '9780143130726',
            condition: 'Like New',
            isForSale: true,
            askingPrice: 500,
            isForRent: true,
            rentPrice: 50,
            isForExchange: true
        }, { headers: { Authorization: `Bearer ${tokenA}` } });
        bookId = resBook.data.id;
        console.log(`Book ID: ${bookId}, Status: ${resBook.data.status}`);

        // 3. Register User B (Requester)
        console.log(`3. Registering User B (${emailB})...`);
        const resB = await axios.post(`${API_URL}/auth/register`, {
            name: 'User B',
            email: emailB,
            password: 'password123',
            city: 'Thane',
            zipCode: '400607',
            localityId: localityId
        });
        tokenB = resB.data.token;

        // 4. User B requests Book 1 (BUY)
        console.log('4. User B requesting book (BUY)...');
        const resReq = await axios.post(`${API_URL}/exchange`, {
            bookId,
            type: 'buy'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });
        requestId = resReq.data.id;
        console.log(`Request created: ${requestId}`);

        // 5. Verify Book Status is PENDING
        console.log('5. Verifying Book Status...');
        const resBookVerify = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Current Book Status: ${resBookVerify.data.status}`);
        if (resBookVerify.data.status === 'pending') {
            console.log('✅ SUCCESS: Book is LOCKED (PENDING)');
        } else {
            console.log('❌ FAILURE: Book is NOT LOCKED');
        }

        // 6. User B cancels request
        console.log('6. User B cancelling request...');
        await axios.put(`${API_URL}/exchange/${requestId}`, {
            status: 'cancelled'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });

        // 7. Verify Book Status is AVAILABLE
        console.log('7. Verifying Book Status after cancellation...');
        const resBookVerify2 = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Current Book Status: ${resBookVerify2.data.status}`);
        if (resBookVerify2.data.status === 'available') {
            console.log('✅ SUCCESS: Book is UNLOCKED (AVAILABLE)');
        } else {
            console.log('❌ FAILURE: Book is STILL LOCKED');
        }

        // --- NEW: EXCHANGE (Give Away) Locking ---
        console.log('\n--- Testing EXCHANGE (Give Away) Locking ---');
        console.log('8. User B requesting book (EXCHANGE)...');
        const resReqEx = await axios.post(`${API_URL}/exchange`, {
            bookId,
            type: 'exchange'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });
        const requestExId = resReqEx.data.id;

        const resBookEx = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Current Book Status: ${resBookEx.data.status}`);
        if (resBookEx.data.status === 'pending') {
            console.log('✅ SUCCESS: Give Away request LOCKED the book');
        }

        console.log('9. User A rejecting EXCHANGE request...');
        await axios.put(`${API_URL}/exchange/${requestExId}`, {
            status: 'rejected'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });

        const resBookEx2 = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Current Book Status: ${resBookEx2.data.status}`);
        if (resBookEx2.data.status === 'available') {
            console.log('✅ SUCCESS: Rejected request UNLOCKED the book');
        }

        // --- NEW: RENT -> RETURNED Flow ---
        console.log('\n--- Testing RENT -> RETURNED Lifecycle ---');
        console.log('10. User B requesting book (RENT)...');
        const resReqRent = await axios.post(`${API_URL}/exchange`, {
            bookId,
            type: 'rent'
        }, { headers: { Authorization: `Bearer ${tokenB}` } });
        const requestRentId = resReqRent.data.id;

        console.log('11. Owner Approving and Logistics Delivering (Simulated)...');
        await axios.put(`${API_URL}/exchange/${requestRentId}`, { status: 'approved' }, { headers: { Authorization: `Bearer ${tokenA}` } });
        await axios.put(`${API_URL}/exchange/${requestRentId}`, { status: 'delivered' }, { headers: { Authorization: `Bearer ${tokenA}` } }); // Owner simplified as admin for test

        const resBookRent = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Current Book Status: ${resBookRent.data.status}`);
        if (resBookRent.data.status === 'exchanged') {
            console.log('✅ SUCCESS: Book is Rented Out (EXCHANGED)');
        }

        console.log('12. Processing RETURNED status...');
        await axios.put(`${API_URL}/exchange/${requestRentId}`, {
            status: 'returned'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });

        const resBookFinal = await axios.get(`${API_URL}/books/${bookId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log(`Final Book Status: ${resBookFinal.data.status}`);
        if (resBookFinal.data.status === 'available') {
            console.log('✅ SUCCESS: Returned book is AVAILABLE again');
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

runTest();
