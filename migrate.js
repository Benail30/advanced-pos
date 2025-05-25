const { spawn } = require('child_process');
const path = require('path');

// Path to the migration file
const migrationFile = path.join(__dirname, 'src', 'lib', 'db', 'migrate.ts');

console.log('Running database migrations...');
console.log(`Migration file: ${migrationFile}`);

// Run the migration file using ts-node
const childProcess = spawn('npx', ['ts-node', migrationFile], {
  stdio: 'inherit',
  shell: true
});

childProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Migration completed successfully');
  } else {
    console.error(`Migration failed with code ${code}`);
    process.exit(code);
  }
}); 