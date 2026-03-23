const https = require('https');
const data = JSON.stringify({
  messages: [{ role: 'user', content: 'respond with a 50 word story' }],
  model: 'gemini-1.5-flash',
  streaming: true,
  presetId: 'general'
});
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/copilot',
  method: 'POST',
  rejectUnauthorized: false,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d.toString());
  });
  res.on('end', () => {
    console.log('\n--- END ---');
  });
});
req.on('error', (e) => console.error(e));
req.write(data);
req.end();
