#!/usr/bin/env node
/**
 * Scans the frontend src tree for files that are never imported anywhere.
 * Resolution is done by realpath, so "./foo" resolves to foo.tsx / foo.ts / foo/index.tsx etc.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, extname, dirname } from 'node:path';

const SRC = resolve(process.argv[2] || 'src');
const ROOT = resolve(process.argv[3] || '.');

const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(SRC);
const fileSet = new Set(files.map((f) => resolve(f)));
const codeFiles = files.filter((f) => CODE_EXTS.includes(extname(f)));

/** Resolve a relative or aliased import specifier to an actual file on disk. */
function resolveSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('.')) {
    base = resolve(dirname(fromFile), spec);
  } else if (spec.startsWith('@/')) {
    base = resolve(ROOT, 'src', spec.slice(2));
  } else {
    return null;
  }
  const candidates = [];
  if (extname(base)) candidates.push(base);
  for (const ext of CODE_EXTS) candidates.push(base + ext);
  for (const ext of CODE_EXTS) candidates.push(join(base, 'index' + ext));
  // css import (side effect or with query)
  for (const ext of ['.css', '.scss']) candidates.push(base + ext);
  for (const c of candidates) {
    if (fileSet.has(resolve(c))) return resolve(c);
    // strip a trailing ".js" that points at a ".ts" source
    if (c.endsWith('.js')) {
      const ts = c.replace(/\.js$/, '.ts');
      if (fileSet.has(ts)) return ts;
      const tsx = c.replace(/\.js$/, '.tsx');
      if (fileSet.has(tsx)) return tsx;
    }
  }
  return null;
}

const referenced = new Set();
const importRe = /(?:from\s*|import\s*\(\s*|import\s+|require\s*\(\s*)['"]([^'"]+)['"]/g;

for (const file of codeFiles) {
  const content = readFileSync(file, 'utf8');
  let m;
  while ((m = importRe.exec(content)) !== null) {
    const resolved = resolveSpecifier(m[1], file);
    if (resolved) referenced.add(resolved);
    else if (m[1].startsWith('.')) {
      console.error('UNRESOLVED IMPORT: ' + m[1] + '  <- ' + relative(ROOT, file));
    }
  }
}

/** Direct string references to assets (url(...) in css, /src/... in html). */
const assetRefs = new Set();

/** CSS @import statements are real references: index.css pulls in every styles/*.css file. */
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const content = readFileSync(file, 'utf8');
  let m;
  const atImportRe = /@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g;
  while ((m = atImportRe.exec(content)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.')) {
      const base = resolve(dirname(file), spec);
      for (const c of [base, ...CODE_EXTS.map((e) => base + e)]) {
        if (fileSet.has(resolve(c))) assetRefs.add(resolve(c));
      }
    }
  }
}

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  let m;
  const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  while ((m = urlRe.exec(content)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('/src/')) {
      const base = spec.startsWith('/src/')
        ? resolve(ROOT, '.' + spec)
        : resolve(dirname(file), spec);
      for (const c of [base, ...CODE_EXTS.map((e) => base + e)]) {
        if (fileSet.has(resolve(c))) assetRefs.add(resolve(c));
      }
    }
  }
}

const unused = [];
for (const file of files) {
  const ext = extname(file);
  const isCode = CODE_EXTS.includes(ext);
  const isAsset = ['.css', '.scss', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext);
  if (!isCode && !isAsset) continue;

  const abs = resolve(file);
  const rel = relative(ROOT, abs);
  if (rel === 'src/main.tsx' || rel === 'src/routes/index.tsx') continue;
  if (rel.startsWith('src/styles/') && assetRefs.has(abs)) continue;

  if (isCode) {
    const isTest = /\.test\.(ts|tsx)$/.test(abs);
    const isEntry = /src\/(routes|main)\./.test(rel);
    if (!referenced.has(abs) && !isTest && !isEntry) {
      unused.push({ file: abs, reason: 'never imported' });
    }
  } else if (!assetRefs.has(abs)) {
    unused.push({ file: abs, reason: ext === '.css' ? 'style never referenced' : 'asset never referenced' });
  }
}

console.log(`\nScanned ${files.length} files. Referenced: ${referenced.size}\n`);
console.log('=== UNUSED ===');
for (const u of unused.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(`  ${relative(ROOT, u.file)}   [${u.reason}]`);
}
console.log(`\nTotal unused: ${unused.length}`);
