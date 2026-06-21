-- ============================================================
-- 관리자 슈퍼 업그레이드
--  · notices: 히어로 팝업 토글 + 만료일 + 링크 + 부가 필드
--  · columns: 슈퍼 SEO 필드 (OG 이미지, 키워드, 읽기시간, 발행상태)
-- D1/SQLite: ADD COLUMN만 사용 (기존 데이터 보존)
-- ============================================================

-- ── 공지: 히어로 팝업 기능 ──
ALTER TABLE notices ADD COLUMN show_popup INTEGER DEFAULT 0;       -- 1이면 메인 히어로에 팝업
ALTER TABLE notices ADD COLUMN popup_until TEXT;                   -- 팝업 만료일 (YYYY-MM-DD). 비우면 무기한
ALTER TABLE notices ADD COLUMN link_url TEXT;                      -- 팝업 '자세히 보기' 커스텀 링크 (비우면 공지 상세)
ALTER TABLE notices ADD COLUMN category TEXT DEFAULT 'notice';     -- notice | event | holiday (휴진)
ALTER TABLE notices ADD COLUMN updated_at DATETIME;               -- 수정 시각

CREATE INDEX IF NOT EXISTS idx_notices_popup ON notices(show_popup);

-- ── 칼럼: 슈퍼 SEO 강화 필드 ──
ALTER TABLE columns ADD COLUMN keywords TEXT;                      -- 콤마 구분 키워드 (SEO)
ALTER TABLE columns ADD COLUMN og_image TEXT;                      -- OG/소셜 공유 대표 이미지 (R2 key). 비우면 thumbnail 사용
ALTER TABLE columns ADD COLUMN reading_time INTEGER DEFAULT 0;     -- 예상 읽기 시간(분)
-- (columns.published 는 0001 스키마에 이미 존재)
