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
    
    // Fix recursive animation prefixes
    while (content.includes('nexus-animate-animate-') || content.includes('nexus-animate-nexus-animate-')) {
       content = content.replace(/nexus-animate-animate-/g, 'nexus-animate-');
       content = content.replace(/nexus-animate-nexus-animate-/g, 'nexus-animate-');
    }
    
    // Fix double nexus-
    while (content.includes('nexus-nexus-')) {
      content = content.replace(/nexus-nexus-/g, 'nexus-');
    }
    
    // Fix broken imports
    content = content.replace(/@molecules\/prompt-nexus-group/g, '@molecules/prompt-group');
    content = content.replace(/@molecules\/nexus-group/g, '@molecules/group'); // if any
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Hard Fixed: ${filePath}`);
    }
  }
});
