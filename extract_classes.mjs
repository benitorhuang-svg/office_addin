const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const classes = new Set();
walk('client', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.html')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/(class|className)="([^"]+)"/g);
    for (const match of matches) {
      match[2].split(' ').forEach(c => {
        if (c && !c.startsWith('nexus-')) {
          classes.add(c);
        }
      });
    }
  }
});

console.log(Array.from(classes).sort().join('\n'));
