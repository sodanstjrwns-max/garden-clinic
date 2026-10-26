// ============================================================
// 정원 소개 > 둘러보기 / 치료 이야기 > 이렇게 치료합니다 · 정원의 치료 도구 (2026-10-26 원장 요청)
// ============================================================
import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC } from '../data/clinic'
import { HWT_SITUATIONS, HWT_CLOSING } from '../data/how-we-treat'
import { TOOLS, getTool } from '../data/tools'
import type { ToolPage } from '../data/tools'
import { breadcrumbSchema, faqPageSchema } from '../lib/schema'

const REVIEWED = '2026-10-26'

/** 제목을 쉼표·문장 단위 덩어리로 묶어 의미 중간에서 줄이 갈리지 않게 한다(수동 <br> 대신). */
export const Phr: FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(?<=[,.?!])\s+/).filter(Boolean)
  const merged: string[] = []
  for (const p of parts) {
    if (merged.length && merged[merged.length - 1].replace(/\s/g, '').length < 6) merged[merged.length - 1] += ' ' + p
    else merged.push(p)
  }
  return (
    <>
      {merged.map((m, i) => (
        <>
          {i > 0 ? ' ' : ''}
          <span class="phr">{m}</span>
        </>
      ))}
    </>
  )
}

// ============================================================
// 둘러보기 (/tour)
// ============================================================
const TOUR_PHOTOS: { src: string; alt: string; cap: string; w: number; h: number; wide?: boolean; tall?: boolean }[] = [
  { src: '/static/img/real-corridor.webp', alt: '정원한의원 오산 — 갈대 조경이 어우러진 복도', cap: '복도 · 조경 공간', w: 1400, h: 931, wide: true },
  { src: '/static/img/tour/exterior-street.webp', alt: '정원한의원 오산 건물 외관 — 성호대로변 1·2층, 정원한의원 간판과 365일 진료 현판', cap: '건물 외관 · 성호대로 74', w: 1088, h: 1600 },
  { src: '/static/img/tour/exterior-front.webp', alt: '정원한의원 1층 입구 — 유리문 너머로 보이는 접수 공간', cap: '1층 입구', w: 452, h: 452 },
  { src: '/static/img/tour/reception-corridor.webp', alt: '정원한의원 복도 — 접수·수납 안내 표지와 대기 의자', cap: '복도 · 접수/수납 안내', w: 1556, h: 1600 },
  { src: '/static/img/real-reception.webp', alt: '정원한의원 오산 — 접수·안내 데스크', cap: '접수 · 안내 데스크', w: 1400, h: 931 },
  { src: '/static/img/tour/herb-corridor.webp', alt: '정원한의원 약재 진열 복도 — 유리 진열장 속 한약재와 신발장', cap: '약재 진열 복도', w: 1600, h: 1067 },
  { src: '/static/img/tour/herb-safety-notice.webp', alt: '한약 품질 안전성 모니터링 결과 안내문 — 중금속·농약·곰팡이독소·미생물 불검출 표기', cap: '한약 품질 안전성 모니터링 안내', w: 1600, h: 1074 },
  { src: '/static/img/real-consult.webp', alt: '정원한의원 오산 — 한약·건강식품 안내 진열', cap: '한약 · 건강식품 안내', w: 1200, h: 799 },
  { src: '/static/img/tour/treatment-beds.webp', alt: '정원한의원 치료실 — 커튼으로 나뉜 번호별 치료 베드', cap: '치료실 · 베드', w: 1307, h: 1600 },
  { src: '/static/img/real-rooms.webp', alt: '정원한의원 오산 — 1인 진료 베드 공간', cap: '1인 진료실', w: 1200, h: 798 },
  { src: '/static/img/tour/body-composition.webp', alt: '정원한의원 검사실 — 체성분 측정 장비', cap: '검사실 · 체성분 측정', w: 976, h: 1600 },
  { src: '/static/img/real-therapy.webp', alt: '정원한의원 오산 — 물리·다이어트 치료 장비실', cap: '치료 장비실', w: 1400, h: 931 },
  { src: '/static/img/tour/certificates.webp', alt: '정원한의원 원내에 걸린 의료진 자격·수료 증서 액자', cap: '의료진 자격 · 수료 증서', w: 1600, h: 984 },
  { src: '/static/img/real-herbs-display.webp', alt: '정원한의원 오산 — 자연 조경이 어우러진 정원 공간', cap: '자연 조경 · 정원 공간', w: 1200, h: 799 },
]

export const TourPage: FC = () => (
  <Page
    title="둘러보기 — 오산 정원한의원 실제 진료 공간 사진"
    description="오산 정원한의원의 실제 공간을 미리 둘러보세요. 건물 외관과 입구, 접수, 약재 진열 복도, 치료실, 검사실까지 광고용 연출이 아닌 실제 사진입니다."
    path="/tour"
    ogImage="/static/img/tour/herb-corridor.webp"
    jsonLd={[
      breadcrumbSchema([{ name: '홈', url: '/' }, { name: '정원 소개', url: '/mission' }, { name: '둘러보기', url: '/tour' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: '정원한의원 오산 둘러보기',
        url: CLINIC.domain + '/tour',
        about: { '@id': CLINIC.domain + '/#organization' },
        image: TOUR_PHOTOS.map((p) => ({ '@type': 'ImageObject', contentUrl: CLINIC.domain + p.src, caption: p.cap, description: p.alt })),
      },
    ]}
  >
    <PageHero
      title="둘러보기"
      desc="광고용 연출이 아닌 실제 진료 공간 사진입니다. 공간의 분위기는 직접 방문 시 느껴보실 수 있습니다."
      breadcrumb={[{ label: '정원 소개', href: '/mission' }, { label: '둘러보기' }]}
    />
    <section class="section">
      <div class="wrap">
        <div class="sec-head center" data-reveal>
          <span class="eyebrow eyebrow--center">OUR SPACE · 空間 案內</span>
          <h2><Phr text="오산 정원한의원, 실제 공간을 미리 둘러보세요" /></h2>
        </div>
        <div class="tour-grid">
          {TOUR_PHOTOS.map((p, i) => (
            <figure class={`tour-card${p.wide ? ' tour-card--wide' : ''}${p.tall ? ' tour-card--tall' : ''}`} data-reveal data-reveal-delay={String((i % 3) + 1)}>
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
              <figcaption>{p.cap}</figcaption>
            </figure>
          ))}
        </div>
        <div class="tour-cta" data-reveal>
          <a href="/directions" class="btn btn-primary"><i class="fas fa-location-dot"></i> 오시는 길 · 주차 안내</a>
          <a href="/doctors" class="btn btn-outline"><i class="fas fa-user-doctor"></i> 의료진 소개</a>
        </div>
      </div>
    </section>
  </Page>
)

// ============================================================
// 이렇게 치료합니다 (/how-we-treat) — 상황을 눌러 확인하는 탭(모든 패널은 HTML 에 존재 → 크롤 가능)
// ============================================================
export const HowWeTreatPage: FC = () => (
  <Page
    title="이렇게 치료합니다 — 오산 정원한의원 상황별 진료 과정"
    description="처음 방문, 침, 추나, 한약, 교통사고 이후, 다이어트 한약과 시술까지. 정원한의원에서 상황별로 어떤 순서로 진찰하고 설명한 뒤 치료하는지 안내합니다."
    path="/how-we-treat"
    jsonLd={[
      breadcrumbSchema([{ name: '홈', url: '/' }, { name: '치료 이야기', url: '/how-we-treat' }, { name: '이렇게 치료합니다', url: '/how-we-treat' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: '이렇게 치료합니다 — 상황별 진료 과정',
        url: CLINIC.domain + '/how-we-treat',
        lastReviewed: REVIEWED,
        about: { '@id': CLINIC.domain + '/#organization' },
        mainEntity: {
          '@type': 'ItemList',
          name: '정원한의원 상황별 진료 과정',
          itemListElement: HWT_SITUATIONS.map((s) => ({
            '@type': 'ListItem',
            position: s.no,
            name: s.title,
            url: `${CLINIC.domain}/how-we-treat#${s.id}`,
            description: s.steps.join(' → '),
          })),
        },
      },
    ]}
  >
    <PageHero
      title="이렇게 치료합니다"
      desc="지금 상황을 눌러 확인해 보세요. 진찰부터 설명, 치료, 이후 경과 확인까지의 순서를 안내합니다."
      breadcrumb={[{ label: '치료 이야기', href: '/how-we-treat' }, { label: '이렇게 치료합니다' }]}
    />
    <section class="section hwt">
      <div class="wrap">
        <div class="hwt-tabs" role="tablist" aria-label="상황 선택">
          {HWT_SITUATIONS.map((s, i) => (
            <a
              href={`#${s.id}`}
              class={`hwt-tab${i === 0 ? ' is-active' : ''}`}
              role="tab"
              id={`tab-${s.id}`}
              aria-controls={s.id}
              aria-selected={i === 0 ? 'true' : 'false'}
              data-hwt={s.id}
            >
              <span class="hwt-tab__no">{String(s.no).padStart(2, '0')}</span>
              <i class={`fas ${s.icon}`} aria-hidden="true"></i>
              <span class="hwt-tab__label">{s.title}</span>
            </a>
          ))}
        </div>

        <div class="hwt-panels">
          {HWT_SITUATIONS.map((s, i) => (
            <section class={`hwt-panel${i === 0 ? ' is-active' : ''}`} id={s.id} role="tabpanel" aria-labelledby={`tab-${s.id}`}>
              <div class="hwt-panel__head">
                <span class="hwt-panel__no">{s.no}</span>
                <h2><Phr text={s.title} /></h2>
              </div>
              <ol class="hwt-steps" aria-label={`${s.title} 진행 순서`}>
                {s.steps.map((st, j) => (
                  <li><span class="hwt-steps__n">{j + 1}</span><span class="hwt-steps__t">{st}</span></li>
                ))}
              </ol>
              {s.photos.length > 0 && (
                <div class="hwt-photos">
                  {s.photos.map((p) => (
                    <img src={p.src} alt={p.alt} width={p.width || 1200} height={p.height || 800} loading="lazy" decoding="async" />
                  ))}
                </div>
              )}
              <div class="hwt-body">
                {s.blocks.map((b) => (
                  <div class="hwt-block">
                    {b.heading && <h3>{b.heading}</h3>}
                    {b.paras.map((p) => <p>{p}</p>)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div class="hwt-closing" data-reveal>
          <h2><Phr text={HWT_CLOSING.heading} /></h2>
          {HWT_CLOSING.paras.map((p) => <p>{p}</p>)}
          <div class="hwt-closing__actions">
            <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
            <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
            <a href="/treatment-tools" class="btn btn-outline"><i class="fas fa-toolbox"></i> 정원의 치료 도구</a>
          </div>
        </div>
      </div>
    </section>
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var tabs=[].slice.call(document.querySelectorAll('[data-hwt]'));var panels=[].slice.call(document.querySelectorAll('.hwt-panel'));if(!tabs.length)return;document.documentElement.classList.add('hwt-js');function show(id,scroll){var ok=false;tabs.forEach(function(t){var on=t.getAttribute('data-hwt')===id;t.classList.toggle('is-active',on);t.setAttribute('aria-selected',on?'true':'false');if(on)ok=true;});if(!ok)return;panels.forEach(function(p){p.classList.toggle('is-active',p.id===id);});if(scroll){var el=document.getElementById(id);if(el){var y=el.getBoundingClientRect().top+window.pageYOffset-110;window.scrollTo({top:y,behavior:'smooth'});}}}tabs.forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();var id=t.getAttribute('data-hwt');show(id,window.innerWidth<769);if(history.replaceState)history.replaceState(null,'','#'+id);});});var h=(location.hash||'').slice(1);if(h)show(h,false);})();`,
      }}
    />
  </Page>
)

// ============================================================
// 정원의 치료 도구 — 허브 (/treatment-tools)
// ============================================================
export const ToolsHubPage: FC = () => (
  <Page
    title="정원의 치료 도구 — 침·도침·약침·매선·부항·뜸·추나·한약 | 오산 정원한의원"
    description="오산 정원한의원에서 쓰는 치료 도구 8가지를 쉬운 말로 설명합니다. 침, 도침, 약침, 매선, 부항, 뜸, 추나, 한약 — 어떤 치료인지, 받기 전 알려주셔야 할 것, 받은 날 지내는 법까지."
    path="/treatment-tools"
    jsonLd={[
      breadcrumbSchema([{ name: '홈', url: '/' }, { name: '치료 이야기', url: '/how-we-treat' }, { name: '정원의 치료 도구', url: '/treatment-tools' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '정원의 치료 도구',
        url: CLINIC.domain + '/treatment-tools',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${CLINIC.domain}/treatment-tools/${t.slug}` })),
        },
      },
    ]}
  >
    <PageHero
      title="정원의 치료 도구"
      desc="처음 받으시는 치료도 걱정 없이 받으실 수 있도록, 어떤 치료인지와 받기 전·후에 알아두실 점을 쉬운 말로 정리했습니다."
      breadcrumb={[{ label: '치료 이야기', href: '/how-we-treat' }, { label: '정원의 치료 도구' }]}
    />
    <section class="section">
      <div class="wrap">
        <div class="tool-grid">
          {TOOLS.map((t, i) => (
            <a class="tool-card" href={`/treatment-tools/${t.slug}`} data-reveal data-reveal-delay={String((i % 4) + 1)}>
              <span class="tool-card__no">{String(i + 1).padStart(2, '0')}</span>
              <span class="tool-card__icon"><i class={`fas ${t.icon}`}></i></span>
              <h2 class="tool-card__name">{t.name}</h2>
              <p class="tool-card__sum">{t.summary}</p>
              {t.parts.length > 1 && <p class="tool-card__parts">{t.parts.join(' · ')}</p>}
              <span class="tool-card__more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
            </a>
          ))}
        </div>
        <p class="tool-hub__note" data-reveal>
          치료 효과와 반응은 사람마다 다릅니다. 어떤 치료가 맞는지는 진찰 후 설명드리고, 동의하신 뒤 진행합니다.
          <a href="/how-we-treat"> 상황별 진료 과정 보기 <i class="fas fa-arrow-right"></i></a>
        </p>
      </div>
    </section>
  </Page>
)

// ============================================================
// 정원의 치료 도구 — 상세 (/treatment-tools/:slug)
// ============================================================
export const ToolDetailPage: FC<{ slug: string }> = ({ slug }) => {
  const t = getTool(slug) as ToolPage
  const idx = TOOLS.findIndex((x) => x.slug === slug)
  const prev = TOOLS[idx - 1]
  const next = TOOLS[idx + 1]
  const faqs = t.faqs
  return (
    <Page
      title={`${t.name} — 정원의 치료 도구 | 오산 정원한의원`}
      description={`${t.heroQ} ${t.summary} 받기 전 알려주셔야 할 것, 받은 날 지내는 법, 비용 안내까지 정리했습니다.`.slice(0, 155)}
      path={`/treatment-tools/${t.slug}`}
      jsonLd={[
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '치료 이야기', url: '/how-we-treat' },
          { name: '정원의 치료 도구', url: '/treatment-tools' },
          { name: t.name, url: `/treatment-tools/${t.slug}` },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          name: `${t.name} — 정원의 치료 도구`,
          url: `${CLINIC.domain}/treatment-tools/${t.slug}`,
          lastReviewed: REVIEWED,
          about: {
            '@type': 'MedicalTherapy',
            name: t.name,
            description: t.whatIs[0],
          },
          speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '#tool-answer'] },
          provider: { '@id': CLINIC.domain + '/#organization' },
        },
        faqPageSchema(faqs),
      ]}
    >
      <PageHero
        title={t.name}
        desc={t.summary}
        breadcrumb={[{ label: '치료 이야기', href: '/how-we-treat' }, { label: '정원의 치료 도구', href: '/treatment-tools' }, { label: t.name }]}
      />
      <section class="section tool-page">
        <div class="wrap detail-layout">
          <div>
            <article class="article tool-article">
              <h2 class="tool-q"><Phr text={t.heroQ} /></h2>
              <p class="answer" id="tool-answer">{t.lead}</p>

              {t.photos.length > 0 && (
                <div class="tool-photos">
                  {t.photos.map((p) => (
                    <img src={p.src} alt={p.alt} width={p.width || 1200} height={p.height || 800} loading="lazy" decoding="async" />
                  ))}
                </div>
              )}

              <h2>많이 하시는 걱정 세 가지</h2>
              <ol class="tool-worries">
                {t.worries.map((w, i) => (
                  <li>
                    <span class="tool-worries__n">{'①②③④'[i]}</span>
                    <div>
                      <h3>{w.q}</h3>
                      <p>{w.a}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h2><Phr text={t.whatIsHeading!} /></h2>
              {t.whatIs.map((p) => <p>{p}</p>)}

              {t.bodyHeading && t.body && !t.types && (
                <>
                  <h2><Phr text={t.bodyHeading!} /></h2>
                  <p>{t.body}</p>
                </>
              )}

              {t.types && (
                <>
                  {t.bodyHeading && t.body && (
                    <>
                      <h2><Phr text={t.bodyHeading!} /></h2>
                      <p>{t.body}</p>
                    </>
                  )}
                  <h2><Phr text={t.typesHeading!} /></h2>
                  <div class="tool-types">
                    {t.types.map((ty) => (
                      <div class="tool-type">
                        <h3>{ty.name}{ty.alias && <small>({ty.alias})</small>}</h3>
                        <p>{ty.text}</p>
                      </div>
                    ))}
                  </div>
                  {t.typesAfter && <p>{t.typesAfter}</p>}
                </>
              )}

              <div class="tool-two">
                <div class="tool-box">
                  <h2><Phr text={t.whoHeading!} /></h2>
                  <ul>{t.who.map((x) => <li>{x}</li>)}</ul>
                </div>
                <div class="tool-box tool-box--warn">
                  <h2><Phr text={t.tellHeading!} /></h2>
                  <ul>{t.tell.map((x) => <li>{x}</li>)}</ul>
                  {t.tellNote && <p class="tool-box__note">{t.tellNote}</p>}
                </div>
              </div>

              <h2><Phr text={t.expectHeading!} /></h2>
              <div class="tool-table-wrap">
                <table class="tool-table">
                  <thead>
                    <tr><th scope="col">{t.expectCols[0]}</th><th scope="col">{t.expectCols[1]}</th></tr>
                  </thead>
                  <tbody>
                    {t.expect.map(([a, b]) => (
                      <tr><td>{a}</td><td>{b}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2><Phr text={t.stepsHeading!} /></h2>
              <ol class="tool-steps">
                {t.steps.map((st, i) => (
                  <li id={`step-${i + 1}`}>
                    <span class="tool-steps__n">{i + 1}</span>
                    <div><h3>{st.name}</h3><p>{st.text}</p></div>
                  </li>
                ))}
              </ol>
              {t.stepsNote && <p class="tool-callout"><i class="fas fa-circle-info"></i> {t.stepsNote}</p>}

              <h2><Phr text={t.afterHeading!} /></h2>
              <dl class="tool-after">
                {t.after.map((a) => (
                  <div><dt>{a.k}</dt><dd>{a.v}</dd></div>
                ))}
              </dl>

              {t.costHeading && t.cost && (
                <>
                  <h2><Phr text={t.costHeading!} /></h2>
                  <p>{t.cost}</p>
                </>
              )}

              <h2>진료실에서 자주 받는 질문</h2>
              <div class="tool-faq">
                {faqs.map((f) => (
                  <details>
                    <summary>Q. {f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>

              <p class="tool-reviewed">
                <i class="fas fa-user-doctor"></i> 정원한의원 의료진 작성 · 최종 검토 <time datetime={REVIEWED}>{REVIEWED}</time> ·
                치료 효과와 반응은 사람마다 다르며, 진찰 후 필요한 치료를 설명드립니다.
              </p>
            </article>

            <nav class="tool-pager" aria-label="다른 치료 도구">
              {prev ? <a href={`/treatment-tools/${prev.slug}`} class="tool-pager__prev"><i class="fas fa-arrow-left"></i> {prev.name}</a> : <span></span>}
              <a href="/treatment-tools" class="tool-pager__all">치료 도구 전체</a>
              {next ? <a href={`/treatment-tools/${next.slug}`} class="tool-pager__next">{next.name} <i class="fas fa-arrow-right"></i></a> : <span></span>}
            </nav>

            <div class="cta-banner" style="margin-top:48px">
              <h2 style="font-size:26px">{t.name} 치료가 궁금하신가요?</h2>
              <p>진찰 후 지금 상태에 맞는 치료와 비용·시간을 먼저 설명드립니다.</p>
              <div class="hero__actions">
                <a href="/reservation" class="btn btn-light"><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
                <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
              </div>
            </div>
          </div>

          <aside class="sidebar">
            <div class="side-card">
              <h2 class="side-card__title">함께 보면 좋은 페이지</h2>
              {t.related.map((r) => (
                <a href={r.href} class="side-link">{r.label}<i class="fas fa-chevron-right" style="font-size:11px;color:var(--ink-3)"></i></a>
              ))}
            </div>
            <div class="side-card">
              <h2 class="side-card__title">정원의 치료 도구</h2>
              {TOOLS.map((x) => (
                <a href={`/treatment-tools/${x.slug}`} class={`side-link${x.slug === t.slug ? ' is-current' : ''}`} aria-current={x.slug === t.slug ? 'page' : undefined}>
                  {x.name}<i class="fas fa-chevron-right" style="font-size:11px;color:var(--ink-3)"></i>
                </a>
              ))}
            </div>
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h2 class="side-card__title" style="color:var(--brand)">이렇게 치료합니다</h2>
              <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">처음 방문부터 치료 결정까지, 상황별 진료 순서를 확인해 보세요.</p>
              <a href="/how-we-treat" class="btn btn-ghost" style="width:100%;justify-content:center;font-size:14px">상황별 진료 과정</a>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}
