const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walk(dirPath, callback);
    else callback(path.join(dir, f));
  });
};

walk('client', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replacement pairs
    const pairs = [
      { from: / w-3 /g, to: ' nexus-w-3 ' },
      { from: / h-3 /g, to: ' nexus-h-3 ' },
      { from: / w-1\.5 /g, to: ' nexus-w-1-5 ' },
      { from: / h-1\.5 /g, to: ' nexus-h-1-5 ' },
      { from: / bg-blue-400 /g, to: ' nexus-bg-blue-400 ' },
      { from: / w-36 /g, to: ' nexus-w-36 ' },
      { from: / h-36 /g, to: ' nexus-h-36 ' },
      { from: / border-\[1\.5px\] /g, to: ' nexus-border-1-5 ' },
      { from: / border-emerald-500\/10 /g, to: ' nexus-border-emerald-500-10 ' },
      { from: / text-slate-200 /g, to: ' nexus-text-slate-200 ' },
    ];

    for (const p of pairs) {
       content = content.replace(p.from, p.to);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Final Fix: ${filePath}`);
    }
  }
});
