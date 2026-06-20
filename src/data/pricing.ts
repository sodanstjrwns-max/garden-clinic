// ============================================================
// 정원한의원 오산 — 비급여 진료비 안내 데이터
// 출처: 원장 제공 수가표(2026.03 기준)
// ※ 의료법 제45조(비급여 진료비 고지) 충족 목적의 '정가' 안내 데이터.
//    의료법 제27조(환자 유인 금지) 준수 — 할인율/할인가/유인 문구는 게재하지 않음.
//    가격은 변동될 수 있으며, 부위·용량·기간에 따라 달라지는 항목은 범위/단위로 표기.
// ============================================================

export type PriceItem = {
  name: string
  price: string // 표기용 문자열 (정가 기준)
  note?: string
}

export type PriceCategory = {
  key: string
  title: string
  icon: string
  desc?: string
  items: PriceItem[]
}

// 가격 포맷 헬퍼는 표기 일관성을 위해 문자열로 미리 작성
export const PRICE_CATEGORIES: PriceCategory[] = [
  {
    key: 'herb',
    title: '한약 (첩약)',
    icon: 'fa-mortar-pestle',
    desc: '1제(20일) 단위로 처방됩니다. 처방 구성과 기간은 체질·상태에 따라 달라질 수 있습니다.',
    items: [
      { name: '6주 집중 (40일)', price: '540,000원' },
      { name: '9주 심화 (60일)', price: '810,000원' },
      { name: '14주 완성 (100일)', price: '1,350,000원' },
      { name: '25주 안착 (180일)', price: '2,430,000원' },
      { name: '52주 유지 (360일)', price: '4,860,000원' },
    ],
  },
  {
    key: 'nokyong',
    title: '녹용 한약',
    icon: 'fa-leaf',
    desc: '1제(20일) 단위로 처방됩니다.',
    items: [
      { name: '러시아 분골 (40일)', price: '1,500,000원' },
      { name: '러시아 분골 상대 (40일)', price: '1,200,000원' },
      { name: '뉴질랜드 분골 (40일)', price: '1,000,000원' },
    ],
  },
  {
    key: 'diet',
    title: '다이어트',
    icon: 'fa-weight-scale',
    desc: '처방 구성과 기간은 상태에 따라 달라질 수 있습니다.',
    items: [
      { name: '다이어트 한약 6주 집중 (40일)', price: '480,000원', note: '1제(20일) 단위' },
      { name: '비움환 1~4단계 (1달)', price: '132,000원', note: '환제, 유지용 단계별 처방' },
      { name: '비움환 1~4단계 (3+1달)', price: '396,000원' },
      { name: '라인약침', price: '30,000원 ~', note: '지방분해 약침, 부위·용량에 따라 다름 (패키지 별도)' },
    ],
  },
  {
    key: 'add-herb',
    title: '추가 한약재',
    icon: 'fa-plus',
    desc: '한약 처방에 추가하는 약재입니다. (1제 20일 단위)',
    items: [
      { name: '자하거', price: '80,000원' },
      { name: '계족', price: '30,000원' },
    ],
  },
  {
    key: 'child',
    title: '소아 한약 (만 10세 미만)',
    icon: 'fa-child',
    desc: '30일 단위로 처방됩니다. 하루 복용 횟수·용량은 키·몸무게에 따라 달라집니다.',
    items: [
      { name: '러시아 녹용 분골 (30일)', price: '450,000원' },
      { name: '러시아 녹용 분골 상대 (30일)', price: '400,000원' },
    ],
  },
  {
    key: 'gongjin',
    title: '공진단',
    icon: 'fa-circle-dot',
    items: [
      { name: '원방공진단 10구', price: '680,000원', note: '사향 0.1mg, 10일' },
      { name: '사향공진단 10구', price: '450,000원', note: '사향 0.04mg, 10일' },
      { name: '총명공진단 10구', price: '220,000원', note: '10일' },
      { name: '녹용공진단 10구', price: '200,000원', note: '10일' },
    ],
  },
  {
    key: 'gyeongok',
    title: '경옥고',
    icon: 'fa-jar',
    items: [
      { name: '녹용경옥고 1박스 (30포)', price: '195,000원', note: '1일 2포씩 15일' },
      { name: '경옥고 1박스 (30포)', price: '175,000원', note: '1일 2포씩 15일' },
    ],
  },
  {
    key: 'exam',
    title: '검사',
    icon: 'fa-microscope',
    items: [
      { name: '한약검사비', price: '30,000원', note: '한약 처방 시 검사비 무료 / 한약을 하지 않을 경우 발생' },
      { name: '순환검사', price: '10,000원', note: '초진만, 재진은 무료' },
      { name: '뇌기능검사', price: '10,000원', note: '초진만, 재진은 무료' },
    ],
  },
  {
    key: 'pharmaco',
    title: '약침',
    icon: 'fa-syringe',
    desc: '부위·용량에 따라 다르며, 일부 항목은 패키지가 별도로 마련되어 있습니다.',
    items: [
      { name: '경근', price: '3,000원' },
      { name: '죽염', price: '5,000원' },
      { name: '순환약침', price: '10,000원 ~ 20,000원' },
      { name: '안면약침 · 내과약침', price: '13,000원' },
      { name: '봉침', price: '12,000원' },
      { name: '자하거약침', price: '13,000원' },
      { name: 'DNA약침', price: '20,000원 ~' },
      { name: '사독약침', price: '20,000원 ~' },
    ],
  },
  {
    key: 'maeseon',
    title: '매선',
    icon: 'fa-staff-snake',
    desc: '부위에 따라 다릅니다.',
    items: [
      { name: '매선 1회', price: '20,000원' },
      { name: '매선 1개', price: '7,000원', note: '발목·손목 등 소관절 1개' },
    ],
  },
  {
    key: 'otc',
    title: '상비약',
    icon: 'fa-prescription-bottle-medical',
    items: [
      { name: '감기약', price: '11,000원', note: '1일 탕약' },
      { name: '쌍화탕', price: '10,000원', note: '1일 탕약' },
      { name: '녹용쌍화탕', price: '15,000원', note: '1일 탕약' },
      { name: '생맥산', price: '8,000원', note: '1일 탕약 (여름철 한정)' },
      { name: '비움환 (변비약)', price: '9,000원', note: '1통(10~15일) 알약' },
      { name: '영신환 (소화제)', price: '10,000원', note: '1통(10~15일) 알약' },
      { name: '급성 소화한약', price: '6,000원', note: '1일 탕약' },
      { name: '급성 진정한약', price: '6,000원', note: '1일 탕약' },
      { name: '급성 타박상 · 어혈약', price: '6,000원', note: '1일 탕약' },
      { name: '급성 허리통증약', price: '5,000원', note: '1일 탕약' },
      { name: '급성 목·어깨통증약', price: '5,000원', note: '1일 탕약' },
      { name: '치질약', price: '7,000원', note: '1일 2포 가루약' },
      { name: '비염약', price: '7,000원', note: '1일 2포 가루약' },
      { name: '자운고', price: '5,000원', note: '한방 연고' },
      { name: '파스', price: '5,000원', note: '한방 습포제' },
      { name: '시프겔', price: '8,000원', note: '물파스' },
    ],
  },
  {
    key: 'chuna',
    title: '비급여 추나',
    icon: 'fa-hand-back-fist',
    desc: '건강보험 추나 연간 20회 초과 시 적용됩니다.',
    items: [
      { name: '단순추나', price: '25,600원' },
      { name: '정밀교정추나', price: '36,700원' },
    ],
  },
  {
    key: 'cert',
    title: '제증명 수수료',
    icon: 'fa-file-lines',
    items: [
      { name: '진단서 · 소견서', price: '20,000원' },
      { name: '상해진단서', price: '100,000원' },
      { name: '통원확인서 · 진료확인서', price: '3,000원' },
      { name: '초진기록지', price: '1,000원' },
      { name: '진료기록부 사본 (1~5매)', price: '1,000원' },
      { name: '진료기록부 사본 (6매 이상)', price: '1,000원 ~', note: '5장 초과 시 장당 100원' },
      { name: '제증명 사본', price: '1,000원' },
      { name: '근로능력평가용 진단서', price: '10,000원' },
    ],
  },
]
