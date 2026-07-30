-- ============================================================
-- 약재 사진 갤러리 게시판
--  · 매일 약재 사진을 admin에서 업로드 → 공개 갤러리 페이지에 노출
--  · 이미지는 R2(herb/ 프리픽스)에 저장, 메타데이터만 D1에 보관
-- ============================================================

CREATE TABLE IF NOT EXISTS herb_photos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key    TEXT NOT NULL,                       -- R2 오브젝트 키 (herb/...)
  herb_name    TEXT,                                -- 약재 이름 (예: 감초, 당귀)
  caption      TEXT,                                -- 사진 설명 (한 줄)
  is_visible   INTEGER DEFAULT 1,                   -- 0이면 숨김
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP   -- 촬영/등록 시각
);

CREATE INDEX IF NOT EXISTS idx_herb_visible ON herb_photos(is_visible);
CREATE INDEX IF NOT EXISTS idx_herb_created ON herb_photos(created_at);
