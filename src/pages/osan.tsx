// ============================================================
// "오산 {진료}" 하위 페이지 6장 (/osan/*) + 홈 사진 카드 그리드 (2026-10-14, 하위 페이지 카드 2b)
// 데이터: src/data/osan-cards.ts — og:image·본문 첫 img·MedicalWebPage.image·사이트맵 image:image 가 모두 같은 사진
// ============================================================
import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC } from '../data/clinic'
import { getTreatment } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { OSAN_CARDS, OSAN_CARD_DATE, osanCardImg, type OsanCard } from '../data/osan-cards'
import { breadcrumbSchema, faqPageSchema, organizationSchema, speakableSchema } from '../lib/schema'

/** 홈·하위 페이지 공용 6장 사진 카드 — 홈 ItemList(osanItemListSchema)와 같은 순서 */
export const OsanCardGrid: FC<{ id: string; eyebrow: string; heading: any; sub: string; exclude?: string }> = ({ id, eyebrow, heading, sub, exclude }) => {
  const list = OSAN_CARDS.filter((c) => c.path !== exclude)
  return (
    <section class="section osan-cards" id={id} aria-labelledby={`${id}-h`}>
      <div class="wrap">
        <div class="sec-head center" data-reveal>
          <span class="eyebrow eyebrow--center">{eyebrow}</span>
          <h2 id={`${id}-h`}>{heading}</h2>
          <p>{sub}</p>
        </div>
        <ul class="osan-card-grid" role="list">
          {list.map((c) => (
            <li>
              <a class="osan-card" href={c.path}>
                <span class="osan-card__img">
                  <img src={osanCardImg(c, 'card')} alt={c.name} width="600" height="600" loading="lazy" decoding="async" />
                </span>
                <span class="osan-card__body">
                  <strong class="osan-card__title">{c.name}</strong>
                  <span class="osan-card__line">{c.line}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export const OsanTxPage: FC<{ card: OsanCard }> = ({ card }) => {
  const t = getTreatment(card.tx)
  const docs = card.doctors.map((d) => getDoctor(d)).filter(Boolean) as NonNullable<ReturnType<typeof getDoctor>>[]
  const url = CLINIC.domain + card.path
  const og = CLINIC.domain + osanCardImg(card, 'og')
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': url + '#webpage',
    url,
    name: card.title,
    headline: card.name,
    description: card.answer,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': CLINIC.domain + '/#website' },
    image: { '@type': 'ImageObject', url: og, width: 1200, height: 630, caption: card.alt },
    primaryImageOfPage: { '@type': 'ImageObject', url: og, width: 1200, height: 630 },
    ...(t ? { about: { '@type': 'MedicalProcedure', name: t.name, url: `${CLINIC.domain}/treatments/${t.slug}` } } : {}),
    audience: { '@type': 'Patient', geographicArea: { '@type': 'City', name: '경기도 오산시' } },
    // author/reviewedBy 없음 — 2026-10-14 병원 발행 안내 페이지(원장 검토 기록 없음)
    publisher: { '@id': CLINIC.domain + '/#organization' },
    dateModified: OSAN_CARD_DATE,
    relatedLink: [CLINIC.domain + '/', ...(t ? [`${CLINIC.domain}/treatments/${t.slug}`] : [])],
  }
  return (
    <Page
      title={card.title}
      description={card.desc}
      path={card.path}
      keywords={card.keywords}
      ogImage={og}
      jsonLd={[
        organizationSchema(),
        webPage,
        faqPageSchema(card.faqs),
        speakableSchema(['.osan-answer', 'h1']),
        breadcrumbSchema([
          { name: '오산 한의원', url: '/' },
          { name: card.name, url: card.path },
        ]),
      ]}
    >
      <PageHero title={card.name} desc={card.line} breadcrumb={[{ label: '오산 한의원', href: '/' }, { label: card.name }]} />
      <section class="section">
        <div class="wrap detail-layout">
          <div class="article" data-reveal>
            <figure class="osan-hero-img">
              <img src={osanCardImg(card, 'body')} alt={card.alt} width="1200" height="800" fetchpriority="high" decoding="async" />
            </figure>
            <p class="osan-answer answer" style="font-size:17px">{card.answer}</p>
            <div class="area-access">
              <div class="area-access__item"><i class="fas fa-train-subway"></i><span>오산역</span><strong>1번 출구 도보 5분</strong></div>
              <div class="area-access__item"><i class="fas fa-clock"></i><span>평일</span><strong>08:30~20:00</strong></div>
              <div class="area-access__item"><i class="fas fa-calendar-day"></i><span>주말·공휴일</span><strong>08:30~15:00</strong></div>
              <div class="area-access__item"><i class="fas fa-square-parking"></i><span>주차</span><strong>전용주차장</strong></div>
            </div>

            {card.sections.map((s) => (
              <>
                <h2>{s.h2}</h2>
                {s.ps.map((p) => <p>{p}</p>)}
              </>
            ))}

            <h2>{card.name} 자주 묻는 질문</h2>
            {card.faqs.map((f) => (
              <div class="faq-item">
                <button class="faq-q">{f.q}<span class="ic"><i class="fas fa-plus"></i></span></button>
                <div class="faq-a"><div class="faq-a__inner">{f.a}</div></div>
              </div>
            ))}

            <div class="cta-banner" style="margin-top:50px">
              <h2 style="font-size:26px">{card.name} 상담 예약</h2>
              <p>진료 후 예상 기간과 비용을 치료 계획표로 먼저 안내해 드립니다.</p>
              <div class="hero__actions">
                <a href={`/reservation${t ? `?t=${encodeURIComponent(t.shortName)}` : ''}`} class="btn btn-light"><i class="fas fa-calendar-check"></i> 예약</a>
                <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
              </div>
            </div>
            <p style="font-size:13px;color:var(--ink-4);margin-top:20px">※ 치료 반응과 경과에는 개인차가 있으며, 정확한 상태는 한의사 진료를 통해 확인하시기 바랍니다. · 최종 수정 <time datetime={OSAN_CARD_DATE}>{OSAN_CARD_DATE}</time></p>
          </div>

          <aside class="sidebar">
            {t && (
              <div class="side-card">
                <h2 class="side-card__title">{t.shortName} 진료</h2>
                <a href={`/treatments/${t.slug}`} class="side-link">{t.name} 자세히 보기<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              </div>
            )}
            {docs.length > 0 && (
              <div class="side-card">
                <h2 class="side-card__title">주로 보는 원장</h2>
                {docs.map((d) => (
                  <a href={`/doctors/${d.slug}`} class="side-link">{d.name} {d.title}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
                ))}
              </div>
            )}
            <div class="side-card">
              <h2 class="side-card__title">오산 한의원 안내</h2>
              <a href="/" class="side-link">정원한의원 홈 — 진료시간·의료진<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              <a href="/directions" class="side-link">오시는 길·주차<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              <a href="/pricing" class="side-link">비용 안내<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
            </div>
          </aside>
        </div>
      </section>
      <OsanCardGrid id="osan-siblings" eyebrow="OSAN · 진료별 안내" heading={<>오산 정원한의원의 <span class="accent">다른 진료</span></>} sub="진료별로 오산에서 다니실 때의 기준과 일정을 정리했습니다." exclude={card.path} />
    </Page>
  )
}
