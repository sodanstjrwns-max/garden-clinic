// ============================================================
// 정원한의원 오산 - 중앙 데이터 레이어
// 신청서(45문항) → §B 의료광고법 필터 통과 후 가공된 사실 데이터
// 사실관계(자격/경력/학위/면허)는 신청서 원문만 사용. 창작 금지.
// ============================================================

export const CLINIC = {
  name: '정원한의원',
  nameFull: '정원한의원 오산',
  nameEn: 'Jeongwon Korean Medicine Clinic',
  // 정식 도메인 (gardenclinic.kr 연결 완료 — SEO canonical 기준)
  domain: 'https://gardenclinic.kr',
  tagline: '가고 싶은 한의원의 표준이 되겠습니다',
  mission: '불안, 불편, 불신을 줄여 치료에 집중할 수 있는 한의원',
  ceo: '심원석',
  ceoTitle: '대표원장',
  phone: '031-831-8620',
  phoneRaw: '0318318620',
  email: '365garden@naver.com',
  bizRegNo: '208-94-13786', // 사업자등록증 기준
  openedYear: 2020,
  openedMonth: 11, // 사업자등록증 개업연월일 2020.11.26 기준
  openedDate: '2020-11',
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
  // SNS / 기존 채널 (2차 답변서 #3 — 원장 제공 원문)
  social: {
    youtube: 'https://www.youtube.com/@다이어트멘토김은아', // 김은아 원장 다이어트 채널 (현재 업로드 휴식 중)
    blog: 'https://blog.naver.com/27xhd',
    blog2: 'https://blog.naver.com/wunssuk',
    naverPlace: 'https://naver.me/5EQRj8w3',
    kakao: 'https://pf.kakao.com/_eLiln',
    threads: 'https://www.threads.net/@garden365clinic_official',
    instagram: '',
    legacyHomepage: 'https://garden365clinic.imweb.me/16', // 기존 아임웹 (이전 대상)
  },
  // 브랜드 (Q24~26)
  brand: {
    mood: ['깔끔하고 모던한', '전문적이고 신뢰감 있는'],
    color: 'green', // 스타벅스 그린
    hasLogo: true,
  },
  // 검색엔진 사이트 소유 확인 토큰 (각 콘솔 등록 후 발급값 입력)
  // 비워두면 해당 메타태그는 출력되지 않음 (배포 후 콘솔에서 발급받아 채우기)
  verification: {
    naver: 'fc7eabb5a9bad4e0aedae0186ab9ae79d4d9ddcc',   // 네이버 서치어드바이저 — <meta name="naver-site-verification">
    google: '',  // 구글 서치콘솔 (HTML 태그 방식) — <meta name="google-site-verification">
    bing: '',    // Bing 웹마스터 — <meta name="msvalidate.01">
  },
  // IndexNow 키 (빙·네이버 Yeti·Yandex 즉시 색인 프로토콜)
  // 키 파일은 /{key}.txt 로 자동 서빙됨. 콘텐츠 변경 시 검색엔진에 즉시 통보 가능.
  indexNowKey: '1c4b59fe96478ea33d1f1fad21b62151',
  // 네이버 서치어드바이저 HTML 파일 확인용 (메타태그와 병행 — 둘 중 하나로 확인됨)
  // /naver{code}.html 로 자동 서빙됨
  naverHtmlVerification: '3edbe6f4b1f365fba466f9ce627a4d41',
  // ── 로컬 비즈니스 / 구글 지도·로컬 검색용 추가 정보 (LocalBusiness 스키마) ──
  // 지도 링크: 네이버 플레이스(있으면 우선) → 구글 지도 좌표 fallback
  mapUrl: 'https://naver.me/5EQRj8w3',
  // 서비스 제공 지역 (지역 SEO 페이지와 연동되는 인근 행정구역)
  areaServed: ['오산시', '화성시', '평택시', '동탄'],
  // 결제 수단 / 통화
  paymentAccepted: ['현금', '카드', '계좌이체'],
  currenciesAccepted: 'KRW',
  // 신규 환자 진료 여부
  acceptingNewPatients: true,
  // 평점(aggregateRating): 의료광고법·구글 정책상 '검증 가능한 실제 리뷰'만 표기.
  // 실측 전까지는 null 유지 → 스키마에 출력되지 않음(허위표시 방지).
  // 예) { ratingValue: 4.9, reviewCount: 137, source: '네이버 플레이스' }
  rating: null as null | { ratingValue: number; reviewCount: number; source?: string },
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
