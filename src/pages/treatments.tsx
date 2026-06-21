import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { TREATMENTS, CORE_TREATMENTS, GENERAL_TREATMENTS, getTreatment } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { FAQ_CATEGORIES } from '../data/faq'
import { ENC_TERMS, autoLinkTerms } from '../data/encyclopedia'
import { AREAS, AREA_TREATMENTS } from '../data/areas'
import { medicalProcedureSchema, faqPageSchema, breadcrumbSchema, speakableSchema } from '../lib/schema'
import { CLINIC } from '../data/clinic'

// 진료별 hero 한자/핵심 포인트 매핑 (없으면 기본값)
const TX_HERO: Record<string, { hanja: string; points: string[] }> = {
  diet: { hanja: '減', points: ['체질 분석 기반 처방', '요요 줄이는 생활 코칭', '한방내과 전문의 진료'] },
  'custom-herbal': { hanja: '方', points: ['체질·증상 맞춤 처방', '실제 약재 사진 전송', '한방내과 전문의 진료'] },
  'car-accident': { hanja: '癒', points: ['자동차보험 적용 진료', 'X-ray 정상에도 통증 케어', '평일 야간·주말 진료'] },
  'spine-joint': { hanja: '骨', points: ['촉진·압진 통증 진료', '직업·생활습관 분석', '추나·침 복합 치료'] },
}
const TX_HERO_DEFAULT = { hanja: '醫', points: ['한방내과 전문의 진료', '예측 가능한 치료 계획', '평일 야간·주말 진료'] }

// ===== 진료 목록 페이지 =====
export const TreatmentListPage: FC = () => (
  <Page
    title="진료과목 안내 — 오산 정원한의원 한방진료"
    description="오산 정원한의원의 전체 진료과목. 비만 다이어트, 체질 맞춤 한약, 교통사고 후유증을 비롯한 한방내과·부인과·소아과·피부과 등 13개 진료를 안내합니다."
    path="/treatments"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '진료', url: '/treatments' }])}
  >
    <PageHero
      title="진료과목"
      desc="한방내과 전문의 진료를 바탕으로, 온 가족의 건강을 한 곳에서 돌봅니다."
      breadcrumb={[{ label: '진료' }]}
    />
    <section class="section">
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="eyebrow">CORE TREATMENTS</span>
          <h2>정원한의원이 집중하는 핵심 진료</h2>
        </div>
        <div class="tx-grid">
          {CORE_TREATMENTS.map((t, i) => (
            <a class="tx-card core" href={`/treatments/${t.slug}`} data-reveal data-reveal-delay={String(i + 1)}>
              <div class="tx-card__icon"><i class={`fas ${t.icon}`}></i></div>
              <div class="tx-card__tag">{t.tagline}</div>
              <h3>{t.shortName}</h3>
              <p>{t.summary}</p>
              <span class="tx-card__more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
            </a>
          ))}
        </div>
      </div>
    </section>
    <section class="section bg-soft">
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="eyebrow">ALL TREATMENTS</span>
          <h2>전체 진료과목</h2>
        </div>
        <div class="tx-grid">
          {GENERAL_TREATMENTS.map((t, i) => (
            <a class="tx-card" href={`/treatments/${t.slug}`} data-reveal data-reveal-delay={String((i % 3) + 1)}>
              <div class="tx-card__icon"><i class={`fas ${t.icon}`}></i></div>
              <div class="tx-card__tag">{t.tagline}</div>
              <h3>{t.shortName}</h3>
              <p>{t.summary}</p>
              <span class="tx-card__more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  </Page>
)

// ===== 진료 상세 페이지 =====
export const TreatmentDetailPage: FC<{ slug: string }> = ({ slug }) => {
  const t = getTreatment(slug)
  if (!t) return <NotFoundInline />
  const doctors = t.doctors.map((d) => getDoctor(d)).filter(Boolean)
  const faqCat = FAQ_CATEGORIES.find((c) => c.slug === slug)
  // 관련 백과사전 용어 (related === slug)
  const relTerms = ENC_TERMS.filter((e) => e.related === slug).slice(0, 8)
  // 관련 다른 진료 (같은 카테고리 일부)
  const relTreatments = TREATMENTS.filter((x) => x.slug !== slug).slice(0, 5)

  const faqItems = faqCat ? faqCat.items : []

  return (
    <Page
      title={`${t.name} — 오산 정원한의원`}
      description={t.summary}
      path={`/treatments/${slug}`}
      ogType="article"
      bodyClass="has-dark-hero"
      jsonLd={[
        medicalProcedureSchema(t),
        faqItems.length ? faqPageSchema(faqItems) : null,
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '진료', url: '/treatments' },
          { name: t.shortName, url: `/treatments/${slug}` },
        ]),
        speakableSchema(['.article .answer']),
      ].filter(Boolean) as object[]}
    >
      <section class="tx-hero" data-reveal>
        <span class="tx-hero__hanja" aria-hidden="true">{(TX_HERO[slug] || TX_HERO_DEFAULT).hanja}</span>
        <div class="wrap">
          <nav class="tx-hero__crumb" aria-label="breadcrumb">
            <a href="/">홈</a><span aria-hidden="true">/</span>
            <a href="/treatments">진료</a><span aria-hidden="true">/</span>
            <span>{t.shortName}</span>
          </nav>
          <div class="tx-hero__inner">
            <div class="tx-hero__icon"><i class={`fas ${t.icon}`}></i></div>
            <h1 class="tx-hero__title">{t.name}</h1>
            <p class="tx-hero__tagline">{t.tagline}</p>
            <ul class="tx-hero__points">
              {(TX_HERO[slug] || TX_HERO_DEFAULT).points.map((p) => (
                <li><i class="fas fa-check"></i> {p}</li>
              ))}
            </ul>
            <div class="tx-hero__actions">
              <a href={`/reservation?t=${encodeURIComponent(t.shortName)}`} class="btn btn-gold" data-magnetic><i class="fas fa-calendar-check"></i> {t.shortName} 예약하기</a>
              <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light" data-magnetic><i class="fas fa-phone"></i> 전화 상담</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap detail-layout">
          {/* 본문 */}
          <div>
            <div class="article" data-reveal>
              <p style="font-size:19px;color:var(--ink);font-weight:600;line-height:1.7">{t.summary}</p>

              {t.sections.map((s) => (
                <>
                  <h2>{s.h2}</h2>
                  <div class="answer">{s.answer}</div>
                  {s.body && (
                    <p dangerouslySetInnerHTML={{ __html: autoLinkTerms(s.body) }}></p>
                  )}
                </>
              ))}

              {/* 진행 단계 */}
              {t.steps && (
                <>
                  <h2>치료는 이렇게 진행됩니다</h2>
                  <div class="steps">
                    {t.steps.map((st) => (
                      <div class="step">
                        <div class="step__no">{st.step}</div>
                        <h4>{st.title}</h4>
                        <p>{st.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 요약 박스 */}
              {t.summaryBox && (
                <div class="summary-box">
                  <h3><i class="fas fa-circle-check" style="margin-right:10px"></i>{t.summaryBox.title}</h3>
                  <ul>
                    {t.summaryBox.items.map((it) => <li>{it}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ */}
            {faqItems.length > 0 && (
              <div style="margin-top:60px" data-reveal>
                <h2 style="font-size:28px;color:var(--brand);margin-bottom:24px">{t.shortName} 자주 묻는 질문</h2>
                <div>
                  {faqItems.map((f) => (
                    <div class="faq-item">
                      <button class="faq-q">{f.q}<span class="ic"><i class="fas fa-plus"></i></span></button>
                      <div class="faq-a"><div class="faq-a__inner">{f.a}</div></div>
                    </div>
                  ))}
                </div>
                <a href={`/faq#${slug}`} class="btn btn-ghost" style="margin-top:24px">{t.shortName} 전체 FAQ 보기 <i class="fas fa-arrow-right"></i></a>
              </div>
            )}

            {/* CTA */}
            <div class="cta-banner" style="margin-top:60px" data-reveal>
              <h2 style="font-size:28px">{t.shortName} 상담을 원하시나요?</h2>
              <p>진료를 통해 현재 상태를 확인하고, 예상 기간과 비용을 미리 안내해 드립니다.</p>
              <div class="hero__actions">
                <a href={`/reservation?t=${encodeURIComponent(t.shortName)}`} class="btn btn-light"><i class="fas fa-calendar-check"></i> {t.shortName} 예약하기</a>
                <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
              </div>
            </div>
          </div>

          {/* 사이드바 (인링크) */}
          <aside class="sidebar">
            {doctors.length > 0 && (
              <div class="side-card">
                <h4>담당 의료진</h4>
                {doctors.map((d) => (
                  <a href={`/doctors/${d!.slug}`} class="doc-mini">
                    <span class="doc-mini__av">
                      {d!.photo ? <img src={d!.photo} alt={`${d!.name} ${d!.title}`} /> : <i class="fas fa-user-doctor"></i>}
                    </span>
                    <span>
                      <strong style="display:block;font-size:15px">{d!.name} {d!.title}</strong>
                      <span style="font-size:12.5px;color:var(--ink-3)">{d!.specialty.split('/')[0]}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}

            <div class="side-card">
              <h4>다른 진료 보기</h4>
              {relTreatments.map((rt) => (
                <a href={`/treatments/${rt.slug}`} class="side-link">{rt.shortName}<i class="fas fa-chevron-right" style="font-size:11px;color:var(--ink-3)"></i></a>
              ))}
            </div>

            {relTerms.length > 0 && (
              <div class="side-card">
                <h4>관련 한방 용어</h4>
                {relTerms.map((e) => (
                  <a href={`/encyclopedia/${e.slug}`} class="side-link">{e.term} <span style="font-size:11px;color:var(--ink-3)">{e.hanja}</span></a>
                ))}
              </div>
            )}

            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h4 style="color:var(--brand)">비포/애프터</h4>
              <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">{t.shortName} 치료 사례를 확인해 보세요.</p>
              <a href={`/cases/gallery?cat=${slug}`} class="btn btn-ghost" style="width:100%;justify-content:center;font-size:14px">사례 보기</a>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}

const NotFoundInline: FC = () => (
  <Page title="페이지를 찾을 수 없습니다" description="요청하신 진료 정보를 찾을 수 없습니다." path="/treatments">
    <PageHero title="진료 정보를 찾을 수 없습니다" breadcrumb={[{ label: '진료', href: '/treatments' }]} />
    <section class="section"><div class="wrap text-center"><a href="/treatments" class="btn btn-primary">전체 진료 보기</a></div></section>
  </Page>
)
