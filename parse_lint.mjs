import fs from 'fs';
const buffer = fs.readFileSync('current_lint.json');
// Check for UTF-16 BOM
let content;
if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    content = buffer.toString('utf16le');
} else if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    content = buffer.toString('utf8').substring(1);
} else {
    content = buffer.toString('utf8');
}

try {
    const data = JSON.parse(content.trim().replace(/^\uFEFF/, ''));
    const filesWithIssues = data.filter(f => f.errorCount > 0 || f.warningCount > 0);
    if (filesWithIssues.length === 0) {
        console.log("No issues found.");
    } else {
        filesWithIssues.forEach(f => {
            console.log(`${f.filePath}: ${f.errorCount} errors, ${f.warningCount} warnings`);
            f.messages.forEach(m => {
                console.log(`  [${m.line}:${m.column}] ${m.ruleId}: ${m.message}`);
            });
        });
    }
} catch (e) {
    console.error("Failed to parse JSON:", e.message);
    console.log("Content start:", content.substring(0, 100));
}
