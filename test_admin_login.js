const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        console.log("Attempting to login to Admin created user...");
        const loginRes = await axios.post('http://127.0.0.1:8000/api/login', {
            email: 'testcreate2@ccstest.edu',
            password: 'password123'
        });
        fs.writeFileSync('login_admin_user.json', JSON.stringify({ status: loginRes.status, data: loginRes.data }, null, 2));
    } catch (e) {
        fs.writeFileSync('login_admin_user.json', JSON.stringify({ error: e.message, status: e.response?.status, data: e.response?.data }, null, 2));
    }
}
test();
