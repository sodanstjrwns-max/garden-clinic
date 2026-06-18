import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { ENC_TERMS } from '../data/encyclopedia'
import { AREAS, AREA_TREATMENTS } from '../data/areas'

const today = () => new Date().toISOString().slice(0, 10)

export function sitemapXml(): string {
  const urls: { loc: string; priority: string; freq: string }[] = []
  const add = (path: string, priority = '0.7', freq = 'monthly') =>
    urls.push({ loc: CLINIC.domain + path, priority, freq })

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
  // 지역 SEO
  AREAS.forEach((a) => AREA_TREATMENTS.forEach((tx) => add(`/area/${a.slug}-${tx.slug}`, '0.6')))

  const items = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc><lastmod>${today()}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`
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

# ── 국내 검색엔진 ──
User-agent: Yeti
Allow: /
User-agent: Daumoa
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

## 진료 지역 (내원 환자 분포)
${AREAS.map((a) => `- ${a.name} (${a.full})`).join('\n')}

## 주요 페이지
- [병원 미션](${d.domain}/mission)
- [의료진 소개](${d.domain}/doctors)
- [전체 진료](${d.domain}/treatments)
- [진료비 안내](${d.domain}/pricing)
- [자주 묻는 질문](${d.domain}/faq)
- [한방 백과사전](${d.domain}/encyclopedia) — 한의학 용어·약재·경혈·증상 ${ENC_TERMS.length}건 해설
- [사상체질 자가 테스트](${d.domain}/sasang-test)
- [오시는 길](${d.domain}/directions)

## 특징
- 예측 가능한 진료: 치료 시간·비용·기간을 사전 안내
- 이해되는 설명: 쉬운 언어와 이미지로 설명
- 한방내과 전문의 기반 체질 맞춤 한약 처방
- 교통사고 후유증 자동차보험 적용 진료
- 전용주차장 완비, 평일 야간·주말 진료

## 안내
- 본 사이트의 의료 정보는 일반적 정보 제공을 목적으로 하며, 진단·치료를 대신하지 않습니다.
- 모든 치료 효과와 반응에는 개인차가 있으며, 정확한 상담은 내원 진료를 통해 안내됩니다.
`
}
