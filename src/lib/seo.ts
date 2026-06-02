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
  add('/reservation', '0.6')

  // 진료
  TREATMENTS.forEach((t) => add(`/treatments/${t.slug}`, t.category === 'core' ? '0.9' : '0.7'))
  // 의료진
  DOCTORS.forEach((d) => add(`/doctors/${d.slug}`, '0.7'))
  // 백과사전
  ENC_TERMS.forEach((e) => add(`/encyclopedia/${e.slug}`, '0.5'))
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
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

# AI 크롤러 허용 (AEO)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${CLINIC.domain}/sitemap.xml`
}

export function llmsTxt(): string {
  const core = TREATMENTS.filter((t) => t.category === 'core')
  return `# ${CLINIC.nameFull}

> ${CLINIC.mission}. 오산 성호대로에 위치한 한의원으로, 한방내과 전문의 진료를 바탕으로 비만 다이어트·체질 맞춤 한약·교통사고 후유증을 중심으로 진료합니다.

## 기본 정보
- 병원명: ${CLINIC.nameFull}
- 대표원장: ${CLINIC.ceo} (한방내과 전문의)
- 주소: ${CLINIC.address.full}
- 전화: ${CLINIC.phone}
- 진료시간: ${CLINIC.hours.weekday.label} ${CLINIC.hours.weekday.time}, ${CLINIC.hours.weekend.label} ${CLINIC.hours.weekend.time}
- 개원: ${CLINIC.openedYear}년

## 핵심 진료
${core.map((t) => `- [${t.shortName}](${CLINIC.domain}/treatments/${t.slug}): ${t.summary}`).join('\n')}

## 주요 페이지
- [병원 미션](${CLINIC.domain}/mission)
- [의료진](${CLINIC.domain}/doctors)
- [전체 진료](${CLINIC.domain}/treatments)
- [자주 묻는 질문](${CLINIC.domain}/faq)
- [한방 백과사전](${CLINIC.domain}/encyclopedia)
- [오시는 길](${CLINIC.domain}/directions)

## 특징
- 예측 가능한 진료: 치료 시간·비용·기간을 사전 안내
- 이해되는 설명: 쉬운 언어와 이미지로 설명
- 한방내과 전문의 기반 체질 맞춤 한약 처방
- 교통사고 후유증 자동차보험 적용 진료
- 전용주차장 완비, 평일 야간·주말 진료
`
}
