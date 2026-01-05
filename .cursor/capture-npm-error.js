// Script to capture npm error details
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const logPath = path.join(__dirname, 'debug.log');
const serverEndpoint = 'http://127.0.0.1:7242/ingest/507dbd9e-47f3-4c09-9169-184f6ea2c007';

function log(data) {
  const logEntry = {
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: data.runId || 'run1'
  };
  
  const logLine = JSON.stringify(logEntry) + os.EOL;
  try {
    fs.appendFileSync(logPath, logLine, 'utf8');
  } catch (err) {}
  
  fetch(serverEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry)
  }).catch(() => {});
}

// #region agent log
log({
  hypothesisId: 'A',
  location: 'capture-npm-error.js:entry',
  message: 'Starting npm error capture',
  data: {
    cwd: process.cwd(),
    nodeVersion: process.version
  }
});
// #endregion

// Get npm command from command line args
const npmArgs = process.argv.slice(2);
// #region agent log
log({
  hypothesisId: 'A',
  location: 'capture-npm-error.js:args',
  message: 'Captured npm command arguments',
  data: {
    npmArgs: npmArgs,
    fullCommand: 'npm ' + npmArgs.join(' ')
  }
});
// #endregion

// Check package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
// #region agent log
log({
  hypothesisId: 'B',
  location: 'capture-npm-error.js:check-pkg',
  message: 'Checking package.json',
  data: {
    path: packageJsonPath,
    exists: fs.existsSync(packageJsonPath),
    canRead: fs.existsSync(packageJsonPath) ? true : false
  }
});
// #endregion

if (fs.existsSync(packageJsonPath)) {
  try {
    const pkgContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    // #region agent log
    log({
      hypothesisId: 'B',
      location: 'capture-npm-error.js:pkg-content',
      message: 'Package.json content parsed',
      data: {
        hasScripts: !!pkgContent.scripts,
        scriptKeys: pkgContent.scripts ? Object.keys(pkgContent.scripts) : [],
        hasDevDeps: !!pkgContent.devDependencies
      }
    });
    // #endregion
  } catch (err) {
    // #region agent log
    log({
      hypothesisId: 'C',
      location: 'capture-npm-error.js:pkg-parse',
      message: 'Failed to parse package.json',
      data: {
        error: err.message
      }
    });
    // #endregion
  }
}

// Run npm command and capture output
const npmProcess = spawn('npm', npmArgs, {
  cwd: process.cwd(),
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

npmProcess.stdout.on('data', (data) => {
  stdout += data.toString();
});

npmProcess.stderr.on('data', (data) => {
  stderr += data.toString();
});

npmProcess.on('close', (code) => {
  // #region agent log
  log({
    hypothesisId: 'D',
    location: 'capture-npm-error.js:exit',
    message: 'NPM process completed',
    data: {
      exitCode: code,
      stdoutLength: stdout.length,
      stderrLength: stderr.length,
      stdout: stdout.substring(0, 500),
      stderr: stderr.substring(0, 500)
    }
  });
  // #endregion
  
  if (code !== 0) {
    // #region agent log
    log({
      hypothesisId: 'E',
      location: 'capture-npm-error.js:error',
      message: 'NPM command failed',
      data: {
        exitCode: code,
        fullStderr: stderr,
        fullStdout: stdout
      }
    });
    // #endregion
  }
  
  process.exit(code);
});

