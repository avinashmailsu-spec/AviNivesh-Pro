/** Source/repository verification without third-party dependencies. */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const required = ['README.md', 'SECURITY.md', 'CONTRIBUTING.md', 'GITHUB_UPLOAD_GUIDE.md',
  '.gitignore', '.env.example', '.github/workflows/ci.yml', 'src/App.jsx',
  'server/index.js', 'tests/finance.test.mjs'];
let errors = 0;
function fail(message) { console.error('FAIL', message); errors++; }
for (const name of required) if (!existsSync(join(root, name))) fail(`Missing ${name}`);
for (const hidden of ['.env', '.env.local', '.env.production', '.env.development']) {
  if (existsSync(join(root, hidden))) {
    // Private local .env is expected when working on your own computer. It must be ignored by Git.
    try {
      execFileSync('git', ['check-ignore', '-q', hidden], { cwd: root, stdio: 'ignore' });
    } catch { fail(`Local ${hidden} must be Git-ignored before publishing`); }
  }
}
const scanDirs = ['src', 'server', 'public', 'tests', '.github'];
const candidateFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(?:js|jsx|mjs|json|yml|yaml|css|svg|proto|webmanifest|md)$/.test(entry.name)) candidateFiles.push(full);
  }
}
for (const dir of scanDirs) if (existsSync(join(root, dir))) walk(join(root, dir));
const suspicious = [
  ['GitHub classic token', /\bghp_[a-zA-Z0-9]{30,}\b/g],
  ['GitHub fine-grained token', /\bgithub_pat_[a-zA-Z0-9_]{35,}\b/g],
  ['OpenAI-style key', /\bsk-(?:proj-)?[a-zA-Z0-9_-]{24,}\b/g],
  ['AWS key ID', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g]
];
for (const file of candidateFiles) {
  if (statSync(file).size > 5_000_000) fail(`Oversized source file ${relative(root, file)}`);
  const content = readFileSync(file, 'utf8');
  for (const [name, pattern] of suspicious) if (pattern.test(content)) fail(`${name} found in ${relative(root, file)} (review before upload)`);
}
const serverFiles = readdirSync(join(root, 'server')).filter(f => f.endsWith('.js'));
const moduleFiles = readdirSync(join(root, 'src')).filter(f => f.endsWith('.js'));
const tests = readdirSync(join(root, 'tests')).filter(f => f.endsWith('.mjs'));
for (const name of [...serverFiles.map(x => `server/${x}`), ...moduleFiles.map(x => `src/${x}`), ...tests.map(x => `tests/${x}`)]) {
  try { execFileSync(process.execPath, ['--check', join(root, name)], { stdio: 'pipe' }); }
  catch (e) { fail(`JavaScript syntax error: ${name} ${e.stderr?.toString() || ''}`); }
}
console.log(`Scanned ${candidateFiles.length} source/config files and syntax-checked ${serverFiles.length + moduleFiles.length + tests.length} JS modules.`);
if (errors) process.exit(1);
console.log('Repository checks passed. Note: this does not replace a secret scanner, npm audit, or the Vite build.');
