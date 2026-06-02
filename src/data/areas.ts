// ============================================================
// 지역 SEO 데이터 (Q6 주소 기반: 오산시 성호대로)
// 인근 유입 지역 × 핵심 진료 조합 페이지 생성
// 환자 유입: 오산 전역 + 동탄/평택/화성 + 오산 신도시 (Q33·Q34)
// ============================================================

export interface Area {
  slug: string
  name: string // 표기명
  full: string // 풀 주소 표기
  type: 'dong' | 'city' // 동 / 시
  // 한의원 기준 접근 안내
  access: string
}

export const AREAS: Area[] = [
  // 오산시 내 동
  { slug: 'osan-dong', name: '오산동', full: '오산시 오산동', type: 'dong', access: '한의원이 위치한 오산동, 도보 또는 가까운 거리에서 바로 내원하실 수 있습니다.' },
  { slug: 'daewon-dong', name: '대원동', full: '오산시 대원동', type: 'dong', access: '오산역 인근 대원동에서 도보 및 차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'jungang-dong', name: '중앙동', full: '오산시 중앙동', type: 'dong', access: '오산 중앙동에서 차량으로 가까운 거리에 위치합니다.' },
  { slug: 'sema-dong', name: '세마동', full: '오산시 세마동', type: 'dong', access: '세마동에서 차량으로 편리하게 내원하실 수 있습니다.' },
  { slug: 'choji', name: '초평동', full: '오산시 초평동', type: 'dong', access: '오산 초평동에서 차량으로 가까운 거리입니다.' },
  { slug: 'shinjang-dong', name: '신장동', full: '오산시 신장동', type: 'dong', access: '신장동에서 차량으로 편리하게 내원하실 수 있습니다.' },
  // 인근 시
  { slug: 'dongtan', name: '동탄', full: '화성시 동탄', type: 'city', access: '동탄에서 차량으로 내원하시는 환자분이 많습니다. 전용주차장을 이용하실 수 있습니다.' },
  { slug: 'pyeongtaek', name: '평택', full: '평택시', type: 'city', access: '평택에서 차량으로 내원하시기 편리하며, 전용주차장을 이용하실 수 있습니다.' },
  { slug: 'hwaseong', name: '화성', full: '화성시', type: 'city', access: '화성시에서 차량으로 내원하시는 분들을 위해 전용주차장을 운영합니다.' },
]

// 지역 페이지를 생성할 핵심 진료 (TOP3)
export const AREA_TREATMENTS = [
  { slug: 'diet', name: '다이어트', keyword: '한방 다이어트' },
  { slug: 'custom-herbal', name: '한약', keyword: '체질 한약' },
  { slug: 'car-accident', name: '교통사고', keyword: '교통사고 한방치료' },
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
  '평택시 송탄',
  '평택시 서정동',
  '수원시 권선구',
]
