const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/admin/users',
            headers: {
                'Origin': 'https://ccs-profiling-system-official-m56zpgph1.vercel.app',
            },
            data: {
                name: 'Test Create',
                email: 'testcreate@ccstest.edu',
                password: 'password123',
                role: 'student',
                department: 'CS',
                course: 'BSCS'
            }
        });
        fs.writeFileSync('create_output.json', JSON.stringify({ status: res.status, data: res.data }, null, 2));
    } catch (e) {
        fs.writeFileSync('create_output.json', JSON.stringify({ error: e.message, status: e.response?.status, data: e.response?.data }, null, 2));
    }
}
test();
