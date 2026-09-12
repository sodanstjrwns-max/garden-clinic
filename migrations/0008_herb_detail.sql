-- ============================================================
-- 오늘 달인 한약 상세 페이지 (/herbs/:id)
--  · 사진마다 제목·본문(경량 마크업)·슬러그를 저장해 개별 페이지로 노출
--  · 원장이 배송 한약과 함께 환자에게 URL을 전달하는 용도
-- ============================================================
ALTER TABLE herb_photos ADD COLUMN title TEXT;
ALTER TABLE herb_photos ADD COLUMN body TEXT;
ALTER TABLE herb_photos ADD COLUMN slug TEXT;
