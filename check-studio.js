const http = require('http');
const { exec } = require('child_process');
const open = require('open');

// Check if Drizzle Studio is running
function checkStudio() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

// Start Drizzle Studio if it's not running
async function startStudio() {
  const isRunning = await checkStudio();
  
  if (!isRunning) {
    console.log('Drizzle Studio is not running. Starting it now...');
    
    // Start Drizzle Studio in the background
    const studio = exec('npx drizzle-kit studio --port 3000', (error) => {
      if (error) {
        console.error('Failed to start Drizzle Studio:', error);
        return;
      }
    });
    
    // Wait for Drizzle Studio to start
    console.log('Waiting for Drizzle Studio to start...');
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(async () => {
      attempts++;
      const isRunning = await checkStudio();
      
      if (isRunning) {
        clearInterval(checkInterval);
        console.log('Drizzle Studio is now running!');
        open('http://localhost:3000');
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('Failed to start Drizzle Studio after multiple attempts.');
        console.log('Please try running "npm run db:studio" manually.');
      } else {
        console.log(`Waiting for Drizzle Studio to start (attempt ${attempts}/${maxAttempts})...`);
      }
    }, 1000);
  } else {
    console.log('Drizzle Studio is already running!');
    open('http://localhost:3000');
  }
}

startStudio(); 