// ============================================================
// JSON-LD 구조화 데이터 헬퍼 (§G-2)
// 한의원 모드: Dentist 대신 MedicalClinic 사용
// ============================================================
import { CLINIC } from '../data/clinic'
import { DOCTORS } from '../data/doctors'
import type { Treatment } from '../data/treatments'

const ORG_ID = CLINIC.domain + '/#organization'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': ORG_ID,
    name: CLINIC.nameFull,
    alternateName: CLINIC.nameEn,
    url: CLINIC.domain,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    medicalSpecialty: 'TraditionalChineseMedicine',
    priceRange: '₩₩',
    image: CLINIC.domain + '/static/og-image.png',
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
    sameAs: [CLINIC.social.youtube, CLINIC.social.blog, CLINIC.social.instagram].filter(Boolean),
  }
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    headline: opts.title,
    description: opts.description,
    url: CLINIC.domain + opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { '@type': 'Person', name: opts.author },
    reviewedBy: { '@type': 'Person', name: opts.author },
    publisher: { '@id': ORG_ID },
  }
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
