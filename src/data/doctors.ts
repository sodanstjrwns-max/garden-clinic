// ============================================================
// 의료진 데이터 (Q17·Q18)
// ★ 사실관계(학력/경력/면허) 절대 창작 금지 — 신청서 원문만 사용
// 대표원장 외 추가 의료진은 신청서에 인원수(8명)만 있고 프로필 미제공
// → 개별 프로필 창작 금지. "진료 의료진" 안내로만 처리.
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
  education: string[]
  career: string[]
  memberships: string[]
  // 사진 (R2 업로드 전 placeholder)
  photo?: string
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'shim-wonseok',
    name: '심원석',
    title: '대표원장',
    isCeo: true,
    specialty: '한방내과 / 체질 맞춤 한약 · 비만 · 교통사고 후유증',
    treatments: ['custom-herbal', 'diet', 'car-accident', 'internal', 'pain'],
    intro:
      '오산에서도 서울보다 더 질 높은 의료 서비스를 제공하고 싶다는 마음으로 정원한의원을 열었습니다. 환자분의 치료뿐 아니라 평소 생활 습관과 직업, 진료에서 무엇을 불편해하시는지까지 살피는 것이 결국 더 나은 치료로 이어진다고 믿습니다. 재진 환자에게는 오늘 예상되는 치료와 순서를, 초진 환자에게는 앞으로의 진료 과정을 미리 안내해, 이해하고 동의한 치료를 함께 만들어 갑니다.',
    education: [
      '동의대학교 대학원 한의학과 석사',
      '대구한의대학교 한의학과 학사',
    ],
    career: [
      '現 정원한의원 대표원장 (2020.12 ~)',
      '前 경기도립노인전문 용인병원 한의과장',
      '前 네이버 지식iN 의료상담 한의사',
    ],
    memberships: [
      '면역약침의학회 정회원',
      '척추신경추나의학회 정회원',
      '대한한방내과학회 평생회원',
    ],
  },
]

export function getDoctor(slug: string): Doctor | undefined {
  return DOCTORS.find((d) => d.slug === slug)
}
