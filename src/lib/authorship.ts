// ============================================================
// 칼럼 작성 주체 판별 (2026-10-08, 사용자 승인)
// 원장을 저자/감수자로 표시하는 건 원장이 쓰거나 검토했다는 근거가 있을 때만.
// - 대행사 시드 칼럼 6편: seed.sql(a688817·c51cc72) 3편 + seed_columns2.sql(c51cc72 '칼럼 3편') 3편
//   → D1 columns id 1 diet-no-starving · 2 car-accident-pain-reason · 3 herbal-timing ·
//     4 shoulder-pain-occupation · 5 internal-specialist-difference · 6 constitution-body-manual
//   (2026-06-14 08:48 일괄 INSERT, author 는 시드 값 → 원장 작성·검토 근거 없음)
//   → 작성·발행 = 병원(ORG_ID), reviewedBy·lastReviewed 없음, 화면엔 일반 정보 안내 문구.
// - 그 밖의 글(id 7~)은 병원이 관리자 에디터에서 작성 원장을 직접 골라 올린 글 → 기존 표시 유지.
// 상세·목록·RSS·llms 모두 이 함수만 사용한다.
// ============================================================
export const AGENCY_SEED_COLUMN_IDS = new Set([1, 2, 3, 4, 5, 6])
export const CLINIC_GENERAL_INFO_NOTE = '일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다.'
export function isClinicPublishedColumn(col: { id?: number | string | null }): boolean {
  return AGENCY_SEED_COLUMN_IDS.has(Number(col.id))
}
