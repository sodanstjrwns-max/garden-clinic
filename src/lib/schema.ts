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
      streetAddress: CLINIC.address.short,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
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

export function personSchema(doctorSlug: string) {
  const d = DOCTORS.find((x) => x.slug === doctorSlug)
  if (!d) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${CLINIC.domain}/doctors/${d.slug}#person`,
    name: d.name,
    jobTitle: d.title,
    worksFor: { '@id': ORG_ID },
    alumniOf: d.education.map((e) => ({ '@type': 'EducationalOrganization', name: e })),
    knowsAbout: d.specialty,
    description: d.intro,
  }
}

export function medicalProcedureSchema(t: Treatment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: t.name,
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
      streetAddress: CLINIC.address.short,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
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
