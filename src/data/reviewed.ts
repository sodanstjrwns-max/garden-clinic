// ============================================================
// 진료 페이지 최종 검토일 (MedicalWebPage.lastReviewed + 화면 감수 줄)
// 값 = 해당 진료 본문(src/data/treatments.ts 항목)·진료 FAQ(src/data/faq.ts 카테고리)를
//      실제로 마지막으로 수정한 커밋 날짜 (git log -L 기준, 2026-09-29 산출).
// ※ new Date() 로 오늘 날짜를 채우지 않는다. 본문을 고치면 이 값도 같이 갱신할 것.
// ============================================================
export const TX_LAST_REVIEWED: Record<string, string> = {
  diet: '2026-08-15',
  'custom-herbal': '2026-06-12',
  'car-accident': '2026-06-12',
  pain: '2026-08-15',
  internal: '2026-06-16',
  digestive: '2026-06-16',
  menopause: '2026-06-16',
  gynecology: '2026-06-22',
  pediatrics: '2026-06-16',
  dermatology: '2026-06-16',
  ent: '2026-06-16',
  neuropsychiatry: '2026-06-16',
  'rehab-neuro': '2026-06-16',
  'mens-clinic': '2026-06-16',
}
// 목록에 없는 진료(신규 추가)는 날짜를 비워 두고 감수자만 표시한다 — 추가 시 여기에 날짜를 넣을 것.
