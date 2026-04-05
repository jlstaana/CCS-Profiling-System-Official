const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        console.log("Registering test user...");
        const regRes = await axios.post('http://127.0.0.1:8000/api/register', {
            name: 'Test Login User',
            email: 'testlogin@ccs.edu',
            password: 'password123',
            password_confirmation: 'password123',
            role: 'student'
        });
        console.log("Registered:", regRes.data);

        console.log("Attempting to login...");
        const loginRes = await axios.post('http://127.0.0.1:8000/api/login', {
            email: 'testlogin@ccs.edu',
            password: 'password123'
        });
        console.log("Logged in:", loginRes.data);
    } catch (e) {
        console.log("Error:", e.response ? e.response.data : e.message);
    }
}
test();
