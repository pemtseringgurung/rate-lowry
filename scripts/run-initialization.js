// Run this script with: node scripts/run-initialization.js
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting station initialization...');

// Path to the initialization script
const scriptPath = path.join(__dirname, 'init-stations.js');

// Use babel-node to run the ES module
const child = spawn('npx', ['babel-node', scriptPath], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Station initialization completed successfully');
  } else {
    console.error(`Station initialization failed with code ${code}`);
  }
}); 