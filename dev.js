import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const isWindows = process.platform === 'win32';
const venvPython = isWindows
  ? path.join('.venv', 'Scripts', 'python.exe')
  : path.join('.venv', 'bin', 'python');

const pythonExe = fs.existsSync(venvPython) ? venvPython : (isWindows ? 'python' : 'python3');

console.log(`[PermissionGuard] Starting Python backend using ${pythonExe}...`);

const apiProcess = spawn(
  pythonExe,
  ['-m', 'uvicorn', 'permissionguard_api:app', '--host', '127.0.0.1', '--port', '8010'],
  { stdio: 'inherit', shell: isWindows }
);

console.log('[PermissionGuard] Starting Vite frontend...');

const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const frontendProcess = spawn(npmCmd, ['run', 'frontend'], {
  stdio: 'inherit',
  shell: isWindows,
});

function cleanup() {
  console.log('\n[PermissionGuard] Shutting down services...');
  if (isWindows) {
    try {
      spawn('taskkill', ['/pid', apiProcess.pid, '/f', '/t']);
    } catch {}
    try {
      spawn('taskkill', ['/pid', frontendProcess.pid, '/f', '/t']);
    } catch {}
  } else {
    try {
      apiProcess.kill('SIGINT');
      frontendProcess.kill('SIGINT');
    } catch {}
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
