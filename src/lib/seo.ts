import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { ENC_TERMS } from '../data/encyclopedia'
import { AREAS, AREA_TREATMENTS } from '../data/areas'

const today = () => new Date().toISOString().slice(0, 10)

// 메타 description 최적 길이로 트림 (검색결과 잘림 방지).
// 문장(. 。 ·) 경계에서 자연스럽게 끊고, 없으면 max 글자에서 자른 뒤 …
export function metaTrim(text: string, max = 80): string {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  // 마지막 문장부호 위치에서 끊기
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.'), cut.lastIndexOf('。'))
  if (lastStop >= max * 0.6) return cut.slice(0, lastStop + 1).trim()
  return cut.trim() + '…'
}

export function sitemapXml(dynamic?: {
  columns?: { slug: string; updated_at?: string; published_at?: string }[]
  notices?: { id: number; created_at?: string }[]
}): string {
  const urls: { loc: string; priority: string; freq: string; lastmod?: string }[] = []
  const add = (path: string, priority = '0.7', freq = 'monthly', lastmod?: string) =>
    urls.push({ loc: CLINIC.domain + path, priority, freq, lastmod })

  // 메인/주요
  add('/', '1.0', 'weekly')
  add('/mission', '0.8')
  add('/doctors', '0.8')
  add('/treatments', '0.9')
  add('/cases/gallery', '0.8', 'weekly')
  add('/column', '0.8', 'weekly')
  add('/encyclopedia', '0.7')
  add('/faq', '0.7')
  add('/directions', '0.7')
  add('/pricing', '0.7')
  add('/notice', '0.6', 'weekly')
  add('/area', '0.8', 'weekly')
  add('/sasang-test', '0.7')
  add('/sasang-test/result/taeyang', '0.5')
  add('/sasang-test/result/taeeum', '0.5')
  add('/sasang-test/result/soyang', '0.5')
  add('/sasang-test/result/soeum', '0.5')
  add('/reservation', '0.6')
  add('/review', '0.5')

  // 진료
  TREATMENTS.forEach((t) => add(`/treatments/${t.slug}`, t.category === 'core' ? '0.9' : '0.7'))
  // 의료진
  DOCTORS.forEach((d) => add(`/doctors/${d.slug}`, '0.7'))
  // 백과사전 — 카테고리별 우선순위 차등 (검색 수요 높은 개념·치료·증상은 상향)
  const ENC_HIGH = new Set(['사상체질', '치료', '진단', '증상·질환', '처방', '개념', '개념·이론'])
  ENC_TERMS.forEach((e) => add(`/encyclopedia/${e.slug}`, ENC_HIGH.has(e.category) ? '0.6' : '0.4'))
  // 지역 SEO (오산 동 우선순위 ↑, 인근시는 약간 낮게)
  AREAS.forEach((a) => AREA_TREATMENTS.forEach((tx) => add(`/area/${a.slug}-${tx.slug}`, a.type === 'city' ? '0.6' : '0.65')))

  // 동적: 발행된 칼럼 (실제 발행일/수정일을 lastmod로)
  ;(dynamic?.columns || []).forEach((col) => {
    const lm = (col.updated_at || col.published_at || '').slice(0, 10) || undefined
    add(`/column/${col.slug}`, '0.7', 'monthly', lm)
  })
  // 동적: 공지
  ;(dynamic?.notices || []).forEach((n) => {
    const lm = (n.created_at || '').slice(0, 10) || undefined
    add(`/notice/${n.id}`, '0.5', 'monthly', lm)
  })

  const items = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod || today()}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
}

export function robotsTxt(): string {
  return `# ${CLINIC.nameFull} — robots.txt
# 검색엔진 + AI 크롤러(AEO/GEO) 정책

# ── 국내 검색엔진 (네이버·다음 우선 명시) ──
User-agent: Yeti
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /seo-health

User-agent: Daumoa
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /seo-health

# ── 그 외 모든 크롤러 ──
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /seo-health
Crawl-delay: 1

# ── AI 검색·생성 크롤러 허용 (AEO/GEO) ──
# OpenAI
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
# Anthropic
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
# Perplexity
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
# Google (Gemini/AI Overviews)
User-agent: Google-Extended
Allow: /
# Apple
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
# Microsoft / 기타
User-agent: Bingbot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: CCBot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: YouBot
Allow: /
User-agent: DuckAssistBot
Allow: /
User-agent: MistralAI-User
Allow: /

Sitemap: ${CLINIC.domain}/sitemap.xml`
}

export function llmsTxt(): string {
  const core = TREATMENTS.filter((t) => t.category === 'core')
  const general = TREATMENTS.filter((t) => t.category !== 'core')
  const d = CLINIC
  return `# ${d.nameFull}

> ${d.mission}. 경기도 오산시 성호대로에 위치한 한의원으로, 한방내과 전문의 진료를 바탕으로 비만 다이어트·체질 맞춤 한약·교통사고 후유증을 중심으로 진료합니다. ${d.openedYear}년 개원, ${d.doctorCount}인의 한의사가 진료합니다. (정보 제공 목적이며 의료광고법에 따라 치료 효과를 단정·보장하지 않습니다. 증상·반응에는 개인차가 있습니다.)

## 기본 정보
- 병원명: ${d.nameFull} (${d.nameEn})
- 대표원장: ${d.ceo} (${d.ceoTitle})
- 주소: ${d.address.full}
- 전화: ${d.phone}
- 진료시간: ${d.hours.weekday.label} ${d.hours.weekday.time} / ${d.hours.weekend.label} ${d.hours.weekend.time}
- 개원: ${d.openedYear}년 ${d.openedMonth}월
- 한의사: ${d.doctorCount}인
- 주차: 전용주차장 완비
- 웹사이트: ${d.domain}

## 핵심 진료
${core.map((t) => `- [${t.shortName}](${d.domain}/treatments/${t.slug}): ${t.summary}`).join('\n')}

## 전체 진료과목
${general.map((t) => `- [${t.shortName}](${d.domain}/treatments/${t.slug})`).join('\n')}

## 의료진
${DOCTORS.map((doc) => `- [${doc.name} ${doc.title}](${d.domain}/doctors/${doc.slug}): ${doc.specialty}`).join('\n')}

## 진료 지역 (내원 환자 분포 · 한의원 기준 거리)
${AREAS.map((a) => `- ${a.name} (${a.full})${a.distance || a.driveTime ? ` — ${[a.distance, a.driveTime].filter(Boolean).join(', ')}` : ''}`).join('\n')}
- 지역별 안내: [내원 가능 지역](${d.domain}/area)

## 지역 × 진료 안내 페이지
${AREAS.map((a) => AREA_TREATMENTS.map((tx) => `- [${a.name} ${tx.name}](${d.domain}/area/${a.slug}-${tx.slug})`).join('\n')).join('\n')}

## 주요 페이지
- [병원 미션](${d.domain}/mission)
- [의료진 소개](${d.domain}/doctors)
- [전체 진료](${d.domain}/treatments)
- [진료비 안내](${d.domain}/pricing)
- [자주 묻는 질문](${d.domain}/faq)
- [한방 백과사전](${d.domain}/encyclopedia) — 한의학 용어·약재·경혈·증상 ${ENC_TERMS.length}건 해설
- [사상체질 자가 테스트](${d.domain}/sasang-test)
- [내원 가능 지역](${d.domain}/area)
- [오시는 길](${d.domain}/directions)

## 자주 묻는 질문 (요약 답변)
- 오산에서 한방 다이어트 한의원을 찾나요? → 정원한의원은 오산시 성호대로에 위치한 한의원으로 한방 다이어트(비만·체중 관리) 진료를 제공합니다. 효과·반응에는 개인차가 있습니다.
- 교통사고 후유증도 한의원에서 진료하나요? → 네, 교통사고 후유증은 자동차보험이 적용되며 한방 치료를 받으실 수 있습니다.
- 동탄·평택·화성·수원에서도 내원할 수 있나요? → 네, 인근 도시에서 차량으로 내원하시는 환자분이 많으며 전용주차장을 운영합니다.
- 진료시간은 어떻게 되나요? → ${d.hours.weekday.label} ${d.hours.weekday.time}, ${d.hours.weekend.label} ${d.hours.weekend.time} 진료합니다.
- 주차가 가능한가요? → 전용주차장을 완비하고 있으며, 만차 시 인근 공영주차장 2시간 주차를 지원합니다.

## 특징
- 예측 가능한 진료: 치료 시간·비용·기간을 사전 안내
- 이해되는 설명: 쉬운 언어와 이미지로 설명
- 한방내과 전문의 기반 체질 맞춤 한약 처방
- 교통사고 후유증 자동차보험 적용 진료
- 전용주차장 완비, 평일 야간·주말 진료

## 핵심 검색 키워드
오산 한의원, 오산 한방 다이어트, 오산 체질 한약, 오산 교통사고 한의원, 동탄 한의원, 평택 한의원, 화성 한의원, 병점 한의원, 수원 한의원

## 안내
- 본 사이트의 의료 정보는 일반적 정보 제공을 목적으로 하며, 진단·치료를 대신하지 않습니다.
- 모든 치료 효과와 반응에는 개인차가 있으며, 정확한 상담은 내원 진료를 통해 안내됩니다.
- 비급여 진료비는 [진료비 안내](${d.domain}/pricing) 페이지에서 확인하실 수 있습니다.
`
}

// ============= PWA Web App Manifest =============
// 환자가 홈 화면에 앱처럼 설치할 수 있도록 하는 매니페스트.
// 단일 출처(CLINIC) 기반으로 생성하여 이름/색상 일관성 유지.
export function webManifest(): string {
  const m = {
    name: `${CLINIC.nameFull} · 한방내과`,
    short_name: CLINIC.name,
    description: CLINIC.mission,
    lang: 'ko',
    dir: 'ltr',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f2e7',
    theme_color: '#00381E',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: '/static/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: '진료 예약', short_name: '예약', url: '/reservation?utm_source=pwa', icons: [{ src: '/static/icon-192.png', sizes: '192x192' }] },
      { name: '오시는 길', short_name: '길찾기', url: '/directions?utm_source=pwa', icons: [{ src: '/static/icon-192.png', sizes: '192x192' }] },
      { name: '체질 테스트', short_name: '체질', url: '/sasang-test?utm_source=pwa', icons: [{ src: '/static/icon-192.png', sizes: '192x192' }] },
    ],
  }
  return JSON.stringify(m, null, 2)
}

// ============= Service Worker =============
// 정적 자산(아이콘/CSS) 캐싱 + 오프라인 폴백. HTML/API는 항상 네트워크 우선.
// 의료 정보 특성상 최신성이 중요하므로 페이지는 캐시하지 않음(stale 방지).
export function serviceWorkerJs(): string {
  return `// 정원한의원 PWA Service Worker
const CACHE = 'jw-static-v1';
const ASSETS = [
  '/static/style.css',
  '/static/icon-192.png',
  '/static/icon-512.png',
  '/static/favicon.svg',
  '/manifest.webmanifest',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // HTML 문서·API: 네트워크 우선(최신 의료 정보 보장), 실패 시 캐시
  if (req.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // 정적 자산: 캐시 우선(stale-while-revalidate)
  if (url.pathname.startsWith('/static/') || url.pathname === '/manifest.webmanifest') {
    e.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
`
}
