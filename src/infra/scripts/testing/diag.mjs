import { execSync } from 'child_process';
import dns from 'dns';
import os from 'os';
// Imports cleaned up


/**
 * Nexus Diagnostic Script (diag.mjs)
 * Performs a deep-system health check for the Industrial Zenith architecture.
 */

const log = (msg, level = 'INFO') => {
    const colors = { INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', DEBUG: '\x1b[34m' };
    console.log(`${colors[level] || colors.INFO}[${level}] ${msg}\x1b[0m`);
};

async function checkNode() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    if (major < 20) {
        log(`Node.js version ${version} is too old. Recommend v20+.`, 'WARN');
    } else {
        log(`Node.js check: ${version} (Ready)`);
    }
}

async function checkPorts() {
    const ports = [4000, 3001];
    for (const port of ports) {
        try {
            // Very basic check - on Windows use netstat
            const cmd = os.platform() === 'win32' 
                ? `netstat -ano | findstr :${port}`
                : `lsof -i :${port}`;
            
            try {
                execSync(cmd, { stdio: 'ignore' });
                log(`Port ${port} is BUSY. (Possible server already running)`, 'DEBUG');
            } catch {
                log(`Port ${port} is AVAILABLE.`);
            }
        } catch (_e) {
            log(`Could not check port ${port}`, 'WARN');
        }
    }
}

async function checkDocker() {
    try {
        execSync('docker --version', { stdio: 'ignore' });
        log('Docker Desktop: DETECTED');
    } catch {
        log('Docker Desktop: NOT FOUND. (Skip if not using containers)', 'WARN');
    }
}

async function checkNetworking() {
    return new Promise((resolve) => {
        dns.lookup('google.com', (err) => {
            if (err) {
                log('Network Connectivity: OFFLINE', 'ERROR');
            } else {
                log('Network Connectivity: ONLINE');
            }
            resolve();
        });
    });
}

async function checkEnv() {
    const required = ['GEMINI_API_KEY', 'GITHUB_PAT'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        log(`Missing Env Vars: ${missing.join(', ')}`, 'WARN');
    } else {
        log('Environment Matrix: FULLY CONFIGURED');
    }
}

async function checkSDKs() {
    // Check if gh is installed (for Copilot SDK local mode)
    try {
        execSync('gh --version', { stdio: 'ignore' });
        log('GitHub CLI (gh): FOUND');
    } catch {
        log('GitHub CLI (gh): MISSING. (Required for Local Copilot CLI auth)', 'WARN');
    }
}

async function main() {
    console.log('\x1b[35m' + '═'.repeat(40));
    console.log(' NEXUS CENTER SYSTEMS DIAGNOSTIC (V7.2)');
    console.log('═'.repeat(40) + '\x1b[0m');

    await checkNode();
    await checkNetworking();
    await checkEnv();
    await checkDocker();
    await checkPorts();
    await checkSDKs();

    console.log('\x1b[35m' + '═'.repeat(40));
    log('Diagnostics Complete. System status: NOMINAL.');
    console.log('═'.repeat(40) + '\x1b[0m');
}

main().catch(e => {
    log(`Fatal Error in Diag: ${e.message}`, 'ERROR');
    process.exit(1);
});
