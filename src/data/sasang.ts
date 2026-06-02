// ============================================================
// 사상체질 TI 테스트 데이터 (Q41 필수 기능)
// 본인의 체질(사상체질)을 파악해 볼 수 있는 인터랙티브 진단
// ★ 의료광고법: "참고용 자가진단이며 정확한 체질 판별은 진료가 필요"라는 고지 필수
// ============================================================

export interface SasangQuestion {
  id: number
  question: string
  options: { text: string; type: SasangType }[]
}

export type SasangType = 'taeyang' | 'taeeum' | 'soyang' | 'soeum'

export interface SasangResult {
  type: SasangType
  name: string
  nameHanja: string
  emoji: string
  summary: string
  traits: string[]
  bodyTraits: string[]
  careAdvice: string[]
  recommend: string // 추천 진료/관리 (인링크)
}

export const SASANG_QUESTIONS: SasangQuestion[] = [
  {
    id: 1,
    question: '평소 체격과 인상은 어떤 편인가요?',
    options: [
      { text: '상체가 발달하고 목덜미가 굵은 편', type: 'taeyang' },
      { text: '골격이 크고 살집이 있는 편', type: 'taeeum' },
      { text: '가슴이 발달하고 하체가 가벼운 편', type: 'soyang' },
      { text: '전체적으로 갸름하고 마른 편', type: 'soeum' },
    ],
  },
  {
    id: 2,
    question: '소화와 식사는 어떤 편인가요?',
    options: [
      { text: '소화는 무난하나 신경 쓰면 잘 체함', type: 'taeyang' },
      { text: '잘 먹고 소화도 잘되는 편', type: 'taeeum' },
      { text: '먹는 속도가 빠르고 급하게 먹는 편', type: 'soyang' },
      { text: '소화력이 약하고 차가운 음식에 탈 남', type: 'soeum' },
    ],
  },
  {
    id: 3,
    question: '땀은 어떻게 나는 편인가요?',
    options: [
      { text: '땀이 잘 나지 않는 편', type: 'taeyang' },
      { text: '땀이 많고 땀을 흘리면 개운함', type: 'taeeum' },
      { text: '활동하면 땀이 잘 나는 편', type: 'soyang' },
      { text: '땀이 적고 땀나면 기운이 빠짐', type: 'soeum' },
    ],
  },
  {
    id: 4,
    question: '평소 성격은 어떤 편인가요?',
    options: [
      { text: '추진력이 강하고 거침없는 편', type: 'taeyang' },
      { text: '느긋하고 묵직하며 끈기 있는 편', type: 'taeeum' },
      { text: '활발하고 솔직하며 급한 편', type: 'soyang' },
      { text: '꼼꼼하고 신중하며 내성적인 편', type: 'soeum' },
    ],
  },
  {
    id: 5,
    question: '추위와 더위 중 어느 쪽이 더 힘든가요?',
    options: [
      { text: '특별히 어느 쪽도 크게 타지 않음', type: 'taeyang' },
      { text: '더위를 많이 타는 편', type: 'taeeum' },
      { text: '더위를 타고 시원한 것을 좋아함', type: 'soyang' },
      { text: '추위를 많이 타고 따뜻한 것을 좋아함', type: 'soeum' },
    ],
  },
  {
    id: 6,
    question: '소변·대변은 어떤 편인가요?',
    options: [
      { text: '대체로 무난한 편', type: 'taeyang' },
      { text: '변이 굵고 시원하게 보는 편', type: 'taeeum' },
      { text: '소변이 잦고 변비 경향이 있음', type: 'soyang' },
      { text: '설사가 잦거나 변이 무른 편', type: 'soeum' },
    ],
  },
  {
    id: 7,
    question: '잠은 어떻게 자는 편인가요?',
    options: [
      { text: '잠이 적어도 크게 지장 없음', type: 'taeyang' },
      { text: '깊고 오래 자는 편', type: 'taeeum' },
      { text: '잠이 얕고 자주 깨는 편', type: 'soyang' },
      { text: '신경 쓰면 잠들기 어려운 편', type: 'soeum' },
    ],
  },
  {
    id: 8,
    question: '물은 어떻게 마시나요?',
    options: [
      { text: '물을 많이 찾지 않는 편', type: 'taeyang' },
      { text: '물을 자주, 많이 마시는 편', type: 'taeeum' },
      { text: '찬물을 즐겨 마시는 편', type: 'soyang' },
      { text: '따뜻한 물을 조금씩 마시는 편', type: 'soeum' },
    ],
  },
]

export const SASANG_RESULTS: Record<SasangType, SasangResult> = {
  taeyang: {
    type: 'taeyang',
    name: '태양인',
    nameHanja: '太陽人',
    emoji: '☀️',
    summary: '추진력과 결단력이 강한 체질로, 폐 기능이 발달하고 간 기능이 상대적으로 약한 경향이 있습니다.',
    traits: ['추진력이 강하고 거침없음', '창의적이고 결단력이 있음', '비교적 드문 체질'],
    bodyTraits: ['상체와 목덜미가 발달한 편', '땀이 적은 편', '하체가 상대적으로 약한 경향'],
    careAdvice: [
      '담백하고 서늘한 성질의 음식이 잘 맞는 편',
      '과도한 분노와 긴장을 다스리는 것이 중요',
      '하체 근력을 기르는 운동이 도움이 될 수 있음',
    ],
    recommend: 'custom-herbal',
  },
  taeeum: {
    type: 'taeeum',
    name: '태음인',
    nameHanja: '太陰人',
    emoji: '🌳',
    summary: '끈기와 포용력이 있는 체질로, 간 기능이 발달하고 폐 기능이 상대적으로 약한 경향이 있습니다. 살이 잘 찌는 경향이 있어 체중 관리에 관심이 많습니다.',
    traits: ['느긋하고 끈기 있음', '포용력이 크고 묵직함', '가장 흔한 체질 중 하나'],
    bodyTraits: ['골격이 크고 살집이 있는 편', '땀이 많은 편', '더위를 타는 경향'],
    careAdvice: [
      '규칙적인 운동과 식사량 관리가 특히 중요',
      '순환을 돕는 활동이 도움이 될 수 있음',
      '체중·대사 관리에 한방 다이어트가 도움이 될 수 있음',
    ],
    recommend: 'diet',
  },
  soyang: {
    type: 'soyang',
    name: '소양인',
    nameHanja: '少陽人',
    emoji: '🔥',
    summary: '활발하고 솔직한 체질로, 비위 기능이 발달하고 신장 기능이 상대적으로 약한 경향이 있습니다. 열이 위로 잘 오르는 경향이 있습니다.',
    traits: ['활발하고 솔직함', '판단이 빠르고 적극적', '급한 면이 있음'],
    bodyTraits: ['가슴이 발달하고 하체가 가벼운 편', '더위를 타는 편', '소변이 잦은 경향'],
    careAdvice: [
      '서늘하고 시원한 성질의 음식이 잘 맞는 편',
      '열을 식히고 마음을 안정시키는 관리가 중요',
      '소화기·수면 관리에 한약이 도움이 될 수 있음',
    ],
    recommend: 'custom-herbal',
  },
  soeum: {
    type: 'soeum',
    name: '소음인',
    nameHanja: '少陰人',
    emoji: '🌙',
    summary: '꼼꼼하고 신중한 체질로, 신장 기능이 발달하고 비위 기능이 상대적으로 약한 경향이 있습니다. 소화력이 약하고 몸이 찬 경향이 있습니다.',
    traits: ['꼼꼼하고 신중함', '내성적이고 섬세함', '계획적임'],
    bodyTraits: ['전체적으로 갸름하고 마른 편', '추위를 타는 편', '소화력이 약한 경향'],
    careAdvice: [
      '따뜻한 성질의 음식과 따뜻한 물이 잘 맞는 편',
      '소화기를 따뜻하게 보하는 관리가 중요',
      '소화기·체력 보강에 체질 한약이 도움이 될 수 있음',
    ],
    recommend: 'custom-herbal',
  },
}

export const SASANG_DISCLAIMER =
  '본 테스트는 사상체질에 대한 이해를 돕기 위한 참고용 자가진단이며, 의학적 진단이 아닙니다. 정확한 체질 판별과 그에 맞는 처방은 한의사의 진료를 통해 이루어집니다.'
