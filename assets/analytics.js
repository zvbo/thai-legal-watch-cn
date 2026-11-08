const websiteId = 'e79c95d8-3897-43eb-8df8-31e42270e88b';
const collector = 'https://gateway.umami.is/api/send';
const sitePath = '/thai-legal-watch-cn/';
const path = location.pathname;
const production = location.hostname === 'zvbo.github.io' &&
  [sitePath, sitePath + 'index.html', sitePath + 'about.html'].includes(path);
const enabled = production && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(websiteId);
const page = path.endsWith('/about.html') ? '/about.html' : '/';

export function track(name, data) {
  if (!enabled || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;

  // Send only the canonical page path and the explicitly selected event fields.
  const payload = { website: websiteId, hostname: location.hostname, url: page, name, data };
  fetch(collector, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'event', payload }),
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    keepalive: true,
  }).catch(() => {});
}

async function showPublicSummary(panel) {
  try {
    const response = await fetch(new URL('../data/traffic-summary.json', import.meta.url), {
      cache: 'no-cache',
    });
    if (!response.ok) return;
    const summary = await response.json();
    const stamp = Date.parse(summary.generated_at);
    const fields = panel.querySelectorAll('[data-traffic-total]');
    if (!Number.isFinite(stamp) || [...fields].some(field => {
      const value = summary[field.dataset.trafficTotal];
      return !Number.isSafeInteger(value) || value < 0;
    })) return;

    const number = new Intl.NumberFormat('zh-CN');
    for (const field of fields) field.textContent = number.format(summary[field.dataset.trafficTotal]);
    panel.querySelector('dl').hidden = false;
    const time = new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok',
    });
    panel.querySelector('[data-traffic-status]').textContent =
      '数据截至 ' + time.format(stamp) + '（曼谷时间）。各统计周期以该时间为准。';
  } catch {
    // A missing or unavailable summary leaves the default status visible.
  }
}

track();
const publicPanel = document.getElementById('traffic-summary');
if (publicPanel) showPublicSummary(publicPanel);
