-- 정원한의원 오산 D1 스키마

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  agree_marketing INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 예약
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  treatment TEXT,
  preferred TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 비포애프터 케이스
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  age_group TEXT,
  gender TEXT,
  category TEXT,            -- 진료 slug
  area TEXT,                -- 지역 카테고리
  doctor TEXT,              -- 담당 원장 slug
  duration TEXT,            -- 치료 기간
  pano_before TEXT,         -- R2 key (파노라마/전신 전)
  pano_after TEXT,          -- R2 key (파노라마/전신 후)
  intra_before TEXT,        -- R2 key (부위 전)
  intra_after TEXT,         -- R2 key (부위 후)
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 원장 칼럼
CREATE TABLE IF NOT EXISTS columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,        -- HTML
  category TEXT,             -- 관련 진료 slug
  author TEXT,               -- 원장 slug
  thumbnail TEXT,            -- R2 key
  meta_description TEXT,
  published INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT,                -- R2 key
  is_pinned INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 조회수 로그 (봇 제외 실측)
CREATE TABLE IF NOT EXISTS view_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL,   -- case | column | notice
  content_id INTEGER NOT NULL,
  is_bot INTEGER DEFAULT 0,
  ua TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_doctor ON cases(doctor);
CREATE INDEX IF NOT EXISTS idx_columns_category ON columns(category);
CREATE INDEX IF NOT EXISTS idx_columns_published ON columns(published);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(is_pinned);
CREATE INDEX IF NOT EXISTS idx_viewlogs_content ON view_logs(content_type, content_id);
