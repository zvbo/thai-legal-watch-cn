const APPOINTMENTS = /เรื่อง(?:การให้พ้นจากตำแหน่ง|แต่งตั้ง|ให้.+?พ้นจากตำแหน่ง|ตั้งกรรมาธิการ.+?แทนตำแหน่งที่ว่าง)|พระราชทาน(?:สัญญาบัตรตั้งสมณศักดิ์|เครื่องราชอิสริยาภรณ์|ยศ)|พระบรมราชโองการประกาศ.*(?:แต่งตั้ง|ปรับลดชั้นยศ)|สถาปนาสมณศักดิ์/;
const INDIVIDUAL_DECISION = /ไร้ความสามารถ|สาบสูญ|ให้ถอน.+?การเป็นผู้อนุบาล|ถอนผู้อนุบาล|ตั้งผู้อนุบาล|ศาลมีคำสั่งให้เลิก/;
const CONSTITUTIONAL_DECISION = /คำวินิจฉัย(?:ของ)?ศาลรัฐธรรมนูญ|ประกาศสำนักงานศาลรัฐธรรมนูญเรื่องผลแห่งคำวินิจฉัย/;
const LIQUIDATION_NOTICE = /^ประกาศเจ้าพนัก(?:งาน)?บังคับคดีเรื่อง(?:ชำระบัญชี|ถอนการตั้งผู้ชำระบัญชี)/;
const PERSONNEL_NOTICE = /^(?:ประกาศ|คำสั่ง|พระบรมราชโองการ)/;

export function translationScope({ t, topic, action }) {
  const subject = (t ?? '').split('[')[0].replace(/\s+/g, '');
  if (subject.startsWith('ประกาศเจ้าพนักงานพิทักษ์ทรัพย์') ||
      (topic === 'bankruptcy' && (action === 'court_order' || LIQUIDATION_NOTICE.test(subject)))) {
    return 'bankruptcy';
  }
  if (action === 'appointment' || action === 'decoration' ||
      (PERSONNEL_NOTICE.test(subject) && APPOINTMENTS.test(subject))) {
    return 'personnel';
  }
  if (CONSTITUTIONAL_DECISION.test(subject)) return 'review';
  if ((topic === 'court' && (action === 'court_order' || INDIVIDUAL_DECISION.test(subject))) ||
      (action === 'court_order' && subject.includes('ศาลมีคำสั่ง'))) {
    return 'case';
  }
  return 'eligible';
}

export function translationState(doc, titles) {
  const scope = translationScope(doc);
  if (scope !== 'eligible' && scope !== 'review') return { status: 'excluded', zh: '' };

  const entry = titles[doc.id];
  const verified = entry && entry.source === doc.t && typeof entry.zh === 'string';
  const approved = scope === 'eligible' || entry?.reviewed === true;
  const zh = verified && approved ? entry.zh.trim() : '';
  return { status: zh ? 'translated' : scope === 'review' ? 'review' : 'pending', zh };
}

export function recentGazette(source) {
  const { docs, to } = source ?? {};
  const start = new Date(to + 'T00:00:00Z');
  if (!Array.isArray(docs) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || !Number.isFinite(start.getTime())) {
    throw new Error('上游数据格式有变');
  }
  // The upstream nominal window can contain older records.
  start.setUTCDate(start.getUTCDate() - 89);
  const from = start.toISOString().slice(0, 10);
  return { from, to, docs: docs.filter(d => d.d >= from && d.d <= to) };
}
