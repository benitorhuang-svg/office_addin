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
    if (content.includes('nexus-nexus-')) {
      while (content.includes('nexus-nexus-')) {
        content = content.replace(/nexus-nexus-/g, 'nexus-');
      }
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  }
});
