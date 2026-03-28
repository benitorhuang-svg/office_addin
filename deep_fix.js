const fs = require('fs');
const path = require('path');

const classesToReplace = [
  'w-3', 'h-3', 'w-1.5', 'h-1.5', 'bg-blue-400', 'w-36', 'h-36', 'border-\\[1.5px\\]', 'border-emerald-500/10', 'text-slate-200'
];

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
    
    for (const c of classesToReplace) {
        // Correct regex for characters that need escaping like . or /
        const escaped = c.replace(/\./g, '\\.').replace(/\//g, '\\/').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp('(?<!nexus-)\\b' + escaped + '\\b', 'g');
        const replacement = 'nexus-' + c.replace(/\[/g, '').replace(/\]/g, '').replace(/\./g, '-').replace(/\//g, '-');
        
        // Custom mapping logic for specific names
        let actualReplacement = replacement;
        if (c === 'border-\\[1.5px\\]') actualReplacement = 'nexus-border-1-5';
        if (c === 'border-emerald-500/10') actualReplacement = 'nexus-border-emerald-500-10';
        if (c === 'w-1.5') actualReplacement = 'nexus-w-1-5';
        if (c === 'h-1.5') actualReplacement = 'nexus-h-1-5';

        content = content.replace(regex, actualReplacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Deep Fix: ${filePath}`);
    }
  }
});
