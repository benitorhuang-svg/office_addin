/**
 * Atom: Logger
 * Handles diagnostic logging with timestamps to a file.
 */
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../gemini-wrapper-v2.log');

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

module.exports = { log };
