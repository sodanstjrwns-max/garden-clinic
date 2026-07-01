// ============================================================
// 의료진 데이터 (신청서 + 2차 답변서 Q1·약력 전문)
// ★ 사실관계(학력/경력/면허/자격) 절대 창작 금지 — 원장 제공 원문만 사용
// 주력 진료(specialty)는 2차 답변서 Q1의 원장별 주력 분야 원문 기준
// ============================================================

export interface Doctor {
  slug: string
  name: string
  title: string
  isCeo: boolean
  specialty: string
  // 인링크: 주력 진료 slug
  treatments: string[]
  intro: string
  // 한 줄 진료 다짐 (원장 제공 원문)
  motto?: string
  education: string[]
  career: string[]
  // 자격·학회 (전문의/수료/회원 포함)
  memberships: string[]
  // 논문 (제1저자) — 대표원장
  papers?: string[]
  // 참여 연구 — 대표원장
  research?: string[]
  // 사진 (R2 업로드 전 placeholder)
  photo?: string
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'shim-wonseok',
    name: '심원석',
    title: '대표원장',
    isCeo: true,
    specialty: '한방내과 전문의 · 체질개선 · 허약질환 · 뇌신경계(안면마비·중풍·파킨슨)',
    treatments: ['custom-herbal', 'internal', 'rehab-neuro', 'diet'],
    intro:
      '오산에서도 서울보다 더 질 높은 의료 서비스를 제공하고 싶다는 마음으로 정원한의원을 열었습니다. 수련 과정에서 한의학과 양의학을 함께 쓰며 각 의학의 장단점을 곁에서 지켜봤습니다. 그래서 지금 어떤 치료를 받고 계시고, 어떤 부분이 좋아질 수 있으며 어디에 한계가 있는지를 환자분께 분명하게 설명드릴 수 있습니다. 복용 중인 양약을 함께 확인해 기존 치료와 충돌 없이, 안전하게 한약 치료를 받으실 수 있도록 돕는 것이 한방내과 전문의로서 제 역할이라 생각합니다.',
    motto: '불안·불편·불신을 줄여, 치료에 집중할 수 있는 진료를 하겠습니다.',
    education: [
      '동의대학교 대학원 임상한의학과 석사',
      '대구한의대학교 한의학과 졸업',
    ],
    career: [
      '現 정원한의원 대표원장 (2020.12 ~)',
      '前 동의대학교 부속 한방병원 전문수련의',
      '前 경기도립노인전문 용인병원 한의과장',
      '前 경기도 안성시 보건소 공중보건의',
      '前 경기도 공중보건의협의회 한의과 대표',
      '대한한의사협회 소속 네이버 지식iN 상담한의사 (한방내과)',
    ],
    memberships: [
      '한방내과 전문의',
      '대한한방내과학회 평생회원',
      '척추신경추나의학회 정회원',
      '면역약침의학회 정회원',
    ],
    papers: [
      'Inhibition of migration and invasion of human bladder cancer 5637 cells by Hwangheuk-san (2016, J. Int. Korean Med.) — 제1저자',
      'A Case Study of Poisoning Symptoms Caused by Misusing Xanthii Fructus, Treated with Korean Medicine (2015, J. Int. Korean Med.) — 제1저자',
    ],
    research: [
      '데이터 기반 침구치료 안정성 확립 연구 (참여연구)',
      '한약 안정성에 대한 전향적 임상 연구 (참여연구)',
    ],
    photo: '/static/doctors/shim-wonseok.webp',
  },
  {
    slug: 'kim-euna',
    name: '김은아',
    title: '원장',
    isCeo: false,
    specialty: '한방 다이어트 · 한방 소아과',
    treatments: ['diet', 'pediatrics'],
    intro:
      '내가 받고 싶은 치료를 기준으로 진료합니다. 한방 비만 진료와 소아 진료를 주로 보며, 다이어트 관련 콘텐츠를 유튜브 채널로도 전해 왔습니다.',
    motto: '내가 받고 싶은 치료를 하겠습니다.',
    education: ['대구한의대학교 한의학과 졸업'],
    career: [
      "MBN '건강한의사' 방송 출연",
      "유튜브 '다이어트멘토 김은아' 운영",
    ],
    memberships: [
      '한방소아과 정회원',
      '한방비만학회 준회원',
      '한방 소아과 전문가과정 수료',
      '대한융합한의학회 정회원',
    ],
    photo: '/static/doctors/kim-euna.webp',
  },
  {
    slug: 'shim-wunam',
    name: '심우남',
    title: '원장',
    isCeo: false,
    specialty: '갱년기 · 한방 다이어트 · 한방 피부과 · 비염 · 협착증',
    treatments: ['menopause', 'diet', 'dermatology', 'ent', 'pain'],
    intro:
      '갱년기와 다이어트, 피부·비염처럼 몸 안의 균형이 흔들려 생기는 불편을 주로 봅니다. 보건지소 한의과장으로 지역 주민을 진료해 온 경험을 바탕으로, 한 분 한 분 끝까지 함께하는 진료를 지향합니다.',
    motto: '한결같이 따듯한 마음으로 끝까지 함께 하겠습니다.',
    education: ['원광대학교 한의학과 졸업'],
    career: [
      '前 서산시 운산보건지소 한의과장',
      '前 서산시 해미보건지소 한의과장',
    ],
    memberships: [
      '대한한의사협회 정회원',
      '한방비만학회 준회원',
    ],
    photo: '/static/doctors/lee-yonguk.webp',
  },
  {
    slug: 'lee-yonguk',
    name: '이용욱',
    title: '원장',
    isCeo: false,
    specialty: '남성질환(성기능·전립선) · 통증(오십견·말초신경병증) · 자율신경 부조화(불면·홧병·우울감·소화불량)',
    treatments: ['mens-clinic', 'pain', 'neuropsychiatry', 'digestive'],
    intro:
      '남성질환과 통증, 그리고 검사에는 잘 잡히지 않는 자율신경 부조화 — 불면, 홧병, 우울감, 소화불량 — 를 주로 봅니다. 근골격계 초음파 자격(RMSK)을 바탕으로 통증의 원인을 구조적으로 확인하며 진료합니다.',
    motto: '공감과 소통으로 마음 따듯한 진료를 하겠습니다.',
    education: ['동신대학교 한의학과 졸업'],
    career: [
      '前 보령시 성주보건지소 한의과장',
      '前 보령시 미산보건지소 한의과장',
    ],
    memberships: [
      '미국 근골격계 초음파 자격증 (RMSK)',
      '대한한의사협회 정회원',
      '척추신경추나학회 정회원',
      '대한약침학회 정회원',
      '대한침도의학회 전 부위 강의 수료',
    ],
    photo: '/static/doctors/shim-wunam.webp',
  },
  {
    slug: 'kang-taewoo',
    name: '강태우',
    title: '원장',
    isCeo: false,
    specialty: '교통사고 후유증 · 추나/교정치료(거북목·골반·협착·디스크)',
    treatments: ['car-accident', 'pain'],
    intro:
      '교통사고 후유증과 추나·교정 치료를 주로 봅니다. 사고로 생긴 통증만 보지 않고, 원래의 척추 정렬과 자세 습관까지 함께 살펴 회복을 돕습니다.',
    motto: '환자분의 이야기를 귀 기울여 듣고, 편안하고 따듯하게 다가가겠습니다.',
    education: ['대전대학교 한의학과 졸업'],
    career: ['前 군산시 보건소 공중보건의'],
    memberships: [
      '미국 근골격계 초음파 자격증 (RMSK)',
      '척추신경추나학회 정회원',
      '대한스포츠한의학회 회원',
      '대한한의사협회 정회원',
    ],
    photo: '/static/doctors/kang-taewoo.webp',
  },
  {
    slug: 'kim-cheonyong',
    name: '김천용',
    title: '원장',
    isCeo: false,
    specialty: '교통사고 후유증 · 추나/교정치료(거북목·골반·협착·디스크)',
    treatments: ['car-accident', 'pain'],
    intro:
      '교통사고 후유증과 추나·교정 치료를 주로 봅니다. 노인요양병원과 보건지소에서 다양한 연령대의 근골격계 환자를 진료해 온 경험으로, 세심하게 통증의 원인을 찾습니다.',
    motto: '언제나 진심을 다해, 보다 세심하게 진료하겠습니다.',
    education: ['동신대학교 한의학과 졸업'],
    career: [
      '前 장수군 번암면보건지소 한의과장',
      '前 부안군노인요양병원 한의과장',
      '前 전라북도 공중보건한의사 대표',
    ],
    memberships: [
      '미국 근골격계 초음파 자격증 (RMSK)',
      '척추신경추나의학회 정회원',
      '대한침도의학회 정회원',
      '한방비만학회 준회원',
    ],
    photo: '/static/doctors/kim-cheonyong.webp',
  },
  {
    slug: 'park-juhye',
    name: '박주혜',
    title: '원장',
    isCeo: false,
    specialty: '교통사고 후유증 · 한방 부인과(생리통·생리불순)',
    treatments: ['car-accident', 'gynecology'],
    intro:
      '교통사고 후유증과 한방 부인과 진료를 주로 봅니다. 중국·홍콩에서의 임상과정과 경희대 생리학교실 연구 경험을 바탕으로, 여성의 몸 주기에서 오는 불편을 꼼꼼히 살핍니다.',
    motto: '더 건강해지시도록 성심을 다해 진료하겠습니다.',
    education: [
      '경희대학교 한의학과 졸업',
      '중국 Tongde Hospital 임상과정 수료',
      '홍콩 Baptist University 임상과정 수료',
    ],
    career: ['경희대학교 생리학교실 연구보조'],
    memberships: [
      '대한침도의학회 수료',
      '미용의료 안전성 교육 수료',
    ],
    photo: '/static/doctors/park-juhye.webp',
  },
  {
    slug: 'jeon-woojin',
    name: '전우진',
    title: '원장',
    isCeo: false,
    specialty: '통증 · 추나/교정치료 · 한방 다이어트',
    treatments: ['pain', 'diet'],
    intro:
      '통증·추나 교정과 한방 다이어트 진료를 봅니다. 근골격계 초음파 자격(RMSK)과 비만치료 전문가과정을 바탕으로, 신뢰할 수 있는 진료를 약속드립니다.',
    motto: '신뢰와 믿음을 드릴 수 있는 진료를 하겠습니다.',
    education: ['상지대학교 한의학과 졸업'],
    career: ['前 곡성군 죽곡보건지소 한의과장'],
    memberships: [
      '미국 근골격계 초음파 자격증 (RMSK)',
      '대한한의사협회 정회원',
      '척추신경추나학회 정회원',
      '한방 비만치료전문가 과정 수료',
    ],
    photo: '/static/doctors/jeon-woojin.webp',
  },
]

export function getDoctor(slug: string): Doctor | undefined {
  return DOCTORS.find((d) => d.slug === slug)
}
