import type { FC } from 'hono/jsx'
import { Page } from '../components/Layout'
import { CLINIC, CORE_VALUES } from '../data/clinic'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { organizationSchema, speakableSchema, webSiteSchema } from '../lib/schema'
import { HeroBranch, GardenDivider, FloatingLeaves } from '../components/Garden'

export interface HeroPopupData {
  id: number
  title: string
  body: string
  image?: string
  link_url?: string
  category?: string
}

export const HomePage: FC<{ popup?: HeroPopupData | null }> = ({ popup }) => {
  const ceo = DOCTORS[0]
  return (
    <Page
      title="오산 한의원 | 정원한의원 오산 — 비만·체질한약·교통사고 후유증"
      description="오산 한의원 정원한의원 — 한방내과 전문의 진료로 비만 다이어트·체질 맞춤 한약·교통사고 후유증을 진료합니다. 이해되는 한방 진료."
      keywords="오산 한의원, 오산 다이어트 한의원, 오산 교통사고 한의원, 체질 한약, 오산 한방내과, 동탄 한의원, 평택 한의원"
      path="/"
      jsonLd={[organizationSchema(), webSiteSchema(), speakableSchema(['.hero__title', '.hero__desc'])]}
    >
      {/* ===== 히어로 — 庭園 그린 아카이브 표지 ===== */}
      <section class="hero" id="hero">
        <span class="hero__hanja" aria-hidden="true" data-parallax="0.1">庭園</span>
        <HeroBranch />
        <FloatingLeaves />
        <div class="wrap-wide">
          <div class="hero__grid">
            <div class="hero__inner">
              <span class="hero__badge" data-hero="1">
                <i class="fas fa-stethoscope"></i> 한방내과 전문의 진료 · 오산 성호대로
              </span>
              <h1 class="hero__title">
                <span class="line"><span>"거기 맞아요,</span></span>
                <span class="line"><span>어떻게 아셨어요?"</span></span>
                <span class="line"><span><em class="stamp accent">보고, 짚어보고, 설명하는 한의원</em></span></span>
              </h1>
              <p class="hero__desc" data-hero="3">
                아픈 곳을 눈으로 보고 손으로 짚어 확인하고, 이해되는 말로 설명합니다.
                막연한 불안 대신 분명한 그림을 먼저 그려 드립니다.
              </p>
              <div class="hero__chips" data-hero="3" aria-label="핵심 진료">
                {CORE_TREATMENTS.map((t) => (
                  <a href={`/treatments/${t.slug}`} class="hero__chip">
                    <i class={`fas ${t.icon}`}></i>
                    <span>{t.shortName}</span>
                  </a>
                ))}
              </div>
              <div class="hero__actions" data-hero="4">
                <a href="/reservation" class="btn btn-ink btn-lg" data-magnetic><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
                <a href="/sasang-test" class="btn btn-outline btn-lg" data-magnetic><i class="fas fa-feather-pointed"></i> 내 체질 알아보기</a>
              </div>
            </div>

            <div class="hero__visual" data-hero="1">
              <div class="hero__visual-label" aria-hidden="true"><span>本</span><span>草</span></div>
              <div class="hero__visual-frame">
                <img src="/static/img/herbs-macro.webp" alt="정원한의원에서 사용하는 한약재 — 인삼, 구기자, 진피, 감초, 대추, 계피" loading="eager" />
              </div>
              <div class="hero__visual-tag">
                <i class="fas fa-mortar-pestle"></i>
                <div>
                  <strong>체질 맞춤 한약</strong>
                  <span>처방의 이유까지 설명드립니다</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#intro" class="hero__scroll">
          SCROLL <i class="fas fa-chevron-down"></i>
        </a>
      </section>

      {/* ===== 약재명 마퀴 ===== */}
      <div class="marquee">
        <div class="marquee__track">
          <span>비만 다이어트</span><span>체질 맞춤 한약</span><span>교통사고 후유증</span><span>한방내과</span><span>오산 한의원</span><span>예측 가능한 진료</span>
          <span>비만 다이어트</span><span>체질 맞춤 한약</span><span>교통사고 후유증</span><span>한방내과</span><span>오산 한의원</span><span>예측 가능한 진료</span>
        </div>
      </div>

      {/* ===== 통계 (도감 색인) ===== */}
      <section class="section-tight" id="intro">
        <GardenDivider />
        <div class="wrap">
          <div class="stats" data-reveal>
            <div class="stat">
              <div class="stat__num"><span data-count="6"></span><span class="unit">년+</span></div>
              <div class="stat__label">오산에서 함께한 시간</div>
            </div>
            <div class="stat">
              <div class="stat__num"><span data-count="8"></span><span class="unit">인</span></div>
              <div class="stat__label">주력 분야별 한의사</div>
            </div>
            <div class="stat">
              <div class="stat__num"><span data-count="365"></span></div>
              <div class="stat__label">평일 야간·주말 진료</div>
            </div>
            <div class="stat">
              <div class="stat__num"><span data-count="2"></span><span class="unit">시간</span></div>
              <div class="stat__label">주차 지원 (만차 시)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 철학 split — 진료 공간 ===== */}
      <section class="section bg-deep">
        <div class="wrap">
          <div class="split">
            <div class="split__media" data-reveal>
              <div class="split__media-frame">
                <img src="/static/img/real-treatment.webp" alt="정원한의원 오산 진료실 — 따뜻한 우드톤과 자연광이 드는 진료 공간" width="1200" height="798" loading="lazy" decoding="async" />
              </div>
              <span class="split__media-badge"><i class="fas fa-spa"></i> 정원한의원 진료 공간</span>
            </div>
            <div class="split__col" data-reveal data-reveal-delay="1">
              <span class="eyebrow">왜 정원한의원인가</span>
              <h2>불안·불편·불신을 줄이면<br /><span class="accent serif">치료에 집중</span>할 수 있습니다</h2>
              <p>
                "한의학은 어렵다, 비용과 기간을 예측하기 어렵다." 많은 분들이 한의원에서 느끼는
                불편입니다. 정원한의원은 쉬운 언어와 이미지로 설명하고, 치료 시간·비용·전체 기간을
                미리 안내합니다. 이해하고 동의한 치료를 함께 만들어 갑니다.
              </p>
              <ul>
                <li>초진 당일, 치료 기간과 과정을 담은 치료 계획표 작성</li>
                <li>한약 조제 시 실제 약재 사진을 찍어 전송</li>
                <li>검사·상담료 사전 고지, 한방내과 전문의 기반 체질 맞춤 처방</li>
              </ul>
              <a href="/mission" class="btn-text">병원 미션 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 대표원장 인터뷰 — 홍보 영상 ===== */}
      <section class="section bg-deep promo-video-section">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center eyebrow--gold">院長 INTERVIEW · 映像</span>
            <h2 style="color:var(--ink)">정원한의원이 그리는 <span class="accent serif">'정원'</span> 이야기</h2>
            <p style="color:var(--ink-2)">{ceo.name} {ceo.title}이 직접 전하는 정원한의원의 진료 철학을 영상으로 만나보세요.</p>
          </div>
          <div class="promo-video" data-reveal>
            <video
              class="promo-video__el"
              autoplay
              muted
              loop
              playsinline
              controls
              preload="metadata"
              poster="/static/img/clinic-hero-poster.webp"
            >
              <source src="/static/img/clinic-promo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ===== 핵심 진료 TOP3 — 도감 항목 ===== */}
      <section class="section">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center">CORE TREATMENTS · 主治</span>
            <h2>정원한의원이 집중하는 <span class="accent">세 가지</span></h2>
            <p>한방내과 전문의 진료를 토대로, 오산에서 가장 많이 찾으시는 세 가지 진료에 집중합니다.</p>
          </div>
          <div class="tx-grid">
            {CORE_TREATMENTS.map((t, i) => (
              <a class="tx-card" href={`/treatments/${t.slug}`} data-reveal data-reveal-delay={String(i + 1)}>
                <span class="tx-card__no">第 {['一', '二', '三'][i] || i + 1} 方</span>
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

      {/* ===== 핵심 가치 — 의서 조항 ===== */}
      <section class="section bg-deep">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center eyebrow--gold">OUR VALUE · 三約</span>
            <h2>정원한의원이 지키는 <span class="accent serif">세 가지 약속</span></h2>
          </div>
          <div class="value-grid" data-reveal>
            {CORE_VALUES.map((v, i) => (
              <div class="value-card">
                <div class="value-card__num">0{i + 1}</div>
                <div class="value-card__icon"><i class={`fas ${v.icon}`}></i></div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 대표원장 — 인장 포트레이트 ===== */}
      <section class="section bg-soft">
        <div class="wrap">
          <div class="split rev">
            <div class="split__col" data-reveal>
              <span class="eyebrow">대표원장 · 院長</span>
              <h2>{ceo.name} <span style="font-family:var(--sans);font-size:0.42em;color:var(--ink-3);font-weight:600">{ceo.title}</span></h2>
              <p style="font-size:15px;color:var(--vermilion);font-weight:700;margin:6px 0 18px">{ceo.specialty}</p>
              <p>{ceo.intro}</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin:24px 0 4px">
                {ceo.memberships.map((m) => (
                  <span class="chip">{m}</span>
                ))}
              </div>
              <div style="margin-top:26px;display:flex;gap:22px;flex-wrap:wrap">
                <a href={`/doctors/${ceo.slug}`} class="btn-text">대표원장 프로필 <i class="fas fa-arrow-right"></i></a>
                <a href="/doctors" class="btn-text">의료진 8인 전체 보기 <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            <div class="doc-portrait doc-portrait--photo" data-reveal data-reveal-delay="1">
              <img
                class="doc-portrait__img"
                src={ceo.photo}
                alt={`정원한의원 ${ceo.title} ${ceo.name}`}
                width="640"
                height="800"
                loading="lazy"
                decoding="async"
              />
              <div class="doc-portrait__seal">{ceo.name.charAt(0)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 촉진·압진 — 정원의 진료법 ===== */}
      <section class="section">
        <GardenDivider />
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center">觸診 · 壓診</span>
            <h2>눈으로 보고, <span class="accent serif">손으로 확인</span>하는 진료</h2>
            <p>멀리서도 정원한의원을 찾아오시는 이유입니다.</p>
          </div>
          <div class="value-grid" data-reveal>
            <div class="value-card">
              <div class="value-card__icon"><i class="fas fa-hand-dots"></i></div>
              <h3>아픈 곳을 직접 찾습니다</h3>
              <p>
                영상 결과지로만 판단하지 않고, 불편한 곳을 눈으로 보고 손으로 눌러 확인하는
                촉진·압진을 진료의 기본으로 삼습니다. 막연하게 아프던 부위 중 가장 문제되는
                지점을 환자분 스스로 느끼실 수 있습니다.
              </p>
            </div>
            <div class="value-card">
              <div class="value-card__icon"><i class="fas fa-user-tag"></i></div>
              <h3>직업과 생활까지 봅니다</h3>
              <p>
                같은 어깨 통증이라도 근무 환경과 자세 습관에 따라 원인이 다릅니다. 직업·생활
                습관까지 함께 살펴 구조적 원인을 찾기에, 미처 말씀하지 않으신 불편까지 함께
                좋아지는 경우가 있습니다.
              </p>
            </div>
            <div class="value-card">
              <div class="value-card__icon"><i class="fas fa-comment-medical"></i></div>
              <h3>알아듣게 설명합니다</h3>
              <p>
                여기저기서 들은 복잡한 설명들을 환자분 상태에 맞게 총정리해, 간결하고
                이해되는 언어로 전해 드립니다. "이제 무슨 말인지 알겠어요"라는 순간을
                만드는 것이 좋은 진료의 시작이라 믿습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 진료 여정 — 환자 경험 설계 ===== */}
      <section class="section bg-deep journey-section">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center eyebrow--gold">PATIENT JOURNEY · 診療 旅程</span>
            <h2>처음 오신 순간부터 <span class="accent serif">치료 후까지</span></h2>
            <p>정원한의원은 진료의 모든 단계를 미리 설계합니다. 지금 어느 단계에 계신지 알 수 있도록, 가는 길을 먼저 안내해 드립니다.</p>
          </div>
          <ol class="journey" data-reveal>
            {[
              { no: '01', icon: 'fa-magnifying-glass', han: '認', title: '인지·문의', desc: '전화·카카오톡·온라인으로 편하게 문의하세요. 첫 질문부터 정성껏 답해 드립니다.' },
              { no: '02', icon: 'fa-comments', han: '相', title: '상담·접수', desc: '증상과 생활 습관, 불편한 점을 충분히 듣습니다. 서두르지 않습니다.' },
              { no: '03', icon: 'fa-stethoscope', han: '診', title: '진단·진료', desc: '촉진·압진과 체질 분석으로 원인을 함께 확인합니다. 알아듣게 설명해 드립니다.' },
              { no: '04', icon: 'fa-mortar-pestle', han: '療', title: '치료·관리', desc: '상태에 맞는 치료 계획을 세우고, 진행 상황을 그때그때 공유합니다.' },
              { no: '05', icon: 'fa-heart-pulse', han: '養', title: '사후관리', desc: '치료가 끝난 뒤에도 생활 관리와 재발 예방을 함께 챙깁니다. 효과는 개인에 따라 다를 수 있습니다.' },
            ].map((s, i) => (
              <li class="journey__step" data-reveal data-reveal-delay={String((i % 3) + 1)}>
                <div class="journey__han" aria-hidden="true">{s.han}</div>
                <div class="journey__no">{s.no}</div>
                <div class="journey__icon"><i class={`fas ${s.icon}`}></i></div>
                <h3 class="journey__title">{s.title}</h3>
                <p class="journey__desc">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div class="journey__foot" data-reveal>
            <p>각 단계마다 환자분이 느끼는 불안을 줄이는 것 — 그것이 정원한의원이 생각하는 좋은 진료입니다.</p>
            <a href="/reservation" class="btn btn-gold" data-magnetic><i class="fas fa-calendar-check"></i> 첫 단계 시작하기</a>
          </div>
        </div>
      </section>

      {/* ===== 진료 공간 — 와이드 배너 ===== */}
      <section class="section interior-band" data-reveal>
        <figure class="interior-banner">
          <img
            src="/static/img/real-signwall.webp"
            alt="정원한의원 오산 — 365일 건강해지는 공간, 브랜드 사인월"
            width="1600"
            height="1065"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="interior-banner__cap">
            <span class="eyebrow">진료 공간 · 空間</span>
            <h2>편안함이 곧 <span class="accent">치료의 시작</span></h2>
            <p>자연광이 드는 따뜻한 공간에서, 한 분 한 분 충분한 시간을 들여 진료합니다.</p>
          </figcaption>
        </figure>
      </section>

      {/* ===== 실제 진료 공간 — 사진 갤러리 ===== */}
      <section class="section facility">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center">OUR SPACE · 空間 案內</span>
            <h2>오산 정원한의원, <span class="accent serif">실제 공간</span>을 미리 둘러보세요</h2>
            <p>광고용 연출이 아닌 실제 진료 공간 사진입니다. 공간의 분위기는 직접 방문 시 느껴보실 수 있습니다.</p>
          </div>
          <div class="facility-grid" data-reveal>
            <figure class="facility-card facility-card--wide">
              <img src="/static/img/real-corridor.webp" alt="정원한의원 오산 — 갈대 조경이 어우러진 복도" width="1400" height="931" loading="lazy" decoding="async" />
              <figcaption>복도 · 조경 공간</figcaption>
            </figure>
            <figure class="facility-card">
              <img src="/static/img/real-reception.webp" alt="정원한의원 오산 — 접수·안내 데스크" width="1400" height="931" loading="lazy" decoding="async" />
              <figcaption>접수 · 안내 데스크</figcaption>
            </figure>
            <figure class="facility-card">
              <img src="/static/img/real-consult.webp" alt="정원한의원 오산 — 한약·건강식품 안내 진열" width="1200" height="799" loading="lazy" decoding="async" />
              <figcaption>한약 · 건강식품 안내</figcaption>
            </figure>
            <figure class="facility-card">
              <img src="/static/img/real-rooms.webp" alt="정원한의원 오산 — 1인 진료 베드 공간" width="1200" height="798" loading="lazy" decoding="async" />
              <figcaption>1인 진료실</figcaption>
            </figure>
            <figure class="facility-card">
              <img src="/static/img/real-therapy.webp" alt="정원한의원 오산 — 물리·다이어트 치료 장비실" width="1400" height="931" loading="lazy" decoding="async" />
              <figcaption>치료 장비실</figcaption>
            </figure>
            <figure class="facility-card facility-card--wide">
              <img src="/static/img/real-herbs-display.webp" alt="정원한의원 오산 — 자연 조경이 어우러진 정원 공간" width="1200" height="799" loading="lazy" decoding="async" />
              <figcaption>자연 조경 · 정원 공간</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== 전체 진료 ===== */}
      <section class="section bg-deep">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow eyebrow--center">ALL TREATMENTS · 全科</span>
            <h2>온 가족의 건강을 <span class="accent">한 곳에서</span></h2>
            <p>내과·부인과·소아과·피부과 등 다양한 한방 진료로 가족 단위 진료가 가능합니다.</p>
          </div>
          <div class="tx-mini-grid">
            {GENERAL_TREATMENTS.map((t, i) => (
              <a class="tx-mini" href={`/treatments/${t.slug}`} data-reveal data-reveal-delay={String((i % 4) + 1)}>
                <i class={`fas ${t.icon}`}></i>
                <strong>{t.shortName}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 내 체질 알아보기 유도 ===== */}
      <section class="section">
        <GardenDivider />
        <div class="wrap">
          <div class="cta-banner" data-reveal>
            <span class="eyebrow eyebrow--paper">SELF-DIAGNOSIS</span>
            <h2>내 체질은 <span class="serif" style="color:var(--gold-2)">무엇일까?</span></h2>
            <p>8개의 질문으로 알아보는 나의 사상체질. 체질에 맞는 건강 관리의 첫걸음을 시작하세요.</p>
            <div class="hero__actions">
              <a href="/sasang-test" class="btn btn-paper btn-lg" data-magnetic><i class="fas fa-feather-pointed"></i> 내 체질 알아보기</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 최종 CTA ===== */}
      <section class="section bg-deep">
        <div class="wrap">
          <div class="cta-banner" data-reveal>
            <span class="eyebrow eyebrow--paper">VISIT US · 來院</span>
            <h2>오늘, <span class="serif" style="color:var(--gold-2)">분명한 진료</span>를 시작하세요</h2>
            <p>오산 성호대로 농협중앙회 앞. 전용주차장 완비. 평일 야간·주말 진료.</p>
            <div class="hero__actions">
              <a href="/reservation" class="btn btn-paper"><i class="fas fa-calendar-check"></i> 진료 예약</a>
              <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-paper"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 히어로 공지 팝업 (관리자에서 토글) ===== */}
      {popup && (
        <>
          <div class="hero-popup" id="hero-popup" data-popup-id={String(popup.id)} role="dialog" aria-modal="true" aria-labelledby="hero-popup-title" hidden>
            <div class="hero-popup__backdrop" data-popup-close></div>
            <div class="hero-popup__card">
              <button class="hero-popup__x" type="button" data-popup-close aria-label="닫기"><i class="fas fa-xmark"></i></button>
              {popup.category && popup.category !== 'notice' && (
                <span class={`hero-popup__tag hero-popup__tag--${popup.category}`}>
                  {popup.category === 'event' ? '이벤트' : popup.category === 'holiday' ? '휴진 안내' : '공지'}
                </span>
              )}
              {popup.image && (
                <a href={popup.link_url || `/notice/${popup.id}`} class="hero-popup__media">
                  <img src={`/api/notice-image/${popup.id}`} alt={popup.title} loading="eager" />
                </a>
              )}
              <div class="hero-popup__body">
                <h2 class="hero-popup__title" id="hero-popup-title">{popup.title}</h2>
                <p class="hero-popup__text">{(popup.body || '').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/\\n|\r?\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140)}</p>
                <div class="hero-popup__actions">
                  <a href={popup.link_url || `/notice/${popup.id}`} class="btn btn-primary"><i class="fas fa-arrow-right"></i> 자세히 보기</a>
                </div>
              </div>
              <div class="hero-popup__foot">
                <label class="hero-popup__dismiss">
                  <input type="checkbox" id="hero-popup-dismiss" /> 오늘 하루 보지 않기
                </label>
                <button type="button" class="hero-popup__close-link" data-popup-close>닫기</button>
              </div>
            </div>
          </div>
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              var el = document.getElementById('hero-popup');
              if(!el) return;
              var id = el.getAttribute('data-popup-id');
              var key = 'jw_popup_dismiss_' + id;
              try {
                var until = localStorage.getItem(key);
                if (until && Date.now() < parseInt(until,10)) return; // 오늘 그만보기 유효
              } catch(e){}
              // 표시 (살짝 지연 — 히어로 먼저 인지)
              setTimeout(function(){ el.hidden = false; document.body.style.overflow='hidden'; el.classList.add('show'); }, 700);
              function close(){
                var cb = document.getElementById('hero-popup-dismiss');
                if (cb && cb.checked) { try { localStorage.setItem(key, String(Date.now() + 24*60*60*1000)); } catch(e){} }
                el.classList.remove('show'); document.body.style.overflow='';
                setTimeout(function(){ el.hidden = true; }, 250);
              }
              el.querySelectorAll('[data-popup-close]').forEach(function(b){ b.addEventListener('click', close); });
              document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !el.hidden) close(); });
            })();
          ` }}></script>
        </>
      )}
    </Page>
  )
}
