// ============================================================
// 원장별 진료시간표 (원장 프로필 상단 · 명함 QR 연결용)
// 기본값: 심원석 대표원장 '홈페이지 수정 요청 사항' (2026-10-25) 원문.
// 관리자(/admin/schedules)에서 수정하면 D1 doctor_hours 가 우선하고, 임시 변동은 doctor_schedule_changes.
// DB 가 없거나 행이 없으면 아래 기본값으로 표시한다(공개 페이지가 비지 않도록).
// ============================================================

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type DayKey = (typeof DAY_KEYS)[number]
export const DAY_LABEL: Record<DayKey, string> = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' }
export const DAY_SCHEMA: Record<DayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export interface DayHours { start: string; end: string }
export type WeeklyHours = Partial<Record<DayKey, DayHours>>

export interface DoctorSchedule {
  slug: string
  weekly: WeeklyHours
  /** 원장별 상시 안내 문구(선택) */
  note: string
  updatedAt?: string
}

export interface ScheduleChange {
  id: number
  doctor_slug: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  kind: 'off' | 'change' | 'notice'
  start_time?: string | null
  end_time?: string | null
  message?: string | null
}

const h = (start: string, end: string): DayHours => ({ start, end })

export const DEFAULT_HOURS: Record<string, WeeklyHours> = {
  'shim-wonseok': { mon: h('08:30', '18:50'), wed: h('08:30', '17:30'), fri: h('08:30', '20:00'), sat: h('08:30', '15:00') },
  'kim-euna': { tue: h('08:30', '19:00'), thu: h('08:30', '17:30'), sat: h('08:30', '15:00') },
  'shim-wunam': { mon: h('11:00', '20:00'), wed: h('08:30', '20:00'), thu: h('14:00', '20:00'), fri: h('08:30', '20:00'), sun: h('08:30', '15:00') },
  'lee-yonguk': { mon: h('08:30', '17:30'), tue: h('08:30', '20:00'), wed: h('14:00', '20:00'), thu: h('08:30', '20:00'), sun: h('08:30', '15:00') },
  'kang-taewoo': { mon: h('08:30', '20:00'), wed: h('14:00', '20:00'), thu: h('08:30', '20:00'), fri: h('08:30', '17:30'), sun: h('08:30', '15:00') },
  'kim-cheonyong': { mon: h('14:00', '20:00'), tue: h('08:30', '20:00'), thu: h('08:30', '17:30'), fri: h('08:30', '20:00'), sat: h('08:30', '15:00') },
  'park-juhye': { mon: h('08:30', '20:00'), tue: h('14:00', '20:00'), wed: h('08:30', '20:00'), sat: h('08:30', '15:00'), sun: h('08:30', '15:00') },
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const isTime = (s: unknown): s is string => typeof s === 'string' && TIME_RE.test(s)
export const isDate = (s: unknown): s is string => typeof s === 'string' && DATE_RE.test(s)

/** 입력 JSON → 검증된 WeeklyHours (잘못된 값은 버림) */
export function sanitizeWeekly(input: any): WeeklyHours {
  const out: WeeklyHours = {}
  if (!input || typeof input !== 'object') return out
  for (const k of DAY_KEYS) {
    const v = input[k]
    if (v && isTime(v.start) && isTime(v.end) && v.start < v.end) out[k] = { start: v.start, end: v.end }
  }
  return out
}

/** KST 오늘 YYYY-MM-DD */
export function kstDate(d = new Date()): string {
  return new Date(d.getTime() + 9 * 3600000).toISOString().slice(0, 10)
}

/** 이번 주(KST, 월~일) 날짜 목록 */
export function kstWeekDates(d = new Date()): Record<DayKey, string> {
  const k = new Date(d.getTime() + 9 * 3600000)
  const dow = k.getUTCDay() // 0=일
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const out = {} as Record<DayKey, string>
  DAY_KEYS.forEach((key, i) => {
    const x = new Date(k.getTime() + (mondayOffset + i) * 86400000)
    out[key] = x.toISOString().slice(0, 10)
  })
  return out
}

/** D1 에서 원장별 시간표 + (오늘 이후) 임시 변동 로드. 실패/미적용 시 기본값. */
export async function loadSchedules(db: any, slugs: string[]): Promise<{ schedules: Record<string, DoctorSchedule>; changes: ScheduleChange[] }> {
  const schedules: Record<string, DoctorSchedule> = {}
  for (const s of slugs) schedules[s] = { slug: s, weekly: DEFAULT_HOURS[s] || {}, note: '' }
  let changes: ScheduleChange[] = []
  if (!db) return { schedules, changes }
  try {
    const today = kstDate()
    const ph = slugs.map(() => '?').join(',')
    const [hr, cr] = await Promise.all([
      db.prepare(`SELECT doctor_slug, hours_json, note, updated_at FROM doctor_hours WHERE doctor_slug IN (${ph})`).bind(...slugs).all(),
      db
        .prepare(
          `SELECT id, doctor_slug, start_date, end_date, kind, start_time, end_time, message FROM doctor_schedule_changes
           WHERE doctor_slug IN (${ph}) AND end_date >= ? ORDER BY start_date ASC, id ASC LIMIT 100`,
        )
        .bind(...slugs, today)
        .all(),
    ])
    for (const r of (hr.results || []) as any[]) {
      let weekly: WeeklyHours = {}
      try { weekly = sanitizeWeekly(JSON.parse(r.hours_json)) } catch { weekly = DEFAULT_HOURS[r.doctor_slug] || {} }
      schedules[r.doctor_slug] = { slug: r.doctor_slug, weekly, note: r.note || '', updatedAt: r.updated_at }
    }
    changes = ((cr.results || []) as any[]) as ScheduleChange[]
  } catch (e) {
    // 마이그레이션 전이거나 DB 오류 → 기본값 유지
    console.error('loadSchedules error', e)
  }
  return { schedules, changes }
}

/** 관리자용: 지난 변동 포함 전체 */
export async function loadAllChanges(db: any): Promise<ScheduleChange[]> {
  if (!db) return []
  try {
    const { results } = await db
      .prepare('SELECT id, doctor_slug, start_date, end_date, kind, start_time, end_time, message FROM doctor_schedule_changes ORDER BY start_date DESC, id DESC LIMIT 300')
      .all()
    return (results || []) as ScheduleChange[]
  } catch {
    return []
  }
}

export const CHANGE_KIND_LABEL: Record<string, string> = { off: '휴진', change: '시간 변경', notice: '안내' }

/** 'YYYY-MM-DD' → '10월 27일(월)' */
export function fmtDateKo(s: string): string {
  if (!isDate(s)) return s
  const d = new Date(s + 'T00:00:00Z')
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일(${wd})`
}
export function fmtRangeKo(a: string, b: string): string {
  return a === b ? fmtDateKo(a) : `${fmtDateKo(a)} ~ ${fmtDateKo(b)}`
}
