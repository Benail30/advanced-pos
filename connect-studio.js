const { spawn } = require('child_process');
const { exec } = require('child_process');

console.log('Starting Drizzle Studio...');

// Start drizzle-kit studio with port 8000
const studio = spawn('npx', ['drizzle-kit', 'studio', '--port', '8000'], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
studio.on('error', (err) => {
  console.error('Failed to start Drizzle Studio:', err);
  process.exit(1);
});

// Wait a bit and then open the browser
setTimeout(() => {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${command} http://localhost:8000`);
  console.log('Opening browser to http://localhost:8000');
}, 2000); 