import axios from 'axios';
const API_URL = 'http://localhost:3001/api';
let token = '';
async function verifyListingRestriction() {
    console.log('--- Verifying Mutually Exclusive Listing ---');
    try {
        const id = Math.random().toString(36).substring(7);
        const email = `usera_${id}@restriction.com`;
        // 0. Fetch valid LIVE locality
        const resLoc = await axios.get(`${API_URL}/localities`);
        const liveLocality = resLoc.data.find((l) => l.isLive);
        const localityId = liveLocality.id;
        // 1. Register
        console.log('1. Registering user...');
        const resReg = await axios.post(`${API_URL}/auth/register`, {
            name: 'Verification User',
            email: email,
            password: 'password123',
            city: 'Thane',
            zipCode: '400607',
            localityId: localityId
        });
        token = resReg.data.token;
        // 2. Attempt to list book as Give Away AND Sale (Should FAIL)
        console.log('2. Attempting to list as Give Away AND Sale...');
        try {
            await axios.post(`${API_URL}/books`, {
                isbn: '9780143130726',
                condition: 'Good',
                isForExchange: true,
                isForSale: true,
                askingPrice: 500
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('❌ FAILURE: Backend allowed Give Away + Sale');
        }
        catch (e) {
            console.log(`✅ SUCCESS: Backend rejected combination: ${e.response?.data?.message}`);
        }
        // 3. Attempt to list book as Give Away AND Rent (Should FAIL)
        console.log('3. Attempting to list as Give Away AND Rent...');
        try {
            await axios.post(`${API_URL}/books`, {
                isbn: '9780143130726',
                condition: 'Good',
                isForExchange: true,
                isForRent: true,
                rentPrice: 50
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('❌ FAILURE: Backend allowed Give Away + Rent');
        }
        catch (e) {
            console.log(`✅ SUCCESS: Backend rejected combination: ${e.response?.data?.message}`);
        }
        // 4. Attempt to list book as Sale AND Rent (Should PASS - they are allowed together)
        console.log('4. Attempting to list as Sale AND Rent...');
        try {
            const res = await axios.post(`${API_URL}/books`, {
                isbn: '9780143130726',
                condition: 'Good',
                isForExchange: false,
                isForSale: true,
                askingPrice: 500,
                isForRent: true,
                rentPrice: 50
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('✅ SUCCESS: Backend allowed Sale + Rent');
        }
        catch (e) {
            console.log(`❌ FAILURE: Backend rejected Sale + Rent: ${e.response?.data?.message}`);
        }
    }
    catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
    }
}
verifyListingRestriction();
//# sourceMappingURL=verify_listing_restriction.js.map