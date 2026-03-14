
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyLocalityCreation() {
    try {
        console.log('Testing Locality Creation...');

        // 1. Create a new locality
        const uniqueName = `Test Locality ${Date.now()}`;
        const uniquePin = `99${Math.floor(Math.random() * 10000)}`;

        console.log(`Creating locality: ${uniqueName} (${uniquePin})`);

        const response = await axios.post(`${API_URL}/localities`, {
            name: uniqueName,
            pinCode: uniquePin,
            isLive: true
        });

        if (response.status === 201 && response.data.name === uniqueName) {
            console.log('✅ Locality created successfully!');
            console.log('Response:', response.data);
        } else {
            console.error('❌ Failed to create locality. Unexpected response:', response.status, response.data);
        }

    } catch (error: any) {
        console.error('❌ Error testing locality creation:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyLocalityCreation();
