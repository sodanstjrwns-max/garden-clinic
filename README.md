# 정원한의원 오산 (Jeongwon Korean Medicine Clinic) — 공식 웹사이트

## 프로젝트 개요
- **이름**: 정원한의원 오산 공식 웹사이트
- **목표**: 환자가 병원을 인지하는 순간부터 지인 소개까지의 여정(페이션트 퍼널)을 설계한, 인터랙티브 풀스택 한의원 웹사이트. 비디치과(bdbddc.com) 수준의 구조·SEO·퍼널·내부링크 골격을 갖추되, 디자인/콘텐츠는 정원한의원 고유의 정체성으로 차별화.
- **대표원장**: 심원석 (한방내과)
- **브랜드 컬러**: 딥 포레스트 그린 (스타벅스 계열, `#14532d`)
- **모드**: 한의원 모드 — `MedicalClinic` + `LocalBusiness` 스키마 (Dentist 아님)

## 주요 기능 (완료)
- ✅ **풀스크린 히어로 + 스크롤 리빌 + 패럴랙스 + 카운트업** 인터랙션 ("우와" 레벨 디자인, §C)
- ✅ **의료광고법 자동 필터** 통과 콘텐츠 (최상급/효과보장/수치단정 표현 배제, §B)
- ✅ **진료 페이지**: 핵심 TOP3(다이어트·맞춤한약·교통사고 후유증, 본문 1,500자+) + 일반 진료 + AEO 질문형 H2
- ✅ **의료진 페이지**: 심원석 대표원장 프로필 (학력/경력/소속 — 지원서 기재 사실만, 날조 없음)
- ✅ **비포/애프터 사례**: 4장(파노라마·구강내 전후) 업로드, 애프터 사진 로그인 게이팅(의료법 3중 보호), 지역 자동완성, 슬라이더
- ✅ **원장 칼럼** (자체 도메인 SEO 블로그) + **공지사항**
- ✅ **한방 백과사전 536개 용어** + 자동 내부링크(autoLinkTerms)
- ✅ **통합 FAQ** (진료별 카테고리 탭, FAQPage 스키마)
- ✅ **사상체질 TI 테스트** (8문항 자가진단 인터랙티브, §Q41) — 의료 면책 문구 포함
- ✅ **예약 시스템** (R2 저장 + Resend 이메일 발송)
- ✅ **회원 인증** (개인정보+마케팅 동의, HMAC 서명 세션) + **마이페이지**
- ✅ **관리자 패널** (예약/사례/칼럼/공지/회원 관리, noindex)
- ✅ **지역 SEO 페이지** (오산 동별 + 동탄/평택/화성 × 핵심 진료 조합)
- ✅ **내부링크 골격** (진료↔의료진↔사례↔칼럼↔백과사전↔지역)
- ✅ **SEO/AEO 풀세트**: JSON-LD(Organization/Person/MedicalProcedure/FAQPage/Breadcrumb/Article/City/DefinedTerm/Speakable), sitemap.xml, robots.txt(GPTBot/ClaudeBot/PerplexityBot 허용), llms.txt
- ✅ **favicon / og-image / apple-touch-icon** 정적 자산

### 🚀 퍼널 슈퍼 업그레이드 (2026-06-12)
- ✅ **체질 TI → 리드 머신**: 결과 화면에서 "맞춤 진료 제안받기" 연락처 수집 → D1 `leads` 저장 + Resend 알림
- ✅ **체질 결과 공유 카드**: `/sasang-test/result/:type` OG 페이지 + Web Share API / 링크 복사 (⑩ 소개 단계 디지털화)
- ✅ **3스텝 예약 퍼널 폼**: 진료 카드 선택 → 일정/증상 → 연락처, `?t=진료명` 원클릭 사전선택, 완료 화면에 방문 전 안내(주차/교통/준비물) 자동 노출
- ✅ **모바일 하단 고정 CTA 바**: 전화·예약·체질테스트·길찾기 4버튼 (768px 이하)
- ✅ **퍼널 이벤트 추적**: page_view / ti_start / ti_complete / ti_lead / resv_start / resv_step / resv_submit / share_click / review_click / cta_* → `funnel_events` (봇 제외, sendBeacon)
- ✅ **UTM/유입경로 자동 기록**: utm_source/medium/campaign + referrer 추론(naver/google/kakao…) → 예약·리드·이벤트에 저장
- ✅ **관리자 퍼널 분석 탭**: 단계별 깔때기 차트(7/30/90일) + 유입 채널별 이벤트/예약 집계
- ✅ **관리자 리드 탭**: 상태 워크플로우 (신규→연락됨→전환→종료)
- ✅ **리콜(재내원) 시스템**: 대상 등록 + 다음 내원 추천일 + 기한 경과 ⚠️ 표시 + 상태 워크플로우 (⑧ 재방문)
- ✅ **후기 동선** `/review`: 네이버/구글 리뷰 안내 + 마이페이지 진료완료 시 후기 CTA (⑨ 팬화)
- ✅ **마이페이지 업그레이드**: 나의 예약·진료 이력 테이블 + 진료완료 시 후기 요청 배너

### 📝 2차 답변서 콘텐츠 반영 (2026-06-12)
- ✅ **의료진 8인 전원 프로필**: 심원석(대표·한방내과 전문의·논문 2편·참여연구) / 김은아(다이어트·소아) / 심우남(갱년기·피부·비염) / 이용욱(남성·통증·자율신경) / 강태우·김천용(교통사고·추나) / 박주혜(교통사고·부인과) / 전우진(통증·다이어트) — 원장별 주력 분야·약력·한 줄 다짐 원문 반영
- ✅ **진료과목 확장**: 재활·뇌신경 클리닉(중풍·파킨슨·안면마비), 남성 클리닉 신설 → 총 15개. 진료별 담당 원장 매핑
- ✅ **교통사고 차별점**: "치료받다 호전 없어 옮겨오는 환자·재내원 환자가 많은 이유" 섹션 (원래 척추 정렬·기존 불편까지 고려)
- ✅ **한방내과 전문의 차별점**: 양약 이해·병원 치료와의 병행·1포 단위 처방 경험 — 한약 페이지 + FAQ + 칼럼
- ✅ **촉진·압진 진료법**: 홈 + 미션 페이지 ("눈으로 보고 손으로 확인" — 원거리 환자 내원 이유)
- ✅ **3불 시스템 구체화**: 약재 사진 전송 / 치료 계획표 / 검사·상담료 사전 고지 / 가슴베개·다리베개 / 스피드진료 / 빠른 계획 수정
- ✅ **체질TI '내 몸 사용설명서' 컨셉**: 인트로 리라이팅 (병이 아니라 작동 방식)
- ✅ **교육형 칼럼 3편 추가**: 직업과 통증 / 한방내과 전문의 차이 / 체질=사용설명서 (의료광고법 준수)
- ✅ **채널 연동**: 유튜브·네이버 블로그 2개·플레이스·카카오채널·스레드 → 푸터 아이콘 + Organization sameAs 스키마

### ✅ 제작 가이드 전수 점검 (2026-06-13)
- ✅ **FAQ 291개**: 전 진료과목 14개 카테고리 모두 20개 이상 (가이드 요구 충족) — 진료 상세 페이지에 전체 노출 + FAQPage 스키마
- ✅ **블로그 SEO 에디터**: H2/H3/문단/굵게/목록/인용 툴바 + 이미지 다중 업로드(R2) + **드래그&드롭 본문 삽입** + 썸네일 + 메타설명 + 작성자(원장) 선택
- ✅ **칼럼/공지 수정 기능**: 관리자 테이블 [수정] 버튼 → 폼 프리필 → PUT 저장 (썸네일/사진 유지 또는 교체)
- ✅ **공지 사진 쳊부** + 대표(상단 고정) 공지 지정
- ✅ **원장↔비포애프터 양방향 인링크**: 원장 상세 → "해당 원장 사례 보기"(`/cases/gallery?doctor=slug`), 사례 상세 → 담당 원장 프로필 + 다른 사례
- ✅ **푸터 사업자정보 라인**: 상호/대표원장/주소/전화/사업자등록번호(추후 게재 예정 — 클라이언트 제공 대기)/진료시간
- ✅ **본문 이미지 API**: `POST /admin/api/upload-image` → R2 `content/` → `GET /api/content-image/:key` (공개, 캐시 불변)

## 기능 진입 URI (경로 및 파라미터)

### 공개 페이지
| 경로 | 설명 |
|---|---|
| `GET /` | 메인(히어로/퍼널/핵심진료/대표원장/체질TI CTA) |
| `GET /mission` | 병원 미션 |
| `GET /treatments` | 진료과목 목록 |
| `GET /treatments/:slug` | 진료 상세 (예: `/treatments/diet`, `custom-herbal`, `car-accident`) |
| `GET /doctors` | 의료진 목록 |
| `GET /doctors/:slug` | 의료진 상세 (예: `/doctors/shim-wonseok`) |
| `GET /cases/gallery` | 비포/애프터 갤러리 (쿼리: `?cat=diet`, `?doctor=shim-wonseok`) |
| `GET /cases/:id` | 사례 상세 (애프터 사진 로그인 게이팅) |
| `GET /column` · `GET /column/:slug` | 원장 칼럼 목록/상세 |
| `GET /notice` · `GET /notice/:id` | 공지 목록/상세 |
| `GET /encyclopedia` · `GET /encyclopedia/:slug` | 백과사전 목록/상세 (예: `/encyclopedia/term-1`) |
| `GET /faq` | 통합 FAQ |
| `GET /sasang-test` | 사상체질 TI 테스트 |
| `GET /area/:combo` | 지역 SEO (예: `/area/osan-dong-diet`, `/area/dongtan-custom-herbal`) |
| `GET /directions` · `GET /pricing` | 오시는 길 / 비급여 안내 |
| `GET /privacy` · `GET /terms` | 개인정보처리방침 / 이용약관 |
| `GET /reservation` | 온라인 예약 (3스텝 폼, 쿼리: `?t=진료명` 사전선택) |
| `GET /sasang-test/result/:type` | 체질 결과 공유 페이지 (taeyang/taeeum/soyang/soeum) |
| `GET /review` | 후기 남기기 (네이버/구글 리뷰 안내) |
| `GET /auth/login` · `/auth/register` · `/auth/mypage` | 회원 로그인/가입/마이페이지 |

### API
| 경로 | 설명 |
|---|---|
| `POST /api/auth/register` · `login` · `logout` | 회원 인증 (JSON) |
| `POST /api/reservation` | 예약 접수 (D1 + UTM 기록 + Resend 이메일) |
| `POST /api/lead` | 체질테스트 리드 접수 (D1 + Resend 이메일) |
| `POST /api/track` | 퍼널 이벤트 수집 (sendBeacon, 봇 제외) |
| `GET /api/case-image/:id/:type` | 사례 이미지 (after 타입은 로그인 필요) |
| `GET /api/column-image/:id` · `/api/notice-image/:id` | 콘텐츠 이미지 |

### 관리자 (noindex)
| 경로 | 설명 |
|---|---|
| `GET /admin/login` · `POST /admin/login` · `/admin/logout` | 관리자 인증 |
| `GET /admin` | 대시보드 |
| `POST /admin/api/cases` · `columns` · `notices` | 콘텐츠 등록 (multipart) |
| `POST /admin/api/reservations/:id/status` | 예약 상태 변경 |
| `GET /admin?tab=funnel&days=30` | 퍼널 깔때기 대시보드 (7/30/90일) |
| `GET /admin?tab=leads` · `POST /admin/api/leads/:id/status` | 리드 관리/상태 순환 |
| `GET /admin?tab=recalls` · `POST /admin/api/recalls` | 리콜 등록/관리 |

### SEO 파일
- `GET /sitemap.xml` — 전 페이지 + 진료 + 의료진 + 백과사전 536 + 지역 조합
- `GET /robots.txt` — 검색봇 + AI 크롤러 허용
- `GET /llms.txt` — LLM 친화 사이트 요약

## 데이터 아키텍처
- **데이터 모델**:
  - `users` (회원, 동의 항목, HMAC 세션)
  - `reservations` (예약, 상태 관리, UTM 유입경로)
  - `leads` (체질테스트 리드: 체질/관심진료/UTM/상태 워크플로우)
  - `funnel_events` (퍼널 이벤트: 세션ID/UTM/봇플래그, 인덱스)
  - `recalls` (재내원 대상: 추천일/상태 워크플로우)
  - `cases` (비포/애프터 4장: pano_before/after, intra_before/after)
  - `columns` (원장 칼럼), `notices` (공지), `view_logs` (조회수, 봇 제외)
- **정적 데이터(TS)**: 진료 13종, 의료진, FAQ 4카테고리, 지역 12, 사상체질 8문항/4결과, 백과사전 536 용어
- **스토리지 서비스**:
  - **Cloudflare D1** (SQLite) — 회원/예약/사례/칼럼/공지/조회로그
  - **Cloudflare R2** — 이미지/예약 첨부 객체 저장
- **데이터 흐름**: SSR(Hono JSX) → D1/R2 조회 → 페이지 렌더 / 폼 → API → D1·R2 저장 → Resend 이메일

## 사용자 가이드
1. **방문자**: 메인에서 진료 안내·체질TI·비포애프터 확인 → 예약(`/reservation`) 또는 전화(031-831-8620)
2. **회원**: `/auth/register`로 가입(개인정보·마케팅 동의) → 로그인 시 사례의 애프터 사진 열람 가능
3. **관리자**: `/admin/login` → 예약 확인·사례/칼럼/공지 등록

## 기술 스택
- **백엔드**: Hono v4 (JSX SSR) on Cloudflare Workers/Pages
- **빌드**: Vite + `@hono/vite-build/cloudflare-pages`
- **스토리지**: Cloudflare D1 + R2
- **인증**: HMAC 서명 세션 (Web Crypto API, UTF-8 base64url)
- **메일**: Resend
- **프론트**: Tailwind CDN + 커스텀 CSS(녹색 디자인 시스템), Pretendard + 나눔명조
- **프로세스**: PM2 (포트 3000)

## 로컬 개발
```bash
npm run build                 # dist/_worker.js 빌드
pm2 start ecosystem.config.cjs # wrangler pages dev (포트 3000)
curl http://localhost:3000     # 동작 확인

# D1 로컬
npm run db:migrate:local       # 마이그레이션 적용
npm run db:seed                # 시드 데이터
```

## 배포
- **플랫폼**: Cloudflare Pages
- **상태**: 🟡 샌드박스 검증 완료 / 프로덕션 배포 대기 (배포 경로 선택 필요)
- **프로젝트명**: `jeongwon-hani`
- **마지막 업데이트**: 2026-06-13

### ✅ SEO/AEO 기본기 전수 점검 (2026-06-14)
제작 가이드 종합 점검리스트 기준 전 항목 검증 완료:
- ✅ **메타태그 풀세트**: 전 페이지 고유 title/description, canonical, robots, theme-color, author
- ✅ **OG/Twitter 완비**: og:image + **width/height/alt 추가**, **twitter:image 추가**
- ✅ **구조화 데이터**: 홈 Organization(MedicalClinic+LocalBusiness), 진료 MedicalProcedure+FAQPage(20문항)+Breadcrumb, 원장 Person+EducationalOrganization, 지역 City+AdministrativeArea
- ✅ **H1 전 페이지 정확히 1개**, 질문형 H2(AEO)
- ✅ **sitemap.xml 603 URL 전부 lastmod**, robots.txt(GPTBot/ClaudeBot/PerplexityBot/Google-Extended 허용), llms.txt
- ✅ **내부링크 양방향**: 진료↔담당원장↔사례 완전 연결
- ✅ **이미지 alt 100% + loading lazy/eager 적절**, FAQ 진료별 20개 이상
- ✅ **폰트 preload 추가** (Pretendard woff2, LCP 최적화) + preconnect(crossorigin)
- ✅ **검색엔진 인증 메타 자리 추가** (`CLINIC.verification.naver/google/bing` — 값 입력 시 자동 출력)

## 미구현 / 다음 단계 권장
- [ ] 프로덕션 Cloudflare Pages 배포 (BYOK 또는 Genspark 호스팅 중 선택)
- [ ] 배포 후 네이버 서치어드바이저/구글 서치콘솔/Bing 등록 → 발급 토큰을 `src/data/clinic.ts`의 `verification`에 입력
- [ ] 실제 의료진 사진 / 병원 시설 사진 교체 (현재 플레이스홀더)
- [ ] Google OAuth 소셜 로그인 연동(스캐폴드 존재)
- [ ] Resend API 키 시크릿 등록 (`wrangler secret put`)
- [ ] 배포 후 PageSpeed Insights 실측 → Core Web Vitals 미세 튜닝
- [ ] 칼럼/사례 실제 콘텐츠 추가 입력
