/**
 * ============================================================================
 * SOLARCARE PLATFORM - ONE-CLICK RUNNER
 * ============================================================================
 * Yeh script Backend API aur Frontend dono ko chala kar Chrome me open karti hai.
 * ============================================================================
 */

import { spawn, exec, execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distIndexPath = path.join(__dirname, 'dist', 'index.html');

// Handle uncaught exceptions cleanly
process.on('uncaughtException', (err) => {
  console.error('\n[SYSTEM EXCEPTION CAUGHT]:', err.message);
  console.log('Server ko dobara start kiya ja raha hai...\n');
});

console.log('================================================================');
console.log('        ☀️  SOLARCARE SMART SOLAR PLATFORM STARTING...  ☀️       ');
console.log('================================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 0. Ensure frontend is compiled
if (!fs.existsSync(distIndexPath)) {
  console.log('[BUILD] Frontend production bundle not found. Building now with Vite...');
  try {
    execSync(`${npmCmd} run build`, { stdio: 'inherit' });
    console.log('[BUILD] Frontend built successfully!\n');
  } catch (buildErr) {
    console.error('[BUILD ERROR] Could not build frontend:', buildErr.message);
  }
}

console.log('[1/2] Server chalu ho raha hai (Port: 5000)...');

// 1. Launch Backend Server (Serves both API and Frontend)
const serverProcess = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

serverProcess.on('error', (err) => {
  console.error('[ERROR] Backend server start karne me masla:', err);
});

// Helper: Check when server is ready, then open browser
function checkServer(attempts = 20) {
  if (attempts <= 0) {
    console.log('[INFO] Server ready! Chrome open kiya ja raha hai...');
    openBrowser();
    return;
  }

  const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
    if (res.statusCode === 200) {
      console.log('\n[SUCCESS] Server active ho chuka hai!');
      openBrowser();
    } else {
      setTimeout(() => checkServer(attempts - 1), 400);
    }
  });

  req.on('error', () => {
    setTimeout(() => checkServer(attempts - 1), 400);
  });
}

function openBrowser() {
  const url = 'http://127.0.0.1:5000';
  console.log('\n================================================================');
  console.log('🎉 SolarCare Platform is RUNNING & READY!');
  console.log('');
  console.log(`🌐 Chrome Address: ${url}`);
  console.log(`🔌 Localhost URL:   http://localhost:5000`);
  console.log('');
  console.log('⚠️  IMPORTANT NOTE:');
  console.log('   Is black window (terminal) ko BAND NA KAREIN jab tak aap');
  console.log('   platform use kar rahe hain. Band karne ke liye "Ctrl + C" press karein.');
  console.log('================================================================\n');

  if (isWindows) {
    exec(`start "" "${url}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

// Clean exit handling
process.on('SIGINT', () => {
  console.log('\nSolarCare platform band ho raha hai...');
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  process.exit(0);
});

// Start checking server readiness
setTimeout(() => checkServer(), 600);
