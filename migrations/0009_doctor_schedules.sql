-- 원장별 진료시간표 + 임시 변동 (2026-10-26, 원장 프로필 상단 시간표 · 명함 QR)
-- doctor_hours: 원장별 기본 주간 시간표(JSON: {"mon":{"start":"08:30","end":"18:50"},...}) + 상시 안내 문구
-- 행이 없으면 코드 기본값(src/data/schedules.ts DEFAULT_HOURS) 사용
CREATE TABLE IF NOT EXISTS doctor_hours (
  doctor_slug TEXT PRIMARY KEY,
  hours_json  TEXT NOT NULL,
  note        TEXT,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- doctor_schedule_changes: 임시 변동(휴진·시간 변경·안내) — 기간(start_date~end_date, KST 날짜)
-- end_date 가 지나면 공개 페이지에서 자동으로 사라짐
CREATE TABLE IF NOT EXISTS doctor_schedule_changes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_slug TEXT NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'off',
  start_time  TEXT,
  end_time    TEXT,
  message     TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dsc_doctor_end ON doctor_schedule_changes (doctor_slug, end_date);
