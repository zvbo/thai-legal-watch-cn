// Required Chinese renderings for recurring Thai legal terms. The PR check applies these to
// every new or changed translation, and search uses the synonym groups so a Chinese query also
// matches the Thai title.

// [Thai term in the title subject, required Chinese (regex), standard rendering]
export const TERMS = [
  ['ตรวจลงตรา', /签证|免签/, '签证'],
  ['สำนักงานตรวจคนเข้าเมือง', /移民局/, '移民局'],
  ['ตรวจคนเข้าเมือง', /移民|入境/, '移民 / 入境检查'],
  ['กรมสรรพสามิต', /消费税厅/, '消费税厅'],
  ['สรรพสามิต', /消费税/, '消费税'],
  ['กรมสรรพากร', /税务厅/, '税务厅'],
  ['กรมศุลกากร', /海关厅/, '海关厅'],
  ['ศุลกากร', /海关/, '海关'],
  ['ภาษีธุรกิจเฉพาะ', /特定营业税/, '特定营业税'],
  ['ภาษีมูลค่าเพิ่ม', /增值税/, '增值税'],
  ['ภาษีเงินได้', /所得税/, '所得税'],
  ['กรมการจัดหางาน', /就业厅/, '就业厅'],
  ['กรมสวัสดิการและคุ้มครองแรงงาน', /劳[动工]福利与保护厅/, '劳工福利与保护厅'],
  ['ใบอนุญาตทำงาน', /工作许可/, '工作许可'],
  ['คนต่างด้าว', /外国|外籍/, '外国人'],
  ['ประกันสังคม', /社会保险/, '社会保险'],
  ['ส่งเสริมการลงทุน', /投资促进/, '投资促进'],
  ['คณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์', /证券交易委员会/, '证券交易委员会'],
  ['ป.ป.ง.', /反洗钱/, '反洗钱办公室'],
  ['ฟอกเงิน', /洗钱/, '反洗钱'],
  ['ธนาคารแห่งประเทศไทย', /泰国银行/, '泰国银行'],
  ['กรมที่ดิน', /土地厅/, '土地厅'],
  ['สำนักงานตำรวจแห่งชาติ', /国家警察总署/, '国家警察总署'],
  ['อาคารชุด', /公寓/, '公寓'],
  ['องค์การบริหารส่วนตำบล', /镇行政组织/, '镇行政组织'],
  ['องค์การบริหารส่วนจังหวัด', /府行政组织/, '府行政组织'],
  ['สมาชิกสภาผู้แทนราษฎร', /众议员|众议院议员/, '众议员'],
  ['สมาชิกวุฒิสภา', /参议员|参议院议员/, '参议员'],
];

// Chinese renderings that are wrong whatever the title says.
const FORBIDDEN = [
  [/(?<!节|反|外)省(?!略|钱|时|去)/, '泰国的府不写作“省”'],
  [/曼谷府/, '曼谷不加“府”'],
  [/移民审查/, 'สำนักงานตรวจคนเข้าเมือง 译作“移民局”'],
  [/สมาชิก(?:สภาผู้แทนราษฎร|วุฒิสภา)|〔ของ/, '提出人括注需译成中文'],
];

const TITLE_TYPES = [['กฎกระทรวง', /部令/, '部令']];

const subjectOf = source => source.split('[')[0].replace(/\s+/g, '').normalize('NFC');

// provinces: { thaiName: '标准中文名' } as used by the region filter.
export function glossaryProblems(source, zh, provinces = {}) {
  const subject = subjectOf(source);
  const whole = source.replace(/\s+/g, '').normalize('NFC');
  const problems = [];
  const covered = [];
  for (const [th, required, standard] of TERMS) {
    if (!subject.includes(th) || covered.some(longer => longer.includes(th))) continue;
    covered.push(th);
    if (!required.test(zh)) problems.push(`${th} 应译作“${standard}”`);
  }
  for (const [th, required, standard] of TITLE_TYPES) {
    if (subject.startsWith(th) && !required.test(zh)) problems.push(`${th} 应译作“${standard}”`);
  }
  for (const [pattern, message] of FORBIDDEN) {
    if (pattern.test(zh)) problems.push(message);
  }
  for (const [thai, name] of Object.entries(provinces)) {
    const base = name.replace(/府$/, '');
    const tag = thai === 'กรุงเทพมหานคร' ? thai : 'จังหวัด' + thai;
    if (subject.includes(tag) && !zh.includes(base.length > 1 ? base : name)) {
      problems.push(`${tag} 应译作“${name}”`);
    }
    if (name.endsWith('府') && zh.includes(name) && !whole.includes(thai)) {
      problems.push(`泰文原题没有${thai}，译名却出现“${name}”`);
    }
  }
  return problems;
}

// Each group lists terms a reader may type; any one of them matches all the others.
const SEARCH_GROUPS = [
  ['签证', '免签', '落地签', 'ตรวจลงตรา', 'visa'],
  ['移民局', '移民', '入境', '出入境', 'ตรวจคนเข้าเมือง', 'immigration'],
  ['工作许可', '工作证', '劳工证', 'ใบอนุญาตทำงาน', 'work permit'],
  ['外国人', '外籍', '外籍人士', 'คนต่างด้าว', 'ชาวต่างชาติ', 'ชาวต่างประเทศ'],
  ['消费税', '消费税厅', 'สรรพสามิต', 'excise'],
  ['税务厅', '税务局', '税务署', 'สรรพากร'],
  ['海关', '海关厅', 'ศุลกากร', 'customs'],
  ['增值税', 'vat', 'ภาษีมูลค่าเพิ่ม'],
  ['所得税', 'ภาษีเงินได้'],
  ['特定营业税', '特别营业税', 'ภาษีธุรกิจเฉพาะ'],
  ['社保', '社会保险', 'ประกันสังคม'],
  ['证监会', '证券交易委员会', 'ก.ล.ต.', 'คณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์'],
  ['boi', '投资促进', '投资委', 'ส่งเสริมการลงทุน'],
  ['反洗钱', 'ป.ป.ง.', 'ฟอกเงิน', 'aml'],
  ['央行', '泰国银行', 'ธนาคารแห่งประเทศไทย'],
  ['最低工资', 'ค่าจ้างขั้นต่ำ'],
  ['就业厅', 'กรมการจัดหางาน'],
  ['劳工部', 'กระทรวงแรงงาน'],
  ['土地厅', '土地局', 'กรมที่ดิน', 'สำนักงานที่ดิน'],
  ['公寓', '共管公寓', 'อาคารชุด', 'คอนโด', 'condo'],
  ['部令', '部级规章', 'กฎกระทรวง'],
  ['皇家法令', '敕令', 'พระราชกฤษฎีกา'],
  ['警察', 'ตำรวจ'],
  ['北榄', '沙没巴干', 'สมุทรปราการ'],
  ['北柳', '差春骚', 'ฉะเชิงเทรา'],
  ['素叻', '素叻他尼', 'สุราษฎร์ธานี'],
  ['龙仔厝', '沙没沙空', 'สมุทรสาคร'],
  ['夜功', '沙没颂堪', 'สมุทรสงคราม'],
  ['大城', '阿瑜陀耶', 'พระนครศรีอยุธยา'],
  ['呵叻', '那空叻差是玛', 'นครราชสีมา'],
  ['洛坤', '那空是贪玛叻', 'นครศรีธรรมราช'],
  ['巴吞他尼', '巴吞', 'ปทุมธานี'],
  ['素攀', '素攀武里', 'สุพรรณบุรี'],
  ['坤西育', '那空那育', 'นครนายก'],
];

const normalizeTerm = value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
const SYNONYMS = new Map();
for (const group of SEARCH_GROUPS) {
  const terms = group.map(normalizeTerm);
  for (const term of terms) SYNONYMS.set(term, [...new Set([...(SYNONYMS.get(term) ?? []), ...terms])]);
}

// Returns the normalized query term followed by its synonyms.
export function searchAlternatives(term) {
  const key = normalizeTerm(term);
  return SYNONYMS.get(key) ?? SYNONYMS.get(key.replace(/府$/, '')) ?? [key];
}
