import { SECTIONS, classify, featuredRegions, provinceKeys, provinceName, regionsFor, sectionHref } from './discovery.js?v=regions';

const ORIGIN = 'https://thai-legal-watch.openlawdatathailand.org';
const BASE = ORIGIN + '/data/ratchakitcha';
const GAZETTE = 'https://ratchakitcha.soc.go.th';
const WINDOW_DAYS = 90;
const INITIAL_PAGE_SIZE = 50;

const TOPIC_NAMES = {
  environment: '环境保护',
  pollution: '污染防治',
  pollution_air: '空气污染',
  pollution_water: '水污染',
  pollution_waste: '废弃物、垃圾与危险物质',
  pollution_noise: '噪声与振动污染',
  conservation: '资源保护、森林、公园与野生动物',
  climate: '气候与温室气体',
  water_resource: '水资源',
  agriculture: '农业',
  livestock: '畜牧业',
  irrigation: '灌溉',
  land_reform: '农业用地改革',
  crops: '作物、肥料与种子',
  fishery: '渔业',
  health: '公共卫生',
  narcotics: '毒品管制',
  food_drug: '食品药品',
  disease: '传染病与疾病防控',
  public_health_local: '地方公共卫生与环境卫生',
  energy: '能源',
  electricity: '电力',
  petroleum: '石油与天然气',
  nuclear: '核能与原子能',
  transport: '交通运输',
  land_transport: '陆路运输、公路与交通',
  marine: '水路运输与航务',
  aviation: '航空',
  rail: '轨道交通',
  land_urban: '土地与城市规划',
  building: '建筑与施工',
  housing: '住房',
  finance: '金融、财政与税务',
  tax: '税务、海关与消费税',
  banking: '银行与金融机构',
  securities: '证券与资本市场',
  insurance: '保险',
  accounting: '会计准则与会计行业',
  public_debt: '预算、债券与公共债务',
  industry: '工业',
  mining: '矿业',
  standards: '产品标准',
  commerce: '商业与贸易',
  trade_intl: '国际贸易',
  consumer: '商品价格与消费者保护',
  juristic_registry: '法人、协会与基金会登记',
  investment: '投资与经济特区',
  intellectual_prop: '知识产权',
  labour: '劳动与专业职业',
  social_security: '社会保险',
  profession: '专业委员会与执业许可',
  education: '教育',
  university: '大学与高等教育机构',
  social_welfare: '社会福利',
  religion: '宗教',
  culture_sport: '文化、体育与休闲',
  tourism: '旅游',
  foreign_affairs: '外交',
  telecom_digital: '电信与数字事务',
  utilities: '公用事业',
  science_tech: '科学与技术',
  justice: '司法与诉讼',
  bankruptcy: '破产与强制执行',
  court: '法院与裁判',
  corrections: '监狱与矫正',
  anticorruption: '预防与打击腐败',
  aml: '反洗钱',
  nationality: '国籍与移民',
  politics: '政治、选举与政党',
  defence_security: '国家安全、军队与警察',
  disaster: '公共灾害与灾难',
  public_admin: '公共行政',
  ethics: '公职人员伦理与纪律',
  information_access: '政府信息公开',
  egov: '电子政务',
  emergency: '紧急状态与国内安全',
};

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('zh-CN');
const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
const bangkokTime = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

let docs = [];
let topicIndex = new Map();
let pageSize = INITIAL_PAGE_SIZE;
let section = 'gazette';
let sectionParams = new URLSearchParams();
let loaded = false;
let provinceCounts = new Map();
const filterIds = ['queryInput', 'topicSelect', 'provinceSelect', 'fromDate', 'toDate', 'translationFilter'];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(text, href) {
  const node = el('a', '', text);
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
}

function translated(d, titles) {
  const entry = titles[d.id];
  return entry?.source === d.t && typeof entry.zh === 'string' ? entry.zh.trim() : '';
}

function pdf(value) {
  if (Number.isSafeInteger(value) && value > 0) {
    return GAZETTE + '/documents/' + value + '.pdf';
  }
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.origin === GAZETTE && /^\/documents\/\d+\.pdf$/.test(url.pathname)) return url.href;
  } catch {
    return null;
  }
  return null;
}

function getTopics(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.topics) ? payload.topics : [];
}

function topicName(slug) {
  const item = topicIndex.get(slug);
  return TOPIC_NAMES[slug] ?? item?.thai ?? item?.name ?? slug;
}

function topicPath(slug) {
  const path = new Set();
  while (slug && !path.has(slug)) {
    path.add(slug);
    slug = topicIndex.get(slug)?.parent;
  }
  return [...path];
}

function buildTopics(items) {
  topicIndex = new Map();
  for (const item of items) {
    const slug = item.slug ?? item.id;
    if (slug) topicIndex.set(slug, item);
  }

  const select = $('topicSelect');
  const selected = select.value;
  select.replaceChildren(new Option('全部主题', ''));
  for (const slug of topicIndex.keys()) {
    const depth = topicPath(slug).length - 1;
    const prefix = depth ? '　'.repeat(depth - 1) + '└ ' : '';
    select.add(new Option(prefix + topicName(slug), slug));
  }
  select.value = topicIndex.has(selected) ? selected : '';
  select.disabled = !topicIndex.size;
}

function searchFields(d) {
  const topics = d.topics.flatMap(slug => [topicName(slug), topicIndex.get(slug)?.thai, slug]);
  const groups = Object.entries(d.groups).flatMap(([key, values]) => values.map(value => SECTIONS[key].groups[value]));
  const regions = d.regions.flatMap(key => key === 'pattaya' ? ['芭提雅', '芭堤雅', 'พัทยา', key] : [provinceName(key), key]);
  return [d.id, d.t, d.zh, d.dt, ...topics, ...groups, ...regions].filter(Boolean).map(normalize);
}

function renderItem(d) {
  const row = el('article', 'result-row');
  const meta = el('div', 'meta');
  const date = el('time', '', d.d);
  date.dateTime = d.d;
  meta.append(date);
  if (d.topic) meta.append(el('span', 'chip', topicName(d.topic)));
  for (const region of d.regions) {
    meta.append(internalLink(provinceName(region), sectionHref('regions', { province: region }), 'chip'));
  }
  for (const group of d.groups[section] ?? []) {
    meta.append(el('span', 'chip lens-chip', SECTIONS[section].groups[group]));
  }
  meta.append(el('span', d.zh ? 'chip' : 'chip pending', d.zh ? '中文参考译名' : '尚无中文译名'));

  const title = el('h3', '', d.zh || d.t);
  row.append(meta, title);
  if (d.zh) {
    const thai = el('p', 'thai', d.t);
    thai.lang = 'th';
    row.append(thai);
  } else {
    title.lang = 'th';
  }

  const links = el('div', 'links');
  const official = pdf(d.u);
  links.append(link(official ? '官方公报 PDF ↗' : '官方公报主页 ↗', official ?? GAZETTE + '/'));
  links.append(el('span', '', d.id));
  const source = '原始发布：泰国《皇家公报》 · 数据整理：Open Law Data Thailand';
  row.append(links, el('p', 'source-notes', d.zh ? source + ' · 中文译名：Thai Legal Watch CN' : source));
  return row;
}

function render() {
  const terms = $('queryInput').value.trim().split(/\s+/).filter(Boolean).map(normalize);
  const from = $('fromDate').value;
  const to = $('toDate').value;
  const topic = $('topicSelect').value;
  const mode = $('translationFilter').value;
  const province = $('provinceSelect').value;
  const focus = sectionParams.get('focus');
  const groups = SECTIONS[section].groups;
  let scoped = docs;
  if (groups) {
    const selected = Object.hasOwn(groups, focus);
    scoped = docs.filter(d => selected ? d.groups[section].includes(focus) : d.groups[section].length);
  } else if (section === 'regions') {
    scoped = docs.filter(d => d.regions.length);
  }
  const invalidRange = from && to && from > to;
  const filtered = invalidRange ? [] : scoped.filter(d =>
    (!from || d.d >= from) &&
    (!to || d.d <= to) &&
    (!topic || d.topics.includes(topic)) &&
    (!province || d.regions.includes(province)) &&
    (mode === 'all' || Boolean(d.zh) === (mode === 'translated')) &&
    terms.every(term => (d.search ??= searchFields(d)).some(field => field.includes(term)))
  );

  const chinese = filtered.filter(d => d.zh).length;
  $('countLabel').textContent = '匹配 ' + fmt(filtered.length) + ' / 共 ' + fmt(scoped.length) +
    ' 条 · 已译 ' + fmt(chinese) + ' · 待译 ' + fmt(filtered.length - chinese);
  const list = document.createDocumentFragment();
  let lastDate;
  for (const d of filtered.slice(0, pageSize)) {
    if (d.d !== lastDate) {
      lastDate = d.d;
      list.append(el('h3', 'day-heading', d.d));
    }
    list.append(renderItem(d));
  }
  $('list').replaceChildren(list);
  $('emptyBox').hidden = filtered.length !== 0;
  $('emptyBox').textContent = invalidRange ? '起始日期应早于或等于截止日期。' : '没有符合条件的记录。';
  $('moreButton').hidden = filtered.length <= pageSize;
  $('moreButton').textContent = '加载更多（剩余 ' + fmt(Math.max(0, filtered.length - pageSize)) + ' 条）';
}

function reset() {
  pageSize = INITIAL_PAGE_SIZE;
  if (loaded) render();
}

async function fetchJSON(url) {
  const response = await fetch(url, { cache: 'no-cache', signal: AbortSignal.timeout?.(15000) });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

async function load() {
  const refresh = $('refreshButton');
  refresh.disabled = true;
  $('errorBox').hidden = true;
  $('statusLabel').textContent = '正在读取上游公报…';
  try {
    const [source, tax, cache, meta] = await Promise.allSettled([
      fetchJSON(BASE + '/agg/latest.json'),
      fetchJSON(BASE + '/index/topics.json'),
      fetchJSON('./data/translations.json'),
      fetchJSON(BASE + '/agg/meta.json'),
    ]);
    if (source.status === 'rejected') throw source.reason;
    const { docs: upstream, to } = source.value ?? {};
    const start = new Date(to + 'T00:00:00Z');
    if (!Array.isArray(upstream) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || !Number.isFinite(start.getTime())) {
      throw new Error('上游数据格式有变');
    }

    const cacheData = cache.status === 'fulfilled' ? cache.value : null;
    const validCache = cacheData?.schema === 1 && cacheData.titles &&
      typeof cacheData.titles === 'object' && !Array.isArray(cacheData.titles);
    const titles = validCache ? cacheData.titles : {};
    const items = tax.status === 'fulfilled' ? getTopics(tax.value) : [];
    buildTopics(items);

    // Use publication dates. The upstream nominal window can contain older records.
    start.setUTCDate(start.getUTCDate() - WINDOW_DAYS + 1);
    const since = start.toISOString().slice(0, 10);
    docs = upstream
      .filter(d => d.d >= since && d.d <= to)
      .map(({ id, t, d, dt, pr, topic, u, action, tc }) => ({
        id, t, d, dt, topic, u,
        regions: regionsFor(pr, t),
        zh: translated({ id, t }, titles),
        topics: topicPath(topic),
        groups: classify({ t, topic, action, tc }),
      }));

    loaded = true;
    buildProvinces();
    applySectionFilters();
    $('totalDocs').textContent = fmt(docs.length);
    $('translatedCount').textContent = validCache ? fmt(docs.filter(d => d.zh).length) : '—';
    $('latestDate').textContent = to;
    $('rangeLabel').textContent = since + ' 至 ' + to + '（90 天）';
    const stamp = meta.status === 'fulfilled' ? Date.parse(meta.value?.generated_at) : NaN;
    $('updatedLabel').textContent = Number.isFinite(stamp)
      ? '上游构建于 ' + bangkokTime.format(stamp) + '（曼谷时间）'
      : '';
    $('statusLabel').textContent = [
      validCache ? '公报和译文缓存已读取' : '译文缓存暂不可用，显示泰文原标题',
      items.length ? '' : '主题筛选暂不可用',
    ].filter(Boolean).join(' · ');
    reset();
    if (section === 'regions') renderDiscovery();
  } catch (err) {
    $('statusLabel').textContent = docs.length ? '刷新失败，仍显示上次加载的记录' : '加载失败';
    if (!docs.length) $('list').replaceChildren();
    $('errorBox').hidden = false;
    $('errorBox').replaceChildren(
      document.createTextNode('无法读取上游公报（' + (err?.message ?? err) + '）。 '),
      internalLink('查看数据来源', './about.html'),
    );
  } finally {
    refresh.disabled = false;
  }
}

function internalLink(text, href, className) {
  const anchor = el('a', className, text);
  anchor.href = href;
  return anchor;
}

function clearFilters() {
  for (const id of filterIds) $(id).value = id === 'translationFilter' ? 'all' : '';
}

function readSection() {
  const [key, query] = location.hash.slice(1).split('?');
  const next = Object.hasOwn(SECTIONS, key) ? key : 'gazette';
  if (next !== section) clearFilters();
  section = next;
  sectionParams = new URLSearchParams(query);
  applySectionFilters();

  for (const anchor of document.querySelectorAll('.section-nav a')) {
    if (anchor.hash === sectionHref(section)) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  }
  $('resultsTitle').textContent = section === 'gazette' ? '最新公报文件' : SECTIONS[section].title + ' · 公报文件';
  reset();
  renderDiscovery();
}

function applySectionFilters() {
  const regionFilter = $('provinceSelect');
  regionFilter.options[0].text = section === 'regions' ? '全部已识别地域' : '全部地域';
  if (section === 'gazette') {
    const topic = sectionParams.get('topic');
    $('topicSelect').value = topicIndex.has(topic) ? topic : '';
  }
  if (section === 'regions') {
    const province = sectionParams.get('province');
    regionFilter.value = province && [...regionFilter.options].some(item => item.value === province) ? province : '';
  }
}

function setSectionParam(key, value) {
  if (value) sectionParams.set(key, value);
  else sectionParams.delete(key);
  history.replaceState(null, '', sectionHref(section, sectionParams));
  if (section === 'regions') renderDiscovery();
}

function buildProvinces() {
  provinceCounts = new Map();
  for (const d of docs) {
    for (const key of d.regions) provinceCounts.set(key, (provinceCounts.get(key) ?? 0) + 1);
  }
  const other = [...new Set([...provinceKeys, ...provinceCounts.keys()])]
    .filter(name => !featuredRegions.includes(name))
    .sort((a, b) => provinceName(a).localeCompare(provinceName(b), 'zh-CN'));
  const select = $('provinceSelect');
  const selected = select.value;
  select.replaceChildren(new Option('全部地域', ''));
  for (const [label, names] of [['常用地区', featuredRegions], ['其他府', other]]) {
    const group = el('optgroup');
    group.label = label;
    for (const name of names) {
      const thai = name === 'pattaya' ? 'พัทยา' : name;
      group.append(new Option(provinceName(name) + ' · ' + thai, name));
    }
    select.append(group);
  }
  select.value = selected;
}

function renderLens(body, info) {
  body.append(el('p', 'discovery-intro', info.summary));
  const current = sectionParams.get('focus');
  const active = Object.hasOwn(info.groups, current) ? current : '';
  const nav = el('nav', 'discovery-options');
  nav.setAttribute('aria-label', '栏目细分');
  for (const [key, label] of [['', '全部'], ...Object.entries(info.groups)]) {
    const anchor = internalLink(label, sectionHref(section, key ? { focus: key } : {}));
    if (key === active) anchor.setAttribute('aria-current', 'page');
    nav.append(anchor);
  }
  body.append(nav, el('p', 'discovery-note', '依据上游主题和泰文标题自动筛选，覆盖范围以近 90 天公报为准。'));
}

function renderRegions(body) {
  body.append(el('p', 'discovery-intro', '先选常用城市或府。其他地区可在筛选栏查找。'));
  const active = $('provinceSelect').value;
  const nav = el('nav', 'discovery-options');
  nav.setAttribute('aria-label', '常用地区');
  for (const name of featuredRegions) {
    const count = loaded ? ' ' + fmt(provinceCounts.get(name) ?? 0) : '';
    const anchor = internalLink(provinceName(name) + count, sectionHref('regions', { province: name }));
    if (name === active) anchor.setAttribute('aria-current', 'page');
    nav.append(anchor);
  }
  body.append(nav, el('p', 'discovery-note',
    '按上游地域标签及标题中的明确地名筛选。芭提雅单列，其记录也计入春武里府。'));
}

function renderDiscovery() {
  $('discoveryPanel').hidden = section === 'gazette';
  if (section === 'gazette') return;

  const info = SECTIONS[section];
  const body = $('discoveryBody');
  $('discoveryTitle').textContent = info.title;
  body.replaceChildren();
  if (section === 'regions') renderRegions(body);
  else renderLens(body, info);
}

for (const id of filterIds) {
  $(id).addEventListener(id === 'queryInput' ? 'input' : 'change', reset);
}
$('provinceSelect').addEventListener('change', () => {
  if (section === 'regions') setSectionParam('province', $('provinceSelect').value);
});
$('topicSelect').addEventListener('change', () => {
  if (section === 'gazette') setSectionParam('topic', $('topicSelect').value);
});
$('resetButton').addEventListener('click', () => {
  clearFilters();
  sectionParams = new URLSearchParams();
  history.replaceState(null, '', sectionHref(section));
  reset();
  renderDiscovery();
});
$('refreshButton').addEventListener('click', load);
$('moreButton').addEventListener('click', () => {
  pageSize += 100;
  render();
});
window.addEventListener('hashchange', readSection);
readSection();
load();
