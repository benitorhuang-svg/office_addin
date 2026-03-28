import fs from 'fs';
import path from 'path';

const replacements = [
  { from: /nexus-bg-white\/30/g, to: 'nexus-bg-white-30' },
  { from: /nexus-bg-white\/20/g, to: 'nexus-bg-white-20' },
  { from: /nexus-bg-white\/90/g, to: 'nexus-bg-white-90' },
  { from: /nexus-bg-white\/\[0\.01\]/g, to: 'nexus-bg-white-1' },
  { from: /nexus-border-slate-100\/30/g, to: 'nexus-border-slate-100-30' },
  { from: /text-blue-500\/50/g, to: 'nexus-text-blue-500-50' },
  { from: /rounded-\[32px\]/g, to: 'nexus-rounded-32px' },
  { from: /shadow-\[0_0_30px_rgba\(37,99,235,0\.4\)\]/g, to: 'nexus-shadow-blue-glow' },
  { from: /shadow-\[0_25px_60px_-15px_rgba\(59,130,246,0\.25\)\]/g, to: 'nexus-shadow-blue-pulse' },
  { from: /shadow-\[0_15px_40px_-15px_rgba\(0,0,0,0\.06\)\]/g, to: 'nexus-shadow-glass' },
  { from: /shadow-blue-300\/50/g, to: 'nexus-shadow-blue-300-50' },
  { from: /shadow-emerald-300\/50/g, to: 'nexus-shadow-emerald-300-50' },
  { from: /\bhover:translate-x-3\b/g, to: 'nexus-hover-translate-x-3' },
  { from: /\bhover:rotate-6\b/g, to: 'nexus-hover-rotate-6' },
  { from: /\bhover:scale-110\b/g, to: 'nexus-hover-scale-110' },
  { from: /\bhover:bg-blue-50\/20\b/g, to: 'nexus-hover-bg-blue-50-50' },
  { from: /\bgroup-hover:rotate-6\b/g, to: 'nexus-group-hover-rotate-6' },
  { from: /\bgroup-hover:scale-110\b/g, to: 'nexus-group-hover-scale-110' },
  { from: /\bgroup\/search\b/g, to: 'nexus-group-search' },
  { from: /\bgroup-hover\/search\b/g, to: 'nexus-group-hover' },
  { from: /\bplaceholder:text-slate-300\b/g, to: 'nexus-placeholder-slate-300' },
  { from: /\bshadow-2xl\b/g, to: 'nexus-shadow-2xl' },
  { from: /\bopacity-40\b/g, to: 'nexus-opacity-40' },
  { from: /\bborder-t\b/g, to: 'nexus-border-t' },
  { from: /\bborder-white\/5\b/g, to: 'nexus-border-white-5' },
  { from: /\bfade-in\b/g, to: 'nexus-animate-fade-in' },
  { from: /\btransition-all\b/g, to: 'nexus-transition-all' },
  { from: /\bduration-1000\b/g, to: 'nexus-duration-1000' },
  { from: /\bduration-700\b/g, to: 'nexus-duration-700' },
  { from: /\bduration-500\b/g, to: 'nexus-duration-500' },
  { from: /\btext-blue-500\b/g, to: 'nexus-text-blue-500' },
  { from: /\bbg-blue-600\b/g, to: 'nexus-bg-blue-600' },
  { from: /\bbg-emerald-500\b/g, to: 'nexus-bg-emerald-500' },
  { from: /\bbg-white\b/g, to: 'nexus-bg-white' },
  { from: /\brounded-full\b/g, to: 'nexus-rounded-full' },
  { from: /\bborder-none\b/g, to: 'nexus-border-none' },
  { from: /\boutline-none\b/g, to: 'nexus-outline-none' },
  { from: /\bitems-center\b/g, to: 'nexus-items-center' },
  { from: /\bjustify-between\b/g, to: 'nexus-justify-between' },
  { from: /\bflex\b/g, to: 'nexus-flex' },
  { from: /\bflex-col\b/g, to: 'nexus-flex-col' },
  { from: /\bgroup\b/g, to: 'nexus-group' },
  { from: /\btext-\[15px\]\b/g, to: 'nexus-text-15px' },
  { from: /\btext-\[13px\]\b/g, to: 'nexus-text-13px' },
  // Fix double prefixing from previous failed run
  { from: /nexus-nexus-/g, to: 'nexus-' },
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
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    for (const r of replacements) {
      content = content.replace(r.from, r.to);
    }
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
    }
  }
});
