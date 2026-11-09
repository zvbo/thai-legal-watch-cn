import { readFile } from 'node:fs/promises';
import { recentGazette, translationState } from '../assets/translation-policy.js';
import { provinceKeys, provinceName } from '../assets/discovery.js';
import { glossaryProblems } from '../assets/glossary.js';

const PROVINCES = Object.fromEntries(provinceKeys.map(key => [key, provinceName(key)]));

const NORMATIVE_TYPES = new Set([
  'พระราชบัญญัติ', 'พระราชกฤษฎีกา', 'กฎกระทรวง', 'กฎ', 'กฎ ก.',
  'ข้อกำหนด', 'ระเบียบ', 'ข้อบังคับ', 'ข้อบัญญัติ', 'เทศบัญญัติ',
]);

const limit = Number(process.argv[2] ?? 40);
if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('批次大小必须为正整数');

const cache = JSON.parse(await readFile(new URL('../data/translations.json', import.meta.url), 'utf8'));
if (cache.schema !== 1 || !cache.titles || typeof cache.titles !== 'object' || Array.isArray(cache.titles)) {
  throw new Error('译文缓存格式有变');
}

const file = process.argv[3];
const source = file ? JSON.parse(await readFile(file, 'utf8')) : await fetchLatest();
const { docs } = recentGazette(source);
const priority = doc => NORMATIVE_TYPES.has(doc.dt) ? 2 : Number(doc.action === 'rulemaking');
const queue = docs
  .filter(doc => translationState(doc, cache.titles).status === 'pending')
  .sort((a, b) => priority(b) - priority(a) || b.d.localeCompare(a.d))
  .slice(0, limit)
  .map(({ id, t, d }) => {
    // Checking an empty translation lists every rendering the title will be held to.
    const terms = glossaryProblems(t, '', PROVINCES).filter(problem => !problem.startsWith('泰文原题没有'));
    return terms.length ? { id, t, d, terms } : { id, t, d };
  });

console.log(JSON.stringify(queue, null, 2));

async function fetchLatest() {
  const url = 'https://thai-legal-watch.openlawdatathailand.org/data/ratchakitcha/agg/latest.json';
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('上游公报读取失败，HTTP ' + response.status);
  return response.json();
}
