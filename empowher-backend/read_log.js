const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'server_debug.log');

try {
    // Try reading as utf16le which is common for powershell redirected output
    const content = fs.readFileSync(logPath, 'ucs2');
    console.log(content);
} catch (err) {
    console.error('Error reading log:', err);
}
