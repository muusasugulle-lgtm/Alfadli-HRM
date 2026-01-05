// Debug script to capture npm error details
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
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

// Get command from arguments
const npmCommand = process.argv.slice(2).join(' ') || 'test';
// #region agent log
log({
  hypothesisId: 'A',
  location: 'debug-npm-error.js:entry',
  message: 'Starting npm error capture',
  data: {
    cwd: process.cwd(),
    npmCommand: npmCommand,
    nodeVersion: process.version
  }
});
// #endregion

// Hypothesis A: package.json exists but has syntax errors
const packageJsonPath = path.join(process.cwd(), 'package.json');
// #region agent log
log({
  hypothesisId: 'A',
  location: 'debug-npm-error.js:check-package',
  message: 'Checking package.json',
  data: {
    exists: fs.existsSync(packageJsonPath),
    path: packageJsonPath
  }
});
// #endregion

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    // #region agent log
    log({
      hypothesisId: 'A',
      location: 'debug-npm-error.js:parse-package',
      message: 'Package.json parsed successfully',
      data: {
        hasScripts: !!packageJson.scripts,
        scriptCount: packageJson.scripts ? Object.keys(packageJson.scripts).length : 0,
        scripts: packageJson.scripts
      }
    });
    // #endregion
  } catch (err) {
    // #region agent log
    log({
      hypothesisId: 'A',
      location: 'debug-npm-error.js:parse-error',
      message: 'Package.json parse error',
      data: {
        error: err.message,
        stack: err.stack
      }
    });
    // #endregion
  }
}

// Hypothesis B: npm command execution fails
// #region agent log
log({
  hypothesisId: 'B',
  location: 'debug-npm-error.js:before-npm',
  message: 'About to run npm command',
  data: {
    command: `npm ${npmCommand}`,
    cwd: process.cwd()
  }
});
// #endregion

const npmProcess = spawn('npm', npmCommand.split(' '), {
  cwd: process.cwd(),
  shell: true,
  stdio: 'pipe'
});

let stdout = '';
let stderr = '';

npmProcess.stdout.on('data', (data) => {
  stdout += data.toString();
});

npmProcess.stderr.on('data', (data) => {
  stderr += data.toString();
  // #region agent log
  log({
    hypothesisId: 'B',
    location: 'debug-npm-error.js:stderr',
    message: 'npm stderr output',
    data: {
      stderrChunk: data.toString()
    }
  });
  // #endregion
});

npmProcess.on('error', (error) => {
  // #region agent log
  log({
    hypothesisId: 'B',
    location: 'debug-npm-error.js:spawn-error',
    message: 'npm spawn error',
    data: {
      error: error.message,
      code: error.code,
      stack: error.stack
    }
  });
  // #endregion
});

npmProcess.on('close', (code) => {
  // #region agent log
  log({
    hypothesisId: 'B',
    location: 'debug-npm-error.js:close',
    message: 'npm process closed',
    data: {
      exitCode: code,
      stdout: stdout,
      stderr: stderr,
      fullOutput: { stdout, stderr }
    }
  });
  // #endregion
  
  console.log('Exit code:', code);
  if (stdout) console.log('STDOUT:', stdout);
  if (stderr) console.log('STDERR:', stderr);
  process.exit(code || 0);
});

