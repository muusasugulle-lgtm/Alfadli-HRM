// Quick test script to capture npm errors
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const logPath = path.join(__dirname, '.cursor', 'debug.log');
const serverEndpoint = 'http://127.0.0.1:7242/ingest/507dbd9e-47f3-4c09-9169-184f6ea2c007';

function log(data) {
  const entry = { ...data, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1' };
  const line = JSON.stringify(entry) + os.EOL;
  try { fs.appendFileSync(logPath, line, 'utf8'); } catch (e) {}
  fetch(serverEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).catch(() => {});
}

// #region agent log
log({ hypothesisId: 'ALL', location: 'test-npm.js:start', message: 'Testing npm commands', data: { cwd: process.cwd() } });
// #endregion

// Test common npm commands
const commands = ['npm run dev', 'npm run dev:backend', 'npm run dev:frontend'];

commands.forEach((cmd, idx) => {
  // #region agent log
  log({ hypothesisId: 'A', location: `test-npm.js:cmd-${idx}`, message: `Testing command: ${cmd}`, data: { command: cmd, index: idx } });
  // #endregion
  
  exec(cmd, { cwd: process.cwd(), timeout: 5000 }, (error, stdout, stderr) => {
    // #region agent log
    log({
      hypothesisId: 'A',
      location: `test-npm.js:result-${idx}`,
      message: `Command result: ${cmd}`,
      data: {
        command: cmd,
        error: error ? { message: error.message, code: error.code, signal: error.signal } : null,
        stdout: stdout.substring(0, 500),
        stderr: stderr.substring(0, 500),
        exitCode: error ? error.code : 0
      }
    });
    // #endregion
    
    if (idx === commands.length - 1) {
      console.log('All tests completed. Check .cursor/debug.log');
      process.exit(0);
    }
  });
});

