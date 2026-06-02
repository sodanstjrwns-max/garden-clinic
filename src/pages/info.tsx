import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC, CORE_VALUES } from '../data/clinic'
import { breadcrumbSchema } from '../lib/schema'

// ===== 미션 =====
export const MissionPage: FC = () => (
  <Page
    title="병원 미션 — 가고 싶은 한의원의 표준, 오산 정원한의원"
    description="정원한의원 오산의 미션. 불안·불편·불신을 줄여 치료에 집중할 수 있는 한의원. 오산에서도 서울보다 더 질 높은 의료 서비스를 제공합니다."
    path="/mission"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '병원미션', url: '/mission' }])}
  >
    {/* 미션 히어로 (full impact) */}
    <section class="hero" style="min-height:78vh">
      <div class="hero__bg" data-parallax="0.2"></div>
      <i class="fas fa-leaf hero__leaf"></i>
      <div class="wrap">
        <div class="hero__inner" style="max-width:900px">
          <span class="hero__badge" data-hero="1"><i class="fas fa-quote-left"></i> 정원한의원의 약속</span>
          <h1 class="hero__title" data-hero="2" style="font-size:clamp(36px,6vw,72px)">
            가고 싶은 한의원의<br /><span class="serif accent">표준</span>이 되겠습니다
          </h1>
          <p class="hero__desc" data-hero="3">
            오산에서도 서울보다 더 질 높은 의료 서비스를. 제가 드릴 수 있는 진료 시간, 공간,
            의료 서비스 모두를 환자분이 가장 편안하게 진료받을 수 있는 조건으로 준비했습니다.
          </p>
        </div>
      </div>
    </section>

    {/* 시작 이유 */}
    <section class="section">
      <div class="wrap-narrow text-center" data-reveal>
        <span class="eyebrow" style="justify-content:center">WHY WE BEGAN</span>
        <h2 style="font-size:clamp(26px,4vw,42px);margin-bottom:24px;line-height:1.4">
          "<span class="serif" style="color:var(--brand-2)">불안·불편·불신</span>을 줄이면<br />치료에 집중할 수 있습니다"
        </h2>
        <p style="font-size:18px;color:var(--ink-2);line-height:1.8">
          한의학은 어렵고, 비용과 기간을 예측하기 어렵다는 말을 자주 듣습니다. 정원한의원은 그
          불편을 줄이는 데서 출발했습니다. 환자분이 이해할 수 있는 쉬운 설명, 이미지로 보여 드리는
          설명, 그리고 치료 시간·비용·전체 기간에 대한 사전 안내. 막연함을 분명함으로 바꾸는 것이
          정원한의원이 생각하는 좋은 진료의 시작입니다.
        </p>
      </div>
    </section>

    {/* 핵심 가치 */}
    <section class="section bg-soft">
      <div class="wrap">
        <div class="sec-head center" data-reveal>
          <span class="eyebrow">CORE VALUE</span>
          <h2>세 가지 핵심 가치</h2>
        </div>
        <div class="value-grid">
          {CORE_VALUES.map((v, i) => (
            <div class="value-card" data-reveal data-reveal-delay={String(i + 1)}>
              <div class="value-card__num">0{i + 1}</div>
              <div class="value-card__icon"><i class={`fas ${v.icon}`}></i></div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 환자에 대한 관심 */}
    <section class="section">
      <div class="wrap">
        <div class="split">
          <div class="split__media placeholder" data-reveal><div style="text-align:center"><i class="fas fa-heart"></i><p style="margin-top:14px;font-size:14px">환자 중심 진료</p></div></div>
          <div data-reveal data-reveal-delay="1">
            <span class="eyebrow">우리의 강점</span>
            <h2>치료보다 먼저,<br /><span class="serif" style="color:var(--brand-2)">사람을 봅니다</span></h2>
            <p>
              정원한의원이 가장 자신 있는 것은 환자분에 대한 관심입니다. 치료에 대한 것뿐 아니라
              평소 생활 습관과 직업, 진료에서 무엇을 불편해하시는지까지 — 환자분을 향한 관심이
              결국 더 나은 치료로 이어진다고 믿습니다.
            </p>
            <a href="/doctors" class="btn btn-ghost" style="margin-top:10px">의료진 소개 <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="wrap"><div class="cta-banner" data-reveal>
        <h2>정원한의원에서 시작하세요</h2>
        <p>분명한 진료, 이해되는 설명. 오산 성호대로에서 기다리겠습니다.</p>
        <div class="hero__actions"><a href="/reservation" class="btn btn-light"><i class="fas fa-calendar-check"></i> 진료 예약</a></div>
      </div></div>
    </section>
  </Page>
)

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
        <div class="split__media placeholder" style="aspect-ratio:3/1;margin-bottom:40px;background:var(--brand);color:#fff" data-reveal>
          <div style="text-align:center">
            <i class="fas fa-clock" style="opacity:0.9"></i>
            <p style="margin-top:14px;font-size:20px;font-weight:800;color:#fff">{CLINIC.hours.weekday.label} {CLINIC.hours.weekday.time}</p>
            <p style="font-size:15px;color:#cfe6d8">{CLINIC.hours.weekend.label} {CLINIC.hours.weekend.time}</p>
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
