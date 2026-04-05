const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const res = await axios({
            method: 'OPTIONS',
            url: 'http://127.0.0.1:8000/api/login',
            headers: {
                'Origin': 'https://ccs-profiling-system-official-m56zpgph1.vercel.app',
                'Access-Control-Request-Method': 'POST'
            }
        });
        fs.writeFileSync('cors_output.json', JSON.stringify({ status: res.status, headers: res.headers }, null, 2));
    } catch (e) {
        fs.writeFileSync('cors_output.json', JSON.stringify({ error: e.message, status: e.response?.status, headers: e.response?.headers }, null, 2));
    }
}
test();
