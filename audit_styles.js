const fs = require('fs');
const path = require('path');

const classesToReplace = [
  'bg-white', 'bg-blue-600', 'bg-emerald-500', 'bg-red-500', 'bg-amber-500', 'bg-violet-500',
  'text-blue-600', 'text-emerald-500', 'text-amber-500', 'text-violet-500', 'text-slate-400', 'text-slate-800', 'text-slate-900', 'text-white',
  'flex', 'flex-col', 'grid', 'items-center', 'justify-between', 'rounded-full', 'shadow-sm', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
  'transition-all', 'duration-1000', 'duration-700', 'duration-500', 'duration-300', 'transition-colors',
  'inline-flex', 'cursor-pointer', 'outline-none', 'border-none', 'sticky', 'top-0', 'z-50', 'z-100', 'absolute', 'relative', 'fixed',
  'w-full', 'h-full', 'w-screen', 'h-screen', 'opacity-50', 'opacity-40', 'opacity-20', 'opacity-10', 'opacity-5',
  'animate-pulse', 'animate-bounce', 'animate-grand',
];

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
    
    // First, fix any existing nexus-nexus- or nexus-inline-nexus- etc.
    content = content.replace(/nexus-nexus-/g, 'nexus-');
    content = content.replace(/nexus-inline-nexus-flex/g, 'nexus-inline-flex');
    
    // Then, replace classes that don't have nexus- prefix yet
    // Node supports look-behind
    for (const c of classesToReplace) {
      const regex = new RegExp('(?<!nexus-)\\b' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      content = content.replace(regex, 'nexus-' + c);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Audited: ${filePath}`);
    }
  }
});
