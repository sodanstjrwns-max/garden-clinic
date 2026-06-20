import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC, CORE_VALUES } from '../data/clinic'
import { DOCTORS } from '../data/doctors'
import { breadcrumbSchema } from '../lib/schema'

// ===== 미션 (재구축: ms-* 클래스, 어떤 화면폭에서도 안 깨지는 중앙정렬 레이아웃) =====
export const MissionPage: FC = () => {
  const ceo = DOCTORS[0]
  const sambul = [
    {
      icon: 'fa-camera',
      tag: '불안',
      title: '불안을 줄이는 방법',
      desc: '한약 조제 시 실제 들어가는 약재 사진을 찍어 전송해 드립니다. 초진 당일에 치료 기간과 과정을 담은 치료 계획표를 작성하고, 원내 검사·상담료는 시행 전에 미리 고지합니다.',
    },
    {
      icon: 'fa-couch',
      tag: '불편',
      title: '불편을 줄이는 방법',
      desc: '후문과 바로 연결되는 주차장, 다음 치료 과정 미리 안내, 나가셔야 하는 시간 확인, 엎드려 받는 치료를 위해 10개 넘게 써보고 고른 가슴베개·다리베개, 바쁜 분을 위한 스피드진료까지 — 원내에서 나온 불편은 바로 개선합니다.',
    },
    {
      icon: 'fa-rotate',
      tag: '불신',
      title: '불신을 줄이는 방법',
      desc: '치료 과정에서 몸 상태가 예상과 달라 계획 수정이 필요하거나, 양방 치료가 우선 필요한 경우에는 최대한 빠르게 수정해 말씀드립니다. 그것이 환자분의 건강에 맞는 일이라 판단하기 때문입니다.',
    },
  ]
  return (
    <Page
      title="병원 미션 — 가고 싶은 한의원의 표준, 오산 정원한의원"
      description="정원한의원 오산의 미션. 불안·불편·불신을 줄여 치료에 집중할 수 있는 한의원. 오산에서도 서울보다 더 질 높은 의료 서비스를 제공합니다."
      path="/mission"
      jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '병원미션', url: '/mission' }])}
    >
      {/* 1. 히어로 */}
      <section class="ms-hero">
        <div class="ms-hero__bg"></div>
        <div class="ms-hero__overlay"></div>
        <div class="ms-container ms-hero__inner" data-reveal>
          <span class="ms-badge"><i class="fas fa-quote-left"></i> 정원한의원의 약속</span>
          <h1 class="ms-hero__title">
            가고 싶은 한의원의<br />
            <span class="ms-accent">표준</span>이 되겠습니다
          </h1>
          <p class="ms-hero__desc">
            오산에서도 서울보다 더 질 높은 의료 서비스를. 제가 드릴 수 있는 진료 시간, 공간,
            의료 서비스 모두를 환자분이 가장 편안하게 진료받을 수 있는 조건으로 준비했습니다.
          </p>
        </div>
      </section>

      {/* 2. 시작 이유 */}
      <section class="ms-section ms-why">
        <div class="ms-container ms-narrow" data-reveal>
          <span class="ms-eyebrow">WHY WE BEGAN</span>
          <h2 class="ms-why__quote">
            “<span class="ms-accent">불안·불편·불신</span>을 줄이면<br />
            치료에 집중할 수 있습니다”
          </h2>
          <p class="ms-why__body">
            한의학은 어렵고, 비용과 기간을 예측하기 어렵다는 말을 자주 듣습니다. 정원한의원은 그
            불편을 줄이는 데서 출발했습니다. 환자분이 이해할 수 있는 쉬운 설명, 이미지로 보여 드리는
            설명, 그리고 치료 시간·비용·전체 기간에 대한 사전 안내. 막연함을 분명함으로 바꾸는 것이
            정원한의원이 생각하는 좋은 진료의 시작입니다.
          </p>
        </div>
      </section>

      {/* 3. 핵심 가치 */}
      <section class="ms-section ms-section--soft">
        <div class="ms-container">
          <div class="ms-head" data-reveal>
            <span class="ms-eyebrow">CORE VALUE</span>
            <h2 class="ms-head__title">세 가지 핵심 가치</h2>
          </div>
          <div class="ms-cards ms-cards--3">
            {CORE_VALUES.map((v, i) => (
              <article class="ms-card" data-reveal data-reveal-delay={String((i % 4) + 1)}>
                <span class="ms-card__num">0{i + 1}</span>
                <div class="ms-card__icon"><i class={`fas ${v.icon}`}></i></div>
                <h3 class="ms-card__title">{v.title}</h3>
                <p class="ms-card__desc">{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 3불 시스템 */}
      <section class="ms-section">
        <div class="ms-container">
          <div class="ms-head" data-reveal>
            <span class="ms-eyebrow">HOW WE DO IT</span>
            <h2 class="ms-head__title">말이 아니라, <span class="ms-accent">시스템으로</span> 줄입니다</h2>
            <p class="ms-head__sub">불안·불편·불신을 줄이기 위해 정원한의원이 실제로 운영하는 방식입니다.</p>
          </div>
          <div class="ms-cards ms-cards--3">
            {sambul.map((s, i) => (
              <article class="ms-card ms-card--plain" data-reveal data-reveal-delay={String((i % 4) + 1)}>
                <div class="ms-card__icon"><i class={`fas ${s.icon}`}></i></div>
                <span class="ms-card__tag">{s.tag}</span>
                <h3 class="ms-card__title">{s.title}</h3>
                <p class="ms-card__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 촉진·압진 */}
      <section class="ms-section ms-section--soft">
        <div class="ms-container">
          <div class="ms-feature">
            <div class="ms-feature__media" data-reveal>
              <img src="/static/img/real-treatment.webp" alt="정원한의원 오산 진료실 — 촉진·압진 진료 공간" width="1200" height="798" loading="lazy" decoding="async" />
            </div>
            <div class="ms-feature__text" data-reveal data-reveal-delay="1">
              <span class="ms-eyebrow">OUR STRENGTH</span>
              <h2 class="ms-feature__title">눈으로 보고,<br /><span class="ms-accent">손으로 확인합니다</span></h2>
              <p class="ms-feature__body">
                아픈 곳을 영상 결과지로만 판단하지 않습니다. 불편한 곳을 직접 보고, 손으로 눌러
                확인하는 촉진·압진을 진료의 기본으로 삼습니다. 막연하게 아프던 부위 중 가장
                문제되는 지점을 환자분 스스로도 정확히 느끼실 수 있습니다. 여기에 평소 생활
                습관과 직업, 근무 환경까지 함께 살펴 — 말씀하지 않으신 불편까지 찾아내는 것이
                정원한의원이 가장 자신 있는 부분입니다.
              </p>
              <a href="/doctors" class="ms-link">의료진 소개 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 대표원장 한마디 */}
      <section class="ms-section">
        <div class="ms-container">
          <div class="ms-feature ms-feature--rev">
            <div class="ms-feature__media ms-feature__media--portrait" data-reveal>
              <img src={ceo.photo} alt={`정원한의원 ${ceo.title} ${ceo.name}`} width="600" height="750" loading="lazy" decoding="async" />
            </div>
            <div class="ms-feature__text" data-reveal data-reveal-delay="1">
              <span class="ms-eyebrow">FROM THE DIRECTOR</span>
              <h2 class="ms-feature__title">{ceo.name} <span class="ms-feature__role">{ceo.title}</span></h2>
              <p class="ms-feature__specialty">{ceo.specialty}</p>
              <blockquote class="ms-quote">“{ceo.motto}”</blockquote>
              <a href="/doctors" class="ms-link">대표원장 자세히 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 시설 둘러보기 (실제 사진 갤러리) */}
      <section class="ms-section ms-section--soft">
        <div class="ms-container">
          <div class="ms-head" data-reveal>
            <span class="ms-eyebrow">OUR SPACE</span>
            <h2 class="ms-head__title">정원한의원을 둘러보세요</h2>
            <p class="ms-head__sub">환자분이 가장 편안하게 진료받을 수 있도록 공간 하나하나를 준비했습니다. 오산 정원한의원의 실제 모습입니다.</p>
          </div>
          <div class="ms-gallery">
            <figure class="ms-gallery__item ms-gallery__item--wide" data-reveal>
              <img src="/static/img/real-reception.webp" alt="정원한의원 오산 접수데스크와 대기 공간 — 은은한 간접조명과 화분이 어우러진 로비" width="1400" height="933" loading="lazy" decoding="async" />
              <figcaption>접수데스크 &amp; 대기 공간</figcaption>
            </figure>
            <figure class="ms-gallery__item" data-reveal data-reveal-delay="1">
              <img src="/static/img/real-corridor.webp" alt="정원한의원 오산 복도 — 갈대 조경이 놓인 진료 센터 입구" width="1400" height="931" loading="lazy" decoding="async" />
              <figcaption>갈대 조경이 있는 복도</figcaption>
            </figure>
            <figure class="ms-gallery__item" data-reveal data-reveal-delay="2">
              <img src="/static/img/real-rooms.webp" alt="정원한의원 오산 1인 진료 베드 공간 — 번호로 구분된 독립 진료 베드" width="1200" height="798" loading="lazy" decoding="async" />
              <figcaption>1인 진료 베드 공간</figcaption>
            </figure>
            <figure class="ms-gallery__item" data-reveal data-reveal-delay="3">
              <img src="/static/img/real-therapy.webp" alt="정원한의원 오산 물리치료실 — 안마의자와 수치료 베드, 안내 모니터" width="1400" height="931" loading="lazy" decoding="async" />
              <figcaption>물리치료실</figcaption>
            </figure>
            <figure class="ms-gallery__item" data-reveal data-reveal-delay="1">
              <img src="/static/img/real-herbs-display.webp" alt="정원한의원 오산 실내 조경 화단 — 식물과 조명이 어우러진 공간" width="1200" height="800" loading="lazy" decoding="async" />
              <figcaption>편안함을 더하는 실내 조경</figcaption>
            </figure>
            <figure class="ms-gallery__item ms-gallery__item--wide" data-reveal data-reveal-delay="2">
              <img src="/static/img/real-signwall.webp" alt="정원한의원 오산 사인월 — 365일 건강해지는 정원한의원" width="1200" height="800" loading="lazy" decoding="async" />
              <figcaption>365일 건강해지는 정원한의원</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section class="ms-section ms-cta-wrap">
        <div class="ms-container">
          <div class="ms-cta" data-reveal>
            <h2 class="ms-cta__title">정원한의원에서 시작하세요</h2>
            <p class="ms-cta__sub">분명한 진료, 이해되는 설명. 오산 성호대로에서 기다리겠습니다.</p>
            <div class="ms-cta__actions">
              <a href="/reservation" class="ms-btn ms-btn--gold"><i class="fas fa-calendar-check"></i> 진료 예약</a>
              <a href={`tel:${CLINIC.phoneRaw}`} class="ms-btn ms-btn--ghost"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}

// ===== 오시는 길 =====
export const DirectionsPage: FC = () => (
  <Page
    title="오시는 길 — 오산 정원한의원 (성호대로 74)"
    description="오산 정원한의원 오시는 길. 오산 농협중앙회 앞 건물 1층, 전용주차장 완비. 오산역 1번 출구 도보 5분. 만차 시 인근 공영주차장 2시간 지원."
    path="/directions"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '오시는 길', url: '/directions' }])}
  >
    <PageHero title="오시는 길" desc={CLINIC.address.full} breadcrumb={[{ label: '안내' }, { label: '오시는 길' }]} />
    <section class="section">
      <div class="wrap">
        {/* 지도 placeholder */}
        <div class="split__media placeholder" style="aspect-ratio:21/9;margin-bottom:50px" data-reveal>
          <div style="text-align:center"><i class="fas fa-map-location-dot"></i><p style="margin-top:14px;font-size:15px;font-weight:700;color:var(--ink)">{CLINIC.address.full}</p><p style="font-size:13px">오산 농협중앙회 정류장 앞 건물 1층</p></div>
        </div>

        <div class="value-grid">
          <div class="value-card" data-reveal>
            <div class="value-card__icon"><i class="fas fa-car"></i></div>
            <h3>자가용 / 주차</h3>
            <p>{CLINIC.directions.parking}</p>
          </div>
          <div class="value-card" data-reveal data-reveal-delay="1">
            <div class="value-card__icon"><i class="fas fa-bus"></i></div>
            <h3>버스</h3>
            <p>{CLINIC.directions.bus}</p>
          </div>
          <div class="value-card" data-reveal data-reveal-delay="2">
            <div class="value-card__icon"><i class="fas fa-train-subway"></i></div>
            <h3>지하철</h3>
            <p>{CLINIC.directions.subway}</p>
          </div>
        </div>

        {/* 진료시간 */}
        <div class="summary-box" style="margin-top:50px" data-reveal>
          <h3><i class="fas fa-clock" style="margin-right:10px"></i>진료시간</h3>
          <ul style="grid-template-columns:1fr">
            <li>{CLINIC.hours.weekday.label}: {CLINIC.hours.weekday.time}</li>
            <li>{CLINIC.hours.weekend.label}: {CLINIC.hours.weekend.time}</li>
            <li style="opacity:0.85">{CLINIC.hours.note}</li>
          </ul>
          <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-light" style="margin-top:24px"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
        </div>
      </div>
    </section>
  </Page>
)

// ===== 진료시간·비용 =====
export const PricingPage: FC = () => (
  <Page
    title="진료시간·비용 안내 — 오산 정원한의원"
    description="오산 정원한의원 진료시간 및 비용 안내. 비급여 진료비는 진료 후 투명하게 사전 안내합니다. 평일 야간·주말 진료, 카드 결제 가능."
    path="/pricing"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '진료시간·비용', url: '/pricing' }])}
  >
    <PageHero title="진료시간 · 비용 안내" desc="투명한 사전 안내를 약속합니다." breadcrumb={[{ label: '안내' }, { label: '진료시간·비용' }]} />
    <section class="section">
      <div class="wrap-narrow">
        <div class="hours-banner" data-reveal>
          <div class="hours-banner__inner">
            <div class="hours-banner__head">
              <i class="fas fa-clock"></i>
              <span>진료시간 안내</span>
            </div>
            <div class="hours-grid">
              <div class="hours-row">
                <span class="hours-row__day">{CLINIC.hours.weekday.label}</span>
                <span class="hours-row__time">{CLINIC.hours.weekday.time}</span>
              </div>
              <div class="hours-row">
                <span class="hours-row__day">{CLINIC.hours.weekend.label}</span>
                <span class="hours-row__time">{CLINIC.hours.weekend.time}</span>
              </div>
            </div>
            <p class="hours-banner__note"><i class="fas fa-circle-info"></i> {CLINIC.hours.note}</p>
          </div>
        </div>

        <div class="article" data-reveal>
          <h2>비급여 진료비 안내 원칙</h2>
          <div class="answer">정원한의원은 진료 단계에서 예상 복용 기간과 비용을 미리 안내하는 것을 원칙으로 합니다.</div>
          <p>
            한약을 비롯한 비급여 진료비는 처방 구성과 기간에 따라 달라집니다. "한약은 비용과 기간을
            예측하기 어렵다"는 불편을 줄이기 위해, 정원한의원은 진료 후 상담 시 예상 비용과 기간을
            투명하게 안내해 드립니다. 환자분이 이해하고 동의하신 뒤에 처방을 진행합니다.
          </p>

          <h2>교통사고 진료비</h2>
          <div class="answer">교통사고로 인한 한방 치료는 자동차보험 적용이 가능하며, 별도 본인 부담 없이 진료받으시는 경우가 많습니다.</div>
          <p>
            침·약침·추나·부항·물리치료와 한약(첩약)까지 자동차보험으로 진료가 가능합니다. 사고 접수번호로
            보험 적용 절차를 안내해 드립니다.
          </p>

          <h2>결제 안내</h2>
          <p>카드 결제가 가능합니다. 자세한 비급여 진료비 항목은 내원 시 또는 전화로 안내해 드립니다.</p>
        </div>

        <div class="cta-banner" style="margin-top:50px" data-reveal>
          <h2 style="font-size:26px">비용이 궁금하신가요?</h2>
          <p>전화 또는 예약으로 문의해 주시면 자세히 안내해 드립니다.</p>
          <div class="hero__actions">
            <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
            <a href="/reservation" class="btn btn-outline-light"><i class="fas fa-calendar-check"></i> 예약</a>
          </div>
        </div>
      </div>
    </section>
  </Page>
)

// ===== 정적 정책 페이지 =====
export const PolicyPage: FC<{ kind: 'privacy' | 'terms' }> = ({ kind }) => {
  const isPrivacy = kind === 'privacy'
  return (
    <Page
      title={isPrivacy ? '개인정보 처리방침' : '이용약관'}
      description={`${CLINIC.nameFull} ${isPrivacy ? '개인정보 처리방침' : '이용약관'}`}
      path={`/${kind}`}
    >
      <PageHero title={isPrivacy ? '개인정보 처리방침' : '이용약관'} breadcrumb={[{ label: isPrivacy ? '개인정보 처리방침' : '이용약관' }]} />
      <section class="section"><div class="wrap-narrow article">
        {isPrivacy ? (
          <>
            <h2>1. 수집하는 개인정보 항목</h2>
            <p>정원한의원은 회원가입 및 예약 접수 시 이름, 연락처(전화번호), 이메일 주소를 수집합니다. 마케팅 정보 수신에 동의하신 경우 이를 별도 관리합니다.</p>
            <h2>2. 개인정보의 이용 목적</h2>
            <p>수집된 정보는 진료 예약 안내, 진료 관련 연락, 본인 동의 시 마케팅 정보 제공의 목적으로만 이용됩니다.</p>
            <h2>3. 개인정보의 보유 및 파기</h2>
            <p>관련 법령에 따른 보존 의무가 없는 정보는 이용 목적 달성 후 지체 없이 파기합니다.</p>
            <h2>4. 이용자의 권리</h2>
            <p>이용자는 언제든지 본인의 개인정보 열람·정정·삭제 및 동의 철회를 요청할 수 있습니다.</p>
            <h2>5. 문의처</h2>
            <p>개인정보 관련 문의는 {CLINIC.phone} 또는 {CLINIC.email}로 연락 주시기 바랍니다.</p>
          </>
        ) : (
          <>
            <h2>제1조 (목적)</h2>
            <p>본 약관은 {CLINIC.nameFull} 웹사이트가 제공하는 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
            <h2>제2조 (서비스의 내용)</h2>
            <p>본 웹사이트는 진료 정보 안내, 진료 예약 접수, 한방 건강 정보 제공 등의 서비스를 제공합니다.</p>
            <h2>제3조 (의료 정보의 한계)</h2>
            <p>본 웹사이트가 제공하는 의료 정보는 일반적인 이해를 돕기 위한 것으로, 의료진의 진료를 대체하지 않습니다. 치료 효과와 반응은 개인에 따라 다를 수 있습니다.</p>
            <h2>제4조 (회원의 의무)</h2>
            <p>회원은 정확한 정보를 제공하여야 하며, 타인의 정보를 도용해서는 안 됩니다.</p>
          </>
        )}
      </div></section>
    </Page>
  )
}

// ===== 404 =====
export const NotFoundPage: FC = () => (
  <Page title="페이지를 찾을 수 없습니다 (404)" description="요청하신 페이지를 찾을 수 없습니다." path="/404">
    <section class="hero" style="min-height:80vh">
      <div class="hero__bg"></div>
      <div class="wrap text-center" style="position:relative;z-index:2">
        <h1 class="hero__title" style="font-size:clamp(60px,12vw,140px)">404</h1>
        <p class="hero__desc" style="margin:0 auto 30px">요청하신 페이지를 찾을 수 없습니다.<br />주소를 다시 확인해 주세요.</p>
        <div class="hero__actions" style="justify-content:center">
          <a href="/" class="btn btn-light"><i class="fas fa-house"></i> 홈으로</a>
          <a href="/treatments" class="btn btn-outline-light">진료 안내</a>
        </div>
      </div>
    </section>
  </Page>
)
