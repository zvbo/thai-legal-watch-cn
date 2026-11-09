import { translationScope } from './translation-policy.js';

export const SECTIONS = {
  gazette: { title: '最新公报' },
  invest: {
    title: '投资泰国',
    summary: '查看与在泰投资、企业经营及中泰经贸相关的公报。',
    groups: {
      foreign: '外资准入', capital: '投资促进', disputes: '商业争议与重整',
      china: '中国相关', customs: '海关', tax: '税务', 'transfer-pricing': '转让定价',
      'intellectual-property': '知识产权',
    },
    scope: {
      foreign: '如外商经营许可与豁免',
      capital: '如 BOI 优惠、东部经济走廊和特别经济促进区',
      disputes: '如商业争议处理及企业重整情形的报告程序',
      china: '如涉华贸易、投资和进出口措施',
      customs: '如通关、关税和关税配额',
      tax: '如所得税、增值税和消费税',
      'transfer-pricing': '如关联交易定价及申报',
      'intellectual-property': '如商标、专利、著作权和地理标志',
    },
  },
  living: {
    title: '生活在泰国',
    summary: '查看签证移民、公共安全、社会保障、消费者保护和劳动权益相关公报。',
    groups: {
      immigration: '签证与移民', safety: '公共安全', welfare: '社会保障与消费保护', labour: '劳动权益',
    },
    scope: {
      immigration: '如签证、免签、入境停留、移民局命令和外国人工作许可',
      safety: '如道路安全、灾害和紧急状态',
      welfare: '包括社保、医疗保障、残疾人福利和消费者保护',
      labour: '如职业安全和雇员福利基金',
    },
  },
  regions: { title: '按地域' },
};

export const featuredRegions = [
  'กรุงเทพมหานคร',
  'สมุทรปราการ',
  'ชลบุรี',
  'pattaya',
  'ระยอง',
  'เชียงใหม่',
];

const PROVINCES = {
  กรุงเทพมหานคร: '曼谷', นนทบุรี: '暖武里府', สมุทรปราการ: '北榄府', ชลบุรี: '春武里府',
  นครราชสีมา: '呵叻府', เชียงใหม่: '清迈府', เชียงราย: '清莱府', ปทุมธานี: '巴吞他尼府',
  อุดรธานี: '乌隆府', ลำปาง: '南邦府', ปัตตานี: '北大年府', ร้อยเอ็ด: '黎逸府',
  นครศรีธรรมราช: '洛坤府', นครปฐม: '佛统府', สกลนคร: '色军府', สุรินทร์: '素林府',
  พระนครศรีอยุธยา: '大城府', ยะลา: '也拉府', บุรีรัมย์: '武里南府', นครสวรรค์: '北榄坡府',
  ภูเก็ต: '普吉府', ขอนแก่น: '孔敬府', ฉะเชิงเทรา: '北柳府', อุบลราชธานี: '乌汶府',
  สงขลา: '宋卡府', สุพรรณบุรี: '素攀武里府', พิษณุโลก: '彭世洛府', สมุทรสาคร: '龙仔厝府',
  ประจวบคีรีขันธ์: '巴蜀府', ราชบุรี: '叻丕府', อุตรดิตถ์: '程逸府', พะเยา: '帕尧府',
  ตรัง: '董里府', ระยอง: '罗勇府', นราธิวาส: '陶公府', สระบุรี: '北标府',
  กาฬสินธุ์: '加拉信府', ศรีสะเกษ: '四色菊府', มหาสารคาม: '玛哈沙拉堪府', ชัยนาท: '猜纳府',
  พิจิตร: '披集府', เลย: '黎府', ลพบุรี: '华富里府', สุราษฎร์ธานี: '素叻府',
  กำแพงเพชร: '甘烹碧府', จันทบุรี: '尖竹汶府', เพชรบูรณ์: '碧差汶府', น่าน: '难府',
  หนองคาย: '廊开府', นครพนม: '那空拍侬府', ชัยภูมิ: '猜也奔府', แพร่: '帕府',
  กาญจนบุรี: '北碧府', สุโขทัย: '素可泰府', เพชรบุรี: '佛丕府', ตาก: '达府',
  กระบี่: '甲米府', สตูล: '沙敦府', ยโสธร: '益梭通府', พัทลุง: '博他仑府',
  สมุทรสงคราม: '夜功府', ตราด: '达叻府', อุทัยธานี: '乌泰他尼府', ลำพูน: '南奔府',
  สระแก้ว: '沙缴府', หนองบัวลำภู: '廊磨喃蒲府', สิงห์บุรี: '信武里府', พังงา: '攀牙府',
  ปราจีนบุรี: '巴真府', อำนาจเจริญ: '安纳乍能府', อ่างทอง: '红统府', นครนายก: '坤西育府',
  ชุมพร: '春蓬府', มุกดาหาร: '莫拉限府', ระนอง: '拉廊府', แม่ฮ่องสอน: '夜丰颂府',
  บึงกาฬ: '汶干府',
};

export const provinceKeys = Object.keys(PROVINCES);

export function provinceName(thai) {
  return thai === 'pattaya' ? '芭提雅' : PROVINCES[thai] ?? thai;
}

const PATTAYA_PLACE = /เมืองพัทยา|ศาลจังหวัดพัทยา|(?:สมาคม|เทศบาล|อ่าว|ชายหาด|ท่าเรือ)[^[]*พัทยา/;

export function regionsFor(province, title) {
  const regions = new Set(province ? [province] : []);
  // Gazette titles may place personal or company names in a bracketed suffix.
  const subject = (title ?? '').split('[')[0];
  const compact = subject.replace(/\s+/g, '');
  for (const key of featuredRegions) {
    if (key === 'pattaya') {
      if (PATTAYA_PLACE.test(compact) || /\bpattaya\b/i.test(subject)) {
        regions.add(key);
        regions.add('ชลบุรี');
      }
    } else {
      const name = key === 'กรุงเทพมหานคร' ? key : 'จังหวัด' + key;
      if (compact.includes(name)) regions.add(key);
    }
  }
  return [...regions];
}

const FOREIGN_BUSINESS = /การประกอบธุรกิจของ(?:คนต่างด้าว|ชาวต่างชาติ)|ธุรกิจของคนต่างด้าว|การลงทุน(?:โดยคนต่างด้าว|ของคนต่างด้าว|จากต่างประเทศ|ของชาวต่างชาติ)|นักลงทุนต่างชาติ|การถือหุ้นของ(?:คนต่างด้าว|ชาวต่างชาติ)|นิติบุคคลต่างด้าว/;
const INVESTMENT = /ส่งเสริมการลงทุน|เขตพัฒนาพิเศษภาคตะวันออก|เขต(?:ส่งเสริม)?เศรษฐกิจพิเศษ|การลงทุนโดยตรงจากต่างประเทศ|การคุ้มครองการลงทุน/;
const COMMERCIAL_DISPUTE = /ข้อพิพาท(?:ทางการค้า|ทางธุรกิจ|ทางพาณิชย์|ทางการลงทุน|ด้านการลงทุน|เกี่ยวกับการลงทุน|ระหว่างรัฐกับผู้ลงทุน)|คดี(?:พาณิชย์|การค้าระหว่างประเทศ)|การระงับข้อพิพาท.*(?:การค้า|การลงทุน)|อนุญาโตตุลาการ|ฟื้นฟูกิจการ/;
const CHINA = /สาธารณรัฐประชาชนจีน|ประเทศจีน|จีนแผ่นดินใหญ่|ไทย\s*[-–—]?\s*จีน|จีน\s*[-–—]?\s*ไทย|(?:จาก|ของ|และ|กับ)\s*จีน(?=$|[\s,.)])|สินค้าจีน|นักลงทุนจีน|สัญชาติจีน|\bChina\b/i;
const CUSTOMS = /ศุลกากร|พิกัดอัตราอากร|อากรขาเข้า|อากรขาออก|เขตปลอดอากร|ภาษีในโควตา/;
const TAX = /ภาษี(?!อากร|ในโควตา)|สรรพากร|สรรพสามิต|รัษฎากร|อากรแสตมป์/;
const TRANSFER_PRICING = /ราคาโอน|บริษัทหรือห้างหุ้นส่วนนิติบุคคลที่มีความสัมพันธ์กัน|รายงาน(?:ข้อมูล)?ธุรกรรมระหว่างกัน/;
const REVENUE_CODE_TRANSFER_PRICING = /มาตรา(?:71|๗๑)(?:ทวิ|ตรี)/;
const INTELLECTUAL_PROPERTY = /ทรัพย์สินทางปัญญา|สิทธิบัตร(?!ทอง)|เครื่องหมายการค้า|ลิขสิทธิ์|สิ่งบ่งชี้ทางภูมิศาสตร์|ความลับทางการค้า|แบบผังภูมิของวงจรรวม/;
const PUBLIC_SAFETY = /ป้องกันและบรรเทาสาธารณภัย|บรรเทาสาธารณภัย|ความปลอดภัย(?:สาธารณะ|ทางถนน|ในการจราจร|ของประชาชน)|อุบัติเหตุบนถนน|ความปลอดภัย.*(?:อาคาร|การขนส่ง)|(?:อาคาร|การขนส่ง).*ความปลอดภัย/;
const WELFARE = /ประกันสังคม|สวัสดิการสังคม|หลักประกันสุขภาพ|คุ้มครองผู้บริโภค|กองทุนเงินทดแทน|สิทธิบัตรทอง/;
const IMMIGRATION = /ตรวจลงตรา|ตรวจคนเข้าเมือง|การเข้าเมือง|คนต่างด้าวอยู่ในราชอาณาจักร|ใบอนุญาตทำงาน|การทำงานของคนต่างด้าว|หนังสือเดินทาง/;
const WORKER_PROTECTION = /คุ้มครองแรงงาน|ค่าจ้างขั้นต่ำ|อัตราค่าจ้าง|กองทุนสงเคราะห์ลูกจ้าง|ความปลอดภัย(?:ในการทำงาน|อาชีวอนามัย)|อาชีวอนามัย|สภาพการจ้าง|แรงงานสัมพันธ์|สิทธิของลูกจ้าง|การทำงานของคนต่างด้าว/;

export function classify(doc) {
  const { t, topic, action, tc } = doc;
  const invest = [];
  const living = [];
  if (translationScope(doc) === 'personnel') return { invest, living };

  const title = (t ?? '').replace(/\s+/g, '').normalize('NFC');
  const subject = (t ?? '').split('[')[0].normalize('NFC');
  const compactSubject = subject.replace(/\s+/g, '');

  if (FOREIGN_BUSINESS.test(title)) invest.push('foreign');
  // An agency name or upstream tag can put unrelated records in the investment topic.
  const investmentTopic = topic === 'investment' && action !== 'parliament_proc';
  if (!title.includes('เหรียญกษาปณ์ที่ระลึก') && (investmentTopic || INVESTMENT.test(title))) {
    invest.push('capital');
  }
  if (COMMERCIAL_DISPUTE.test(title)) invest.push('disputes');

  const customs = CUSTOMS.test(compactSubject);
  const transferPricing = TRANSFER_PRICING.test(compactSubject) ||
    /\btransfer[\s-]+pricing\b/i.test(subject) ||
    (compactSubject.includes('ประมวลรัษฎากร') && REVENUE_CODE_TRANSFER_PRICING.test(compactSubject));
  if (CHINA.test(subject)) invest.push('china');
  if (customs) invest.push('customs');
  // The upstream tax topic combines domestic tax, customs and excise.
  if (transferPricing || TAX.test(compactSubject) || (!customs && topic === 'tax')) invest.push('tax');
  if (transferPricing) invest.push('transfer-pricing');
  if (INTELLECTUAL_PROPERTY.test(compactSubject)) invest.push('intellectual-property');

  if (IMMIGRATION.test(title)) living.push('immigration');
  if (topic === 'emergency' || (topic === 'disaster' && tc) || PUBLIC_SAFETY.test(title)) {
    living.push('safety');
  }
  if (topic === 'social_security' || topic === 'social_welfare' || WELFARE.test(title)) {
    living.push('welfare');
  }
  if (WORKER_PROTECTION.test(title)) living.push('labour');

  return { invest, living };
}

export function sectionHref(section, params = {}) {
  const query = new URLSearchParams(params).toString();
  return '#' + section + (query ? '?' + query : '');
}
