// ============================================================
// 홈 히어로 팝업 — 관리자 공지에서 "메인 화면에 팝업으로 띄우기" 켠 공지
// 활성 조건: show_popup=1 AND (popup_until 비어있음 OR popup_until >= 오늘(KST))
// 여러 개면 대표(고정) 공지 우선 → 최신순으로 최대 POPUP_MAX(5)개 동시 노출.
//  - PC(≥768px): 한 장의 어두운 배경 위에 카드들을 나란히(줄바꿈 허용)
//  - 모바일(≤767px): 우상단 "병원 소식 N" 칩 → 탭하면 한 장씩 넘겨보기
// 렌더링은 src/pages/home.tsx, 스타일은 public/static/style.css(.hero-popup*)
// ============================================================

export const POPUP_MAX = 5

export const POPUP_HINT = `팝업은 최대 ${POPUP_MAX}개까지 동시에 표시됩니다 (PC는 나란히, 모바일은 넘겨보기)`

// 홈과 관리자가 같은 순서를 쓰도록 정렬 기준을 한 곳에 둔다
export const POPUP_ORDER_SQL = 'is_pinned DESC, created_at DESC, id DESC'

// 한국 시간 기준 오늘 (YYYY-MM-DD)
export function kstToday(): string {
  return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
}

// 팝업이 오늘 활성인지 (관리자 목록 판정용 — SQL 조건과 동일)
export function isPopupLive(n: { show_popup?: any; popup_until?: string | null }, today = kstToday()): boolean {
  if (!n || !Number(n.show_popup)) return false
  const until = (n.popup_until || '').trim()
  return !until || until >= today
}

// 활성 팝업 최대 5건 (DB 없거나 오류면 빈 배열)
export async function fetchActivePopups(db: D1Database | undefined): Promise<any[]> {
  if (!db) return []
  try {
    const { results } = await db.prepare(
      `SELECT id, title, body, image, link_url, category FROM notices
       WHERE show_popup = 1 AND (popup_until IS NULL OR popup_until = '' OR popup_until >= ?)
       ORDER BY ${POPUP_ORDER_SQL} LIMIT ${POPUP_MAX}`
    ).bind(kstToday()).all()
    return (results || []) as any[]
  } catch {
    return []
  }
}

// 관리자 대시보드용: 활성 팝업 전체(제목) — 5개 초과 여부 확인
export async function fetchLivePopupTitles(db: D1Database | undefined): Promise<string[]> {
  if (!db) return []
  try {
    const { results } = await db.prepare(
      `SELECT title FROM notices
       WHERE show_popup = 1 AND (popup_until IS NULL OR popup_until = '' OR popup_until >= ?)
       ORDER BY ${POPUP_ORDER_SQL}`
    ).bind(kstToday()).all()
    return ((results || []) as any[]).map((r) => String(r.title || ''))
  } catch {
    return []
  }
}
