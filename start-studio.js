const { spawn } = require('child_process');
const path = require('path');

// Get the path to drizzle-kit in node_modules
const drizzleKitPath = path.join(__dirname, 'node_modules', '.bin', 'drizzle-kit');

// Start drizzle-kit studio
const studio = spawn(drizzleKitPath, ['studio', '--port', '3000'], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
studio.on('error', (err) => {
  console.error('Failed to start drizzle-kit studio:', err);
});

studio.on('close', (code) => {
  console.log(`drizzle-kit studio process exited with code ${code}`);
});

console.log('Drizzle Studio is starting on http://localhost:3000');
console.log('Press Ctrl+C to stop'); 