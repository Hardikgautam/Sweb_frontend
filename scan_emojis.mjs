import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const EMOJI_REGEX = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1FA00}-\u{1FA9F}\u{231A}-\u{23FF}\u{25AA}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

const EXTS = new Set(['.jsx', '.js', '.tsx', '.ts', '.css', '.html']);

function walk(dir) {
  const results = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) results.push(...walk(full));
    else if (EXTS.has(extname(name))) results.push(full);
  }
  return results;
}

const srcDir = './src';
const files = walk(srcDir);
let found = false;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(EMOJI_REGEX)];
    if (matches.length > 0) {
      found = true;
      const relPath = file.replace('./src/', '');
      console.log(`${relPath}:${i+1}: ${line.trim()}`);
    }
  }
}

if (!found) console.log('No emojis found!');
