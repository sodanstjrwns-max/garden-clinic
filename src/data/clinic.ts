// ============================================================
// 정원한의원 오산 - 중앙 데이터 레이어
// 신청서(45문항) → §B 의료광고법 필터 통과 후 가공된 사실 데이터
// 사실관계(자격/경력/학위/면허)는 신청서 원문만 사용. 창작 금지.
// ============================================================

export const CLINIC = {
  name: '정원한의원',
  nameFull: '정원한의원 오산',
  nameEn: 'Jeongwon Korean Medicine Clinic',
  // 도메인 (신청서 결측 → 성격 기반 생성, 배포 시 실제 도메인으로 교체)
  domain: 'https://jeongwon-hani.pages.dev',
  tagline: '가고 싶은 한의원의 표준이 되겠습니다',
  mission: '불안, 불편, 불신을 줄여 치료에 집중할 수 있는 한의원',
  ceo: '심원석',
  ceoTitle: '대표원장',
  phone: '031-831-8620',
  phoneRaw: '0318318620',
  email: '365garden@naver.com',
  bizRegNo: '', // 결측 → 상담 시 안내 / 푸터 노출용 비움
  openedYear: 2020,
  openedMonth: 12,
  openedDate: '2020-12',
  doctorCount: 8,
  // 주소
  address: {
    full: '경기도 오산시 성호대로 74, 1-2층',
    short: '오산시 성호대로 74',
    city: '오산시',
    region: '경기도',
    // 좌표 (오산시 성호대로 74 인근 추정치 - 배포 전 실측 권장)
    lat: 37.1455,
    lng: 127.0772,
  },
  // 진료시간 (신청서 Q8)
  hours: {
    weekday: { label: '평일', time: '오전 8:30 ~ 오후 8:00' },
    weekend: { label: '주말·공휴일', time: '오전 8:30 ~ 오후 3:00' },
    note: '점심시간 및 휴진은 전화로 문의해 주세요.',
  },
  // 오시는 길 (신청서 Q7)
  directions: {
    parking:
      '전용주차장이 한의원 뒷문과 바로 연결됩니다. 내비게이션에 "정원한의원 주차장"(오산동 876-12)으로 검색하세요. 만차 시 인근 공영주차장(오색시장·오산역·문화의 거리) 이용 후 진료받으시면 2시간 주차를 지원해 드립니다.',
    bus:
      '[오산 농협중앙회] 정류장 바로 앞 건물 1층입니다. 7-5, 21, 22, 34, 111, C3, C4, 10, 88, 100, 333, 500번.',
    subway:
      '오산역 1번 출구에서 중원사거리 → 오색시장 입구 방면으로 도보 약 5분.',
  },
  // SNS / 기존 자산 (Q36~38)
  social: {
    youtube: '', // 다이어트 유튜브 운영 중 (Q13) - URL 미제공 → 결측
    blog: '',
    instagram: '',
  },
  // 브랜드 (Q24~26)
  brand: {
    mood: ['깔끔하고 모던한', '전문적이고 신뢰감 있는'],
    color: 'green', // 스타벅스 그린
    hasLogo: true,
  },
} as const

// 핵심 가치 (Q22)
export const CORE_VALUES = [
  {
    icon: 'fa-bullseye',
    title: '예측 가능성',
    desc: '재진 환자에게는 오늘의 치료·소요 시간·순서를, 초진 환자에게는 앞으로의 진료 과정을 미리 안내합니다. 막연한 불안 대신 분명한 그림을 드립니다.',
  },
  {
    icon: 'fa-award',
    title: '전문성',
    desc: '한방내과 전문의 진료를 바탕으로 한 체질 맞춤 한약 처방과 표준화된 치료 프로토콜로 일관된 진료 품질을 유지합니다.',
  },
  {
    icon: 'fa-comments',
    title: '이해되는 설명',
    desc: '한의학은 어렵다는 인식을 바꿉니다. 쉬운 언어와 이미지로 설명하고, 치료 기간·비용을 미리 안내해 이해하고 동의한 치료를 진행합니다.',
  },
] as const

export const SITE_NAV = [
  { label: '병원미션', href: '/mission' },
  { label: '의료진', href: '/doctors' },
  {
    label: '진료',
    href: '/treatments',
    mega: true,
  },
  {
    label: '콘텐츠',
    href: '/cases/gallery',
    children: [
      { label: '비포/애프터', href: '/cases/gallery' },
      { label: '원장 칼럼', href: '/column' },
      { label: '한방 백과사전', href: '/encyclopedia' },
    ],
  },
  {
    label: '안내',
    href: '/directions',
    children: [
      { label: '오시는 길', href: '/directions' },
      { label: '진료시간·비용', href: '/pricing' },
      { label: '자주 묻는 질문', href: '/faq' },
      { label: '공지사항', href: '/notice' },
      { label: '체질 TI 테스트', href: '/sasang-test' },
    ],
  },
] as const
