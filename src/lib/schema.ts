// ============================================================
// JSON-LD 구조화 데이터 헬퍼 (§G-2)
// 한의원 모드: Dentist 대신 MedicalClinic 사용
// ============================================================
import { CLINIC } from '../data/clinic'
import { DOCTORS } from '../data/doctors'
import { TREATMENTS } from '../data/treatments'
import type { Treatment } from '../data/treatments'

const ORG_ID = CLINIC.domain + '/#organization'

export function organizationSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': ORG_ID,
    name: CLINIC.nameFull,
    alternateName: CLINIC.nameEn,
    description: CLINIC.mission,
    slogan: CLINIC.tagline,
    url: CLINIC.domain,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    medicalSpecialty: 'TraditionalChineseMedicine',
    priceRange: '₩₩',
    currenciesAccepted: CLINIC.currenciesAccepted,
    paymentAccepted: CLINIC.paymentAccepted.join(', '),
    isAcceptingNewPatients: CLINIC.acceptingNewPatients,
    foundingDate: CLINIC.openedDate,
    image: CLINIC.domain + '/static/og-image.png',
    logo: CLINIC.domain + '/static/og-image.png',
    hasMap: CLINIC.mapUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.address.street,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
      postalCode: CLINIC.address.postalCode,
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CLINIC.address.lat,
      longitude: CLINIC.address.lng,
    },
    // 서비스 제공 지역 (구글 로컬 검색 — 인근 행정구역)
    areaServed: CLINIC.areaServed.map((a) => ({
      '@type': 'AdministrativeArea',
      name: a,
    })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '08:30',
        closes: '15:00',
      },
    ],
    // 주요 진료(핵심) — 구글이 비즈니스가 제공하는 서비스를 이해하도록
    availableService: TREATMENTS.filter((t) => t.category === 'core').map((t) => ({
      '@type': 'MedicalProcedure',
      name: t.name,
      url: `${CLINIC.domain}/treatments/${t.slug}`,
    })),
    sameAs: [
      CLINIC.social.youtube,
      CLINIC.social.blog,
      CLINIC.social.blog2,
      CLINIC.social.naverPlace,
      CLINIC.social.kakao,
      CLINIC.social.threads,
      CLINIC.social.instagram,
    ].filter(Boolean),
    // E1: ReserveAction — AI 에이전트/검색엔진이 "예약" 액션을 이해하도록
    potentialAction: {
      '@type': 'ReserveAction',
      name: '진료 예약',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: CLINIC.social.naverBooking || CLINIC.domain + '/reservation',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
        inLanguage: 'ko-KR',
      },
      result: { '@type': 'Reservation', name: '진료 예약' },
      provider: { '@id': ORG_ID },
    },
  }

  // 평점: 검증된 실제 리뷰 데이터가 있을 때만 출력 (의료광고법·구글 정책 준수)
  if (CLINIC.rating && CLINIC.rating.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: CLINIC.rating.ratingValue,
      reviewCount: CLINIC.rating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

// 한의사: schema.org MedicalSpecialty 에 한의학(한방내과 등)에 맞는 값이 없어 medicalSpecialty 는 넣지 않고
// jobTitle 에 '한의사'를 명시한다. (TraditionalChinese 는 MedicineSystem 이라 전문과목 값이 아님)
export function doctorId(slug: string) {
  return `${CLINIC.domain}/doctors/${slug}#person`
}

export function personSchema(doctorSlug: string) {
  const d = DOCTORS.find((x) => x.slug === doctorSlug)
  if (!d) return null
  const specialistCreds = d.memberships.filter((m) => m.includes('전문의'))
  return {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Physician'],
    '@id': doctorId(d.slug),
    name: d.name,
    jobTitle: ['한의사', d.title],
    url: `${CLINIC.domain}/doctors/${d.slug}`,
    ...(d.photo ? { image: CLINIC.domain + d.photo } : {}),
    worksFor: { '@id': ORG_ID },
    alumniOf: d.education.map((e) => ({ '@type': 'EducationalOrganization', name: e })),
    knowsAbout: d.specialty,
    description: d.intro,
    ...(specialistCreds.length
      ? {
          hasCredential: specialistCreds.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: '전문의',
            name: c,
          })),
        }
      : {}),
  }
}

// 진료 페이지 감수자(대표원장) — 페이지 안에서 @id 가 정의되도록 요약 노드로 함께 출력
export const REVIEWER = DOCTORS.find((d) => d.isCeo) || DOCTORS[0]
export function reviewerSchema() {
  const d = REVIEWER
  return {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Physician'],
    '@id': doctorId(d.slug),
    name: d.name,
    jobTitle: ['한의사', d.title],
    url: `${CLINIC.domain}/doctors/${d.slug}`,
    worksFor: { '@id': ORG_ID },
  }
}

// 진료 페이지 MedicalWebPage — about(MedicalProcedure) · reviewedBy(대표원장) · lastReviewed(고정) · speakable
export function treatmentWebPageSchema(t: Treatment, lastReviewed: string | undefined, speakable: string[]) {
  const url = `${CLINIC.domain}/treatments/${t.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': url + '#webpage',
    url,
    name: `${t.name} — ${CLINIC.nameFull}`,
    description: t.summary,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': CLINIC.domain + '/#website' },
    about: { '@id': url + '#procedure' },
    mainEntity: { '@id': url + '#procedure' },
    reviewedBy: { '@id': doctorId(REVIEWER.slug) },
    ...(lastReviewed ? { lastReviewed } : {}),
    publisher: { '@id': ORG_ID },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: speakable },
  }
}

export function medicalProcedureSchema(t: Treatment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${CLINIC.domain}/treatments/${t.slug}#procedure`,
    name: t.name,
    description: t.summary,
    procedureType: 'https://schema.org/TherapeuticProcedure',
    howPerformed: t.summary,
    url: `${CLINIC.domain}/treatments/${t.slug}`,
    provider: { '@id': ORG_ID },
  }
}

export function faqPageSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: CLINIC.domain + it.url,
    })),
  }
}

export function articleSchema(opts: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified: string
  author: string
  image?: string
  keywords?: string
  wordCount?: number
  timeRequired?: number // 분
}) {
  const base: any = {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    headline: opts.title,
    description: opts.description,
    url: CLINIC.domain + opts.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': CLINIC.domain + opts.url },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { '@type': 'Person', name: opts.author },
    reviewedBy: { '@type': 'Person', name: opts.author },
    publisher: { '@id': ORG_ID },
    inLanguage: 'ko-KR',
  }
  if (opts.image) base.image = opts.image.startsWith('http') ? opts.image : CLINIC.domain + opts.image
  if (opts.keywords) base.keywords = opts.keywords
  if (opts.wordCount) base.wordCount = opts.wordCount
  if (opts.timeRequired) base.timeRequired = `PT${opts.timeRequired}M`
  return base
}

export function cityAreaSchema(areaName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: areaName,
    containedInPlace: { '@type': 'AdministrativeArea', name: '경기도' },
  }
}

export function speakableSchema(cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: cssSelectors },
  }
}

// 지역 SEO 페이지 전용: 특정 지역에 서비스를 제공하는 MedicalClinic
// (거리/소요시간/지역 포함 → 구글 로컬 + AI 답변 강화)
export function localAreaClinicSchema(opts: {
  areaName: string
  areaFull: string
  url: string
  serviceName: string
  serviceUrl: string
  distance?: string
  driveTime?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: `${CLINIC.nameFull} (${opts.areaName}에서 가까운 한의원)`,
    url: CLINIC.domain + opts.url,
    parentOrganization: { '@id': ORG_ID },
    telephone: CLINIC.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.address.street,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
      postalCode: CLINIC.address.postalCode,
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.address.lat, longitude: CLINIC.address.lng },
    areaServed: {
      '@type': 'City',
      name: opts.areaFull,
      containedInPlace: { '@type': 'AdministrativeArea', name: '경기도' },
    },
    availableService: {
      '@type': 'MedicalProcedure',
      name: opts.serviceName,
      url: CLINIC.domain + opts.serviceUrl,
    },
    ...(opts.distance || opts.driveTime
      ? { description: `${opts.areaFull}에서 ${opts.distance || ''} ${opts.driveTime ? '· ' + opts.driveTime : ''} 거리. ${opts.serviceName} 진료를 제공합니다.`.trim() }
      : {}),
  }
}

// AEO: 음성/AI 답변 친화 Q&A (단일 질문-답)
export function qaPageSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

// HowTo: 절차형 콘텐츠(예약 방법, 내원 절차 등)
export function howToSchema(opts: { name: string; description?: string; steps: { name: string; text: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}

// WebSite + SearchAction (사이트링크 검색창)
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': CLINIC.domain + '/#website',
    url: CLINIC.domain,
    name: CLINIC.nameFull,
    inLanguage: 'ko-KR',
    publisher: { '@id': ORG_ID },
  }
}

// ============================================================
// 칼럼·치료 사례 @graph (PFWE-COLUMN-CASE-SEO, 2026-10-03)
// ============================================================
const abs = (u: string) => (u.startsWith('http') ? u : CLINIC.domain + u)
const strip = (o: any) => {
  const { ['@context']: _c, ...rest } = o
  return rest
}
// 작성자/담당 한의사 노드 — 이 페이지 안에서도 @id 가 정의되도록 요약 노드 출력
function physicianNode(slug: string) {
  const d = DOCTORS.find((x) => x.slug === slug)
  if (!d) return null
  return {
    '@type': ['Person', 'Physician'],
    '@id': doctorId(d.slug),
    name: d.name,
    jobTitle: ['한의사', d.title],
    url: `${CLINIC.domain}/doctors/${d.slug}`,
    ...(d.photo ? { image: CLINIC.domain + d.photo } : {}),
    worksFor: { '@id': ORG_ID },
  }
}

export function columnGraphSchema(o: {
  url: string
  title: string
  description: string
  image?: string
  datePublished?: string
  dateModified?: string
  authorSlug?: string
  treatmentSlug?: string
  treatmentName?: string
  categoryLabel?: string
  keywords?: string
  timeRequired?: number
  faqs: { q: string; a: string }[]
}) {
  const url = abs(o.url)
  const author = o.authorSlug ? physicianNode(o.authorSlug) : null
  const procedureId = o.treatmentSlug ? `${CLINIC.domain}/treatments/${o.treatmentSlug}#procedure` : undefined
  const crumbs = [
    { name: '홈', url: '/' },
    { name: '원장 칼럼', url: '/column' },
    ...(o.categoryLabel && o.treatmentSlug ? [{ name: o.categoryLabel, url: `/column?cat=${o.treatmentSlug}` }] : []),
    { name: o.title, url: o.url },
  ]
  const graph: any[] = [
    {
      '@type': ['BlogPosting', 'MedicalWebPage'],
      '@id': url + '#article',
      url,
      headline: o.title.slice(0, 110),
      name: o.title,
      description: o.description,
      ...(o.image ? { image: { '@type': 'ImageObject', url: abs(o.image) } } : {}),
      ...(o.datePublished ? { datePublished: o.datePublished } : {}),
      ...(o.dateModified ? { dateModified: o.dateModified, lastReviewed: o.dateModified.slice(0, 10) } : {}),
      inLanguage: 'ko-KR',
      author: author ? { '@id': author['@id'] } : { '@id': ORG_ID },
      ...(author ? { reviewedBy: { '@id': author['@id'] } } : {}),
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: url,
      isPartOf: { '@id': CLINIC.domain + '/#website' },
      ...(procedureId ? { about: { '@type': 'MedicalProcedure', '@id': procedureId, name: o.treatmentName } } : {}),
      ...(o.keywords ? { keywords: o.keywords } : {}),
      ...(o.timeRequired ? { timeRequired: `PT${o.timeRequired}M` } : {}),
      breadcrumb: { '@id': url + '#breadcrumb' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.page-hero h1', '.answer-summary'] },
    },
    { ...strip(breadcrumbSchema(crumbs)), '@id': url + '#breadcrumb' },
  ]
  if (author) graph.push(author)
  if (o.faqs.length) graph.push({ ...strip(faqPageSchema(o.faqs)), '@id': url + '#faq' })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function caseGraphSchema(o: {
  url: string
  title: string
  description: string
  dateCreated?: string
  doctorSlug?: string
  treatmentSlug?: string
  treatmentName?: string
}) {
  const url = abs(o.url)
  const doc = o.doctorSlug ? physicianNode(o.doctorSlug) : null
  const graph: any[] = [
    {
      '@type': 'MedicalWebPage',
      '@id': url + '#webpage',
      url,
      name: o.title,
      description: o.description,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': CLINIC.domain + '/#website' },
      publisher: { '@id': ORG_ID },
      ...(o.treatmentSlug
        ? { about: { '@type': 'MedicalProcedure', '@id': `${CLINIC.domain}/treatments/${o.treatmentSlug}#procedure`, name: o.treatmentName } }
        : {}),
      ...(doc ? { reviewedBy: { '@id': doc['@id'] } } : {}),
      ...(o.dateCreated ? { datePublished: o.dateCreated, lastReviewed: o.dateCreated.slice(0, 10) } : {}),
      breadcrumb: { '@id': url + '#breadcrumb' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.page-hero h1', '.answer-summary'] },
    },
    {
      ...strip(
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '치료 사례', url: '/cases/gallery' },
          ...(o.treatmentSlug && o.treatmentName ? [{ name: o.treatmentName, url: `/cases/gallery?cat=${o.treatmentSlug}` }] : []),
          { name: o.title, url: o.url },
        ]),
      ),
      '@id': url + '#breadcrumb',
    },
  ]
  if (doc) graph.push(doc)
  return { '@context': 'https://schema.org', '@graph': graph }
}

// 목록: CollectionPage + ItemList (+ BreadcrumbList)
export function collectionGraphSchema(o: {
  url: string
  name: string
  description: string
  crumbs: { name: string; url: string }[]
  items: { name: string; url: string }[]
  startIndex?: number
}) {
  const url = abs(o.url)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url + '#webpage',
        url,
        name: o.name,
        description: o.description,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': CLINIC.domain + '/#website' },
        publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': url + '#breadcrumb' },
        mainEntity: { '@id': url + '#itemlist' },
      },
      {
        '@type': 'ItemList',
        '@id': url + '#itemlist',
        numberOfItems: o.items.length,
        itemListElement: o.items.map((it, i) => ({
          '@type': 'ListItem',
          position: (o.startIndex || 0) + i + 1,
          name: it.name,
          url: abs(it.url),
        })),
      },
      { ...strip(breadcrumbSchema(o.crumbs)), '@id': url + '#breadcrumb' },
    ],
  }
}
