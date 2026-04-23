import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSON5 from 'json5';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const AGENTS_DIR = path.join(ROOT_DIR, 'src', 'agents');
const MANIFEST_PATH = path.join(AGENTS_DIR, 'skills', 'skills-manifest.json');

/**
 * Extract an object literal from a string starting at startIndex.
 */
function extractObject(content, startIndex) {
  let braceCount = 0;
  let i = startIndex;
  let foundStart = false;
  let startPos = -1;
  let inString = false;
  let quoteChar = '';

  while (i < content.length) {
    const char = content[i];
    if (!inString) {
      if (char === '"' || char === "'" || char === "`") {
        inString = true;
        quoteChar = char;
      } else if (char === '{') {
        if (!foundStart) {
          foundStart = true;
          startPos = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (foundStart && braceCount === 0) {
          return content.substring(startPos, i + 1);
        }
      }
    } else {
      if (char === quoteChar && content[i - 1] !== '\\') {
        inString = false;
      }
    }
    i++;
  }
  return null;
}

/**
 * Clean and parse JS object literal string.
 */
function simpleJsToJson(jsStr) {
  try {
    // Normalize newlines
    let cleanStr = jsStr.replace(/\r\n/g, '\n');
    
    // 1. Remove methods/functions (like execute) - improve regex to handle newlines
    cleanStr = cleanStr.replace(/(?:async\s+)?\w+\s*\(.*?\)\s*\{[\s\S]*?\}/g, 'null');
    
    // 2. Handle string concatenation (very basic)
    cleanStr = cleanStr.replace(/["']\s*\+\s*["']/g, '');
    
    return JSON5.parse(cleanStr);
  } catch (_e) {    // console.error('  ⚠️ JSON5 Parse Error:', e.message);
    return null;
  }
}

async function sync() {
  console.log('🔄 Starting Skill Metadata Sync...');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found at:', MANIFEST_PATH);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const agentDirs = fs.readdirSync(AGENTS_DIR).filter(d => 
    fs.statSync(path.join(AGENTS_DIR, d)).isDirectory() && 
    fs.existsSync(path.join(AGENTS_DIR, d, 'index.ts'))
  );

  let updatedCount = 0;

  for (const dir of agentDirs) {
    const indexPath = path.join(AGENTS_DIR, dir, 'index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    const toolsMatch = indexContent.match(/export \* from ".\/(.+?)(\.js)?"/);
    if (!toolsMatch) continue;
    
    const toolsPath = path.join(AGENTS_DIR, dir, `${toolsMatch[1]}.ts`);
    if (!fs.existsSync(toolsPath)) continue;
    
    const toolsContent = fs.readFileSync(toolsPath, 'utf-8');
    // More flexible match for the Skill variable
    const skillMatch = toolsContent.match(/export const (\w+)Skill: AgentSkill/);
    if (!skillMatch) continue;
    
    const skillIndex = toolsContent.indexOf(skillMatch[0]);
    const skillObjStr = extractObject(toolsContent, skillIndex);
    if (!skillObjStr) continue;

    const skillObj = simpleJsToJson(skillObjStr);
    if (!skillObj) continue;

    const { name, description, parameters } = skillObj;
    if (name) {
      // Map directory to manifest domain
      let domainKey = '';
      if (dir === 'expert-excel') domainKey = 'excel';
      else if (dir === 'expert-ppt') domainKey = 'ppt';
      else if (dir === 'expert-word') domainKey = 'word';
      else if (dir === 'router-agent') domainKey = 'router';

      if (domainKey && manifest.domains[domainKey]) {
        const skills = manifest.domains[domainKey].skills;
        for (const skillKey in skills) {
          if (name) skills[skillKey].name = name;
          if (description) skills[skillKey].description = description;
          if (parameters) skills[skillKey].parameters = parameters;
          updatedCount++;
        }
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ Successfully synced ${updatedCount} skills in manifest.`);
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
