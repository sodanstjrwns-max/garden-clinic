-- ============================================================
-- 콘텐츠 영상 (유튜브) 게시판
--  · YouTube API 없이 admin에서 영상 URL을 직접 등록 (비디치과 방식)
--  · URL에서 추출한 video_id 로 썸네일/임베드 표시
-- ============================================================

CREATE TABLE IF NOT EXISTS videos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,                       -- 영상 제목
  youtube_url  TEXT NOT NULL,                       -- 원본 URL
  video_id     TEXT NOT NULL,                       -- 추출된 YouTube video id
  channel      TEXT DEFAULT 'garden',               -- garden(가고싶은 한의원) | diet(다이어트 멘토 김은아)
  description  TEXT,                                -- 짧은 설명
  is_visible   INTEGER DEFAULT 1,                   -- 0이면 숨김
  sort_order   INTEGER DEFAULT 0,                   -- 정렬(작을수록 앞)
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_visible ON videos(is_visible);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel);
