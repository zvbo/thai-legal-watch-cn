import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { recentGazette, translationScope } from '../assets/translation-policy.js';

const [beforePath, afterPath, mode, sourcePath] = process.argv.slice(2);
const automatic = mode === 'automatic';
const before = await readCache(beforePath);
const after = await readCache(afterPath);
const changes = [];

for (const [id, entry] of Object.entries(after.titles)) {
  const previous = Object.hasOwn(before.titles, id) ? before.titles[id] : undefined;
  if (isDeepStrictEqual(previous, entry)) continue;
  const keys = Object.keys(entry ?? {});
  if (!/^\d{4}-\d{2}-\d{2}-\d+$/.test(id) || keys.some(key => !['source', 'zh', 'method', 'reviewed'].includes(key)) ||
      typeof entry?.source !== 'string' || !entry.source.trim() ||
      typeof entry.zh !== 'string' || !/\p{Script=Han}/u.test(entry.zh) ||
      (entry.method !== undefined && entry.method !== 'machine') ||
      (entry.reviewed !== undefined && entry.reviewed !== true)) {
    throw new Error('Invalid translation entry');
  }
  if (automatic && (entry.method !== 'machine' || entry.reviewed !== undefined ||
      previous?.reviewed === true || previous?.source === entry.source)) {
    throw new Error('Automation may add translations for new or changed source titles only');
  }
  changes.push([id, entry]);
}

if (automatic && Object.keys(before.titles).some(id => !Object.hasOwn(after.titles, id))) {
  throw new Error('Automation may not remove existing translations');
}
if (automatic && changes.length === 0) {
  throw new Error('No new or changed source titles');
}

if (changes.length) {
  const source = sourcePath ? JSON.parse(await readFile(sourcePath, 'utf8')) : await fetchSource();
  const documents = new Map(recentGazette(source).docs.map(doc => [doc.id, doc]));
  for (const [id, entry] of changes) {
    const doc = documents.get(id);
    const scope = doc && translationScope(doc);
    if (!doc || entry.source !== doc.t ||
        (scope !== 'eligible' && !(scope === 'review' && !automatic && entry.reviewed === true))) {
      throw new Error('Translation must match an in-scope upstream title');
    }
  }
}

console.log('Validated ' + changes.length + ' changed translation entries');

async function readCache(path) {
  const cache = JSON.parse(await readFile(path, 'utf8'));
  if (cache?.schema !== 1 || typeof cache.generated_at !== 'string' ||
      !Number.isFinite(Date.parse(cache.generated_at)) ||
      !cache.titles || typeof cache.titles !== 'object' || Array.isArray(cache.titles) ||
      Object.keys(cache).length !== 3) {
    throw new Error('Invalid translation cache');
  }
  return cache;
}

async function fetchSource() {
  const response = await fetch('https://thai-legal-watch.openlawdatathailand.org/data/ratchakitcha/agg/latest.json', {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('Upstream returned HTTP ' + response.status);
  return response.json();
}
