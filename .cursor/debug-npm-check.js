// Debug script to check npm execution context
const fs = require('fs');
const path = require('path');
const os = require('os');

const logPath = path.join(__dirname, '.cursor', 'debug.log');
const serverEndpoint = 'http://127.0.0.1:7242/ingest/507dbd9e-47f3-4c09-9169-184f6ea2c007';

function log(data) {
  const logEntry = {
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: data.runId || 'run1'
  };
  
  // Write to file
  const logLine = JSON.stringify(logEntry) + os.EOL;
  try {
    fs.appendFileSync(logPath, logLine, 'utf8');
  } catch (err) {
    // Ignore file errors
  }
  
  // Also send via HTTP
  fetch(serverEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry)
  }).catch(() => {});
}

// #region agent log
log({
  hypothesisId: 'A',
  location: 'debug-npm-check.js:entry',
  message: 'Script started - checking npm context',
  data: {
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform
  }
});
// #endregion

// Hypothesis A: npm command run from wrong directory
const rootPackageJson = path.join(process.cwd(), 'package.json');
// #region agent log
log({
  hypothesisId: 'A',
  location: 'debug-npm-check.js:check-root',
  message: 'Checking root package.json existence',
  data: {
    rootPath: rootPackageJson,
    exists: fs.existsSync(rootPackageJson)
  }
});
// #endregion

// Hypothesis B: Working directory changed unexpectedly
const backendPackageJson = path.join(process.cwd(), 'backend', 'package.json');
const frontendPackageJson = path.join(process.cwd(), 'frontend', 'package.json');
// #region agent log
log({
  hypothesisId: 'B',
  location: 'debug-npm-check.js:check-subdirs',
  message: 'Checking subdirectory package.json files',
  data: {
    backendExists: fs.existsSync(backendPackageJson),
    frontendExists: fs.existsSync(frontendPackageJson),
    backendPath: backendPackageJson,
    frontendPath: frontendPackageJson
  }
});
// #endregion

// Hypothesis C: npm command arguments
// #region agent log
log({
  hypothesisId: 'C',
  location: 'debug-npm-check.js:args',
  message: 'Checking process arguments',
  data: {
    argv: process.argv,
    execPath: process.execPath
  }
});
// #endregion

// Hypothesis D: Environment variables affecting npm
// #region agent log
log({
  hypothesisId: 'D',
  location: 'debug-npm-check.js:env',
  message: 'Checking npm-related environment variables',
  data: {
    npmConfigPrefix: process.env.npm_config_prefix,
    npmConfigUserconfig: process.env.npm_config_userconfig,
    npmConfigGlobalconfig: process.env.npm_config_globalconfig,
    PWD: process.env.PWD
  }
});
// #endregion

// Hypothesis E: File system permissions or path issues
try {
  const testWrite = path.join(process.cwd(), '.cursor', 'test-write.tmp');
  fs.writeFileSync(testWrite, 'test');
  fs.unlinkSync(testWrite);
  // #region agent log
  log({
    hypothesisId: 'E',
    location: 'debug-npm-check.js:fs-test',
    message: 'File system write test',
    data: {
      canWrite: true,
      testPath: testWrite
    }
  });
  // #endregion
} catch (err) {
  // #region agent log
  log({
    hypothesisId: 'E',
    location: 'debug-npm-check.js:fs-test',
    message: 'File system write test failed',
    data: {
      canWrite: false,
      error: err.message
    }
  });
  // #endregion
}

// #region agent log
log({
  hypothesisId: 'ALL',
  location: 'debug-npm-check.js:exit',
  message: 'Debug check completed',
  data: {
    summary: 'All checks performed'
  }
});
// #endregion

console.log('Debug check completed. Check .cursor/debug.log for details.');

