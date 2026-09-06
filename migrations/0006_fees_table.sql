-- ==========================================================================
-- 비급여 진료비(수가) 테이블 — 스키마 + 인덱스
-- 시드 데이터는 0007로 분리 (D1이 동일 트랜잭션에서 새 컬럼을 인식하지 못하는 이슈 우회)
-- 기존 하드코딩 데이터(src/data/pricing.ts) 구조를 그대로 담는다.
--   category(=분류 제목) / category_icon(=아이콘) / group_note(=분류 설명)
--   name(=항목명) / price(=금액 표기) / note(=비고)
--   is_published(=공개/비공개) / sort_group·sort_order(=정렬)
-- ==========================================================================

CREATE TABLE IF NOT EXISTS fees (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category        TEXT    NOT NULL,
  category_icon   TEXT    NOT NULL DEFAULT 'fa-circle-dot',
  group_note      TEXT,
  name            TEXT    NOT NULL,
  price           TEXT    NOT NULL,
  note            TEXT,
  is_highlight    INTEGER NOT NULL DEFAULT 0,
  is_published    INTEGER NOT NULL DEFAULT 1,
  sort_group      INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fees_group_order ON fees(sort_group, sort_order);
CREATE INDEX IF NOT EXISTS idx_fees_published   ON fees(is_published);
