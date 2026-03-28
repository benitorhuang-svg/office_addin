const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk('client', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace double nexus occurrences within the same class
    content = content.replace(/nexus-inline-nexus-flex/g, 'nexus-inline-flex');
    content = content.replace(/nexus-nexus-(\w+)/g, 'nexus-$1');
    content = content.replace(/nexus-(\w+)-nexus-(\w+)/g, 'nexus-$1-$2'); // e.g. nexus-inline-nexus-flex
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Deep Cleaned: ${filePath}`);
    }
  }
});
