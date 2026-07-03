import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC, CORE_VALUES } from '../data/clinic'
import { DOCTORS } from '../data/doctors'
import { PRICE_CATEGORIES } from '../data/pricing'
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
      bodyClass="has-dark-hero"
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
            오산에서도 서울보다 더 질 높은 의료 서비스를. 저희가 드릴 수 있는 진료 시간, 공간,
            의료 서비스 모두를 환자분이 가장 편안하게 진료받을 수 있는 조건으로 준비했습니다.
          </p>
        </div>
      </section>

      {/* 2. 시작 이야기 (선언) */}
      <section class="ms-section ms-manifesto">
        <div class="ms-container ms-narrow">
          <span class="ms-eyebrow" data-reveal>WHY WE BEGAN</span>
          <h2 class="ms-manifesto__lead" data-reveal>
            한의학은 어렵고, 비용과 기간을 예측하기 어렵다고들 합니다.<br />
            정원한의원은 바로 그 <span class="ms-accent">불편</span>을 줄이는 데서 시작했습니다.
          </h2>
          <p class="ms-manifesto__body" data-reveal>
            환자분이 이해할 수 있는 쉬운 설명, 이미지로 보여 드리는 설명, 그리고 치료 시간·비용·전체
            기간에 대한 사전 안내. 막연함을 분명함으로 바꾸는 것 — 그것이 정원한의원이 생각하는
            좋은 진료의 시작입니다. 오산에서도 서울 못지않은 진료를 받으실 수 있도록, 저희가 드릴 수
            있는 시간과 공간을 환자분의 편안함에 맞춰 준비했습니다.
          </p>
        </div>
      </section>

      {/* 3. 3불(不) 선언 — 미션의 핵심 정체성 */}
      <section class="ms-section ms-sambul">
        <div class="ms-container">
          <div class="ms-sambul__head" data-reveal>
            <span class="ms-eyebrow ms-eyebrow--light">OUR MISSION</span>
            <h2 class="ms-sambul__title">
              세 가지 <span class="ms-accent">불(不)</span>을 줄입니다
            </h2>
            <p class="ms-sambul__sub">불안·불편·불신. 이 세 가지가 줄어야 환자분이 치료에 집중할 수 있습니다. 말이 아니라, 정원한의원이 실제로 운영하는 방식입니다.</p>
          </div>
          <ol class="ms-sambul__list">
            {sambul.map((s, i) => (
              <li class="ms-sambul__item" data-reveal data-reveal-delay={String((i % 4) + 1)}>
                <span class="ms-sambul__num">0{i + 1}</span>
                <div class="ms-sambul__body">
                  <h3 class="ms-sambul__name"><i class={`fas ${s.icon}`}></i> {s.title}</h3>
                  <p class="ms-sambul__desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. 대표원장의 약속 (절제된 인물 한 컷) */}
      <section class="ms-section ms-section--soft">
        <div class="ms-container">
          <div class="ms-promise" data-reveal>
            <div class="ms-promise__media">
              <img src={ceo.photo} alt={`정원한의원 ${ceo.title} ${ceo.name}`} width="600" height="750" loading="lazy" decoding="async" />
            </div>
            <div class="ms-promise__text">
              <span class="ms-eyebrow">FROM THE DIRECTOR</span>
              <blockquote class="ms-promise__quote">“{ceo.motto}”</blockquote>
              <p class="ms-promise__sign">
                <strong>{ceo.name}</strong> {ceo.title}
                <span class="ms-promise__spec">{ceo.specialty}</span>
              </p>
              <a href="/doctors" class="ms-link">대표원장 소개 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
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
        {/* 지도 + 길찾기 */}
        <div class="map-block" data-reveal>
          <div class="map-block__frame">
            <iframe
              title="정원한의원 오산 위치 지도"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${CLINIC.address.lng - 0.006}%2C${CLINIC.address.lat - 0.003}%2C${CLINIC.address.lng + 0.006}%2C${CLINIC.address.lat + 0.003}&layer=mapnik&marker=${CLINIC.address.lat}%2C${CLINIC.address.lng}`}
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            ></iframe>
          </div>
          <div class="map-block__bar">
            <div class="map-block__addr">
              <i class="fas fa-location-dot"></i>
              <div>
                <strong>{CLINIC.address.full}</strong>
                <span>오산 농협중앙회 정류장 앞 건물 1·2층</span>
              </div>
            </div>
            <div class="map-block__btns">
              <a class="btn btn-primary btn-sm" href={CLINIC.social.naverPlace} target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 네이버 길찾기</a>
              <a class="btn btn-outline btn-sm" href={`https://map.kakao.com/link/to/정원한의원 오산,${CLINIC.address.lat},${CLINIC.address.lng}`} target="_blank" rel="noopener"><i class="fas fa-route"></i> 카카오 길찾기</a>
              <a class="btn btn-outline btn-sm" href={`https://map.kakao.com/link/search/정원한의원 오산`} target="_blank" rel="noopener"><i class="fas fa-magnifying-glass-location"></i> 지도에서 보기</a>
            </div>
          </div>
        </div>

        <div class="value-grid">
          <div class="value-card" data-reveal>
            <div class="value-card__icon"><i class="fas fa-car"></i></div>
            <h2>자가용 / 주차</h2>
            <p>{CLINIC.directions.parking}</p>
          </div>
          <div class="value-card" data-reveal data-reveal-delay="1">
            <div class="value-card__icon"><i class="fas fa-bus"></i></div>
            <h2>버스</h2>
            <p>{CLINIC.directions.bus}</p>
          </div>
          <div class="value-card" data-reveal data-reveal-delay="2">
            <div class="value-card__icon"><i class="fas fa-train-subway"></i></div>
            <h2>지하철</h2>
            <p>{CLINIC.directions.subway}</p>
          </div>
        </div>

        {/* 진료시간 */}
        <div class="summary-box" style="margin-top:50px" data-reveal>
          <h2><i class="fas fa-clock" style="margin-right:10px"></i>진료시간</h2>
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
          <p>카드 결제가 가능합니다. 자세한 비급여 진료비 항목은 아래 안내표를 참고해 주세요.</p>
        </div>

        {/* ===== 비급여 진료비 안내표 ===== */}
        <div class="price-intro" data-reveal>
          <h2 class="price-intro__title">비급여 진료비 안내</h2>
          <p class="price-intro__sub">
            의료법 제45조에 따라 비급여 진료비를 안내해 드립니다. 표기된 금액은 정가 기준이며,
            처방 구성·기간·부위·용량에 따라 실제 비용은 달라질 수 있습니다. 진료 후 상담 시
            예상 비용과 기간을 미리 안내해 드립니다. <strong>(기준일: 2026.03)</strong>
          </p>
        </div>

        <div class="price-tables" data-reveal>
          {PRICE_CATEGORIES.map((cat) => (
            <div class="price-card">
              <div class="price-card__head">
                <span class="price-card__icon"><i class={`fas ${cat.icon}`}></i></span>
                <div>
                  <h3 class="price-card__title">{cat.title}</h3>
                  {cat.desc && <p class="price-card__desc">{cat.desc}</p>}
                </div>
              </div>
              <ul class="price-list">
                {cat.items.map((item) => (
                  <li class="price-row">
                    <div class="price-row__name">
                      <span>{item.name}</span>
                      {item.note && <span class="price-row__note">{item.note}</span>}
                    </div>
                    <span class="price-row__price">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p class="price-disclaimer" data-reveal>
          <i class="fas fa-circle-info"></i> 위 금액은 비급여 진료비 정가 안내이며, 할인·패키지 적용 여부 및
          최종 비용은 진료 후 개인별 상태에 따라 달라질 수 있습니다. 자세한 사항은 내원 또는 전화로 문의해 주세요.
        </p>

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
