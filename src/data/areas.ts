// ============================================================
// 지역 SEO 데이터 (주소 기반: 오산시 성호대로)
// 인근 유입 지역 × 핵심 진료 조합 페이지 생성
// 환자 유입: 오산 전역 + 동탄/평택/화성/수원 + 인근 신도시
// 각 지역에 거리/소요시간/랜드마크를 명시해 로컬 SEO·AEO 강화
// ============================================================

export interface Area {
  slug: string
  name: string // 표기명
  full: string // 풀 주소 표기
  type: 'dong' | 'city' // 동 / 시
  access: string // 한의원 기준 접근 안내
  distance?: string // 한의원까지 대략 거리
  driveTime?: string // 차량 소요시간(대략)
  landmarks?: string[] // 지역 내 주요 랜드마크(검색 키워드)
}

export const AREAS: Area[] = [
  // ── 오산시 내 행정동 ──
  { slug: 'osan-dong', name: '오산동', full: '오산시 오산동', type: 'dong', distance: '약 1km 이내', driveTime: '차량 3~5분', landmarks: ['오산역', '오산오색시장'], access: '한의원이 위치한 오산동은 도보 또는 가까운 거리에서 바로 내원하실 수 있습니다.' },
  { slug: 'daewon-dong', name: '대원동', full: '오산시 대원동', type: 'dong', distance: '약 1~2km', driveTime: '차량 5분', landmarks: ['오산역', '대원동 행정복지센터'], access: '오산역 인근 대원동에서 도보 및 차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'jungang-dong', name: '중앙동', full: '오산시 중앙동', type: 'dong', distance: '약 2km', driveTime: '차량 5~7분', landmarks: ['오산시청', '중앙동 행정복지센터'], access: '오산시청이 있는 중앙동에서 차량으로 가까운 거리에 위치합니다.' },
  { slug: 'sema-dong', name: '세마동', full: '오산시 세마동', type: 'dong', distance: '약 3~4km', driveTime: '차량 8~10분', landmarks: ['세마역', '독산성'], access: '세마역·독산성 인근 세마동에서 차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'choji', name: '초평동', full: '오산시 초평동', type: 'dong', distance: '약 3km', driveTime: '차량 7~9분', landmarks: ['오산대역', '운암택지지구'], access: '오산대역·운암지구가 있는 초평동에서 차량으로 가까운 거리입니다.' },
  { slug: 'shinjang-dong', name: '신장동', full: '오산시 신장동', type: 'dong', distance: '약 4km', driveTime: '차량 10분', landmarks: ['수청동', '오산세교신도시'], access: '오산세교신도시가 포함된 신장동에서 차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'namchon-dong', name: '남촌동', full: '오산시 남촌동', type: 'dong', distance: '약 2~3km', driveTime: '차량 6~8분', landmarks: ['오산종합운동장', '남촌동 행정복지센터'], access: '오산종합운동장 인근 남촌동에서 차량으로 편리하게 내원하실 수 있습니다.' },
  // ── 인근 시·신도시 ──
  { slug: 'dongtan', name: '동탄', full: '화성시 동탄', type: 'city', distance: '약 8~12km', driveTime: '차량 15~20분', landmarks: ['동탄신도시', '동탄역', '동탄호수공원'], access: '동탄신도시에서 차량으로 내원하시는 환자분이 많습니다. 전용주차장을 이용하실 수 있습니다.' },
  { slug: 'pyeongtaek', name: '평택', full: '평택시', type: 'city', distance: '약 10~15km', driveTime: '차량 20분 내외', landmarks: ['평택역', '송탄', '서정동'], access: '평택·송탄에서 차량으로 내원하시기 편리하며, 전용주차장을 이용하실 수 있습니다.' },
  { slug: 'hwaseong', name: '화성', full: '화성시', type: 'city', distance: '약 7~13km', driveTime: '차량 15~20분', landmarks: ['병점', '봉담', '향남'], access: '화성시(병점·봉담 등)에서 차량으로 내원하시는 분들을 위해 전용주차장을 운영합니다.' },
  { slug: 'byeongjeom', name: '병점', full: '화성시 병점', type: 'city', distance: '약 6~8km', driveTime: '차량 12~15분', landmarks: ['병점역', '효행공원'], access: '병점역 인근에서 1호선·차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'suwon', name: '수원', full: '수원시', type: 'city', distance: '약 12~18km', driveTime: '차량 20~30분', landmarks: ['수원역', '권선구', '망포'], access: '수원(권선구·망포 등)에서 차량으로 내원하시는 환자분을 위해 전용주차장을 운영합니다.' },
]

// 지역 페이지를 생성할 핵심 진료
export const AREA_TREATMENTS = [
  { slug: 'diet', name: '다이어트', keyword: '한방 다이어트', intent: '체중 관리를 위한 한방 다이어트' },
  { slug: 'custom-herbal', name: '한약', keyword: '체질 한약', intent: '체질과 증상에 맞춘 맞춤 한약' },
  { slug: 'car-accident', name: '교통사고', keyword: '교통사고 한방치료', intent: '교통사고 후유증 한방 치료(자동차보험 적용)' },
]

export function getArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug)
}

// 주소 자동완성용 (비포애프터 지역 카테고리)
export const ADDRESS_SUGGESTIONS = [
  '오산시 오산동',
  '오산시 대원동',
  '오산시 중앙동',
  '오산시 세마동',
  '오산시 초평동',
  '오산시 신장동',
  '오산시 남촌동',
  '오산시 청학동',
  '오산시 양산동',
  '오산시 부산동',
  '화성시 동탄',
  '화성시 병점',
  '화성시 봉담',
  '평택시 송탄',
  '평택시 서정동',
  '수원시 권선구',
  '수원시 망포동',
]
