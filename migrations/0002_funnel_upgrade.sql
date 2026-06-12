-- 퍼널 슈퍼 업그레이드: 리드 / 퍼널 이벤트 / 리콜

-- 체질 테스트 리드 (④ 결심 직전 리드 포착)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  sasang_type TEXT,          -- taeyang | taeeum | soyang | soeum
  interest TEXT,             -- 관심 진료 slug
  message TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  status TEXT DEFAULT 'new', -- new | contacted | converted | closed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 퍼널 이벤트 추적 (전환율 측정)
CREATE TABLE IF NOT EXISTS funnel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,       -- page_view | ti_start | ti_complete | ti_lead | resv_start | resv_step | resv_submit | share_click | review_click | cta_call
  path TEXT,
  session_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  meta TEXT,                 -- JSON 추가정보 (체질 타입, 진료 등)
  is_bot INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_funnel_event ON funnel_events(event, created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_session ON funnel_events(session_id);

-- 리콜(재내원) 관리 (⑧ 재방문)
CREATE TABLE IF NOT EXISTS recalls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  treatment TEXT,
  last_visit TEXT,           -- YYYY-MM-DD
  due_date TEXT,             -- 다음 내원 추천일 YYYY-MM-DD
  note TEXT,
  status TEXT DEFAULT 'pending', -- pending | notified | booked | done
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recalls_due ON recalls(due_date, status);

-- 예약 테이블 확장: 유입경로 + 후기 요청
ALTER TABLE reservations ADD COLUMN utm_source TEXT;
ALTER TABLE reservations ADD COLUMN utm_medium TEXT;
ALTER TABLE reservations ADD COLUMN utm_campaign TEXT;
ALTER TABLE reservations ADD COLUMN referrer TEXT;
ALTER TABLE reservations ADD COLUMN review_requested INTEGER DEFAULT 0;
