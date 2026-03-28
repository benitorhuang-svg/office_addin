const fs = require('fs');
const path = require('path');

const tailwindPrefixes = [
  'bg-', 'text-', 'p-', 'm-', 'w-', 'h-', 'flex', 'grid', 'rounded-', 'shadow-', 'border-', 'opacity-', 'absolute', 'relative', 'fixed', 'inset-', 'top-', 'left-', 'right-', 'bottom-', 'gap-', 'items-', 'justify-', 'z-', 'animate-'
];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walk(dirPath, callback);
    else callback(path.join(dir, f));
  });
};

const results = [];
walk('client', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.html')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/(class|className)="([^"]+)"/g);
    for (const match of matches) {
      const classes = match[2].split(/\s+/);
      for (const c of classes) {
        if (c && !c.startsWith('nexus-')) {
          for (const prefix of tailwindPrefixes) {
            if (c.startsWith(prefix) || c === 'flex' || c === 'grid' || c === 'absolute' || c === 'relative' || c === 'fixed') {
              results.push(`${filePath}: ${c}`);
              break;
            }
          }
        }
      }
    }
  }
});

console.log(results.join('\n'));
