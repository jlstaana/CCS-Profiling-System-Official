const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        // First login as admin
        const loginRes = await axios.post('http://127.0.0.1:8000/api/login', {
            email: 'admin123@ccs.edu',
            password: 'any'
        });
        const token = loginRes.data.token;
        
        console.log("Logged in:", loginRes.data.user.name);

        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/admin/users',
            headers: {
                'Origin': 'https://ccs-profiling-system-official-m56zpgph1.vercel.app',
                'Authorization': `Bearer ${token}`
            },
            data: {
                name: 'Test Create 2',
                email: 'testcreate2@ccstest.edu',
                password: 'password123',
                role: 'student',
                department: 'CS',
                course: 'BSCS'
            }
        });
        fs.writeFileSync('create_output.json', JSON.stringify({ status: res.status, data: res.data }, null, 2));
        console.log("Created User successfully. Check create_output.json");
    } catch (e) {
        fs.writeFileSync('create_output.json', JSON.stringify({ error: e.message, status: e.response?.status, data: e.response?.data }, null, 2));
        console.log("Failed to create user. Check create_output.json");
    }
}
test();
