import type { FC } from 'hono/jsx'
import { Page } from '../components/Layout'
import { CLINIC, CORE_VALUES } from '../data/clinic'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { organizationSchema, speakableSchema } from '../lib/schema'

export const HomePage: FC = () => {
  const ceo = DOCTORS[0]
  return (
    <Page
      title="오산 한의원 | 정원한의원 오산 — 비만·체질한약·교통사고 후유증"
      description="오산 정원한의원은 한방내과 전문의 진료를 바탕으로 비만 다이어트, 체질 맞춤 한약, 교통사고 후유증을 진료합니다. 예측 가능하고 이해되는 한방 진료를 제공합니다."
      path="/"
      jsonLd={[organizationSchema(), speakableSchema(['.hero__title', '.hero__desc'])]}
    >
      {/* ===== 히어로 ===== */}
      <section class="hero">
        <div class="hero__bg" data-parallax="0.2"></div>
        <i class="fas fa-leaf hero__leaf"></i>
        <i class="fas fa-seedling hero__leaf2"></i>
        <div class="wrap">
          <div class="hero__inner">
            <span class="hero__badge" data-hero="1">
              <i class="fas fa-stethoscope"></i> 한방내과 전문의 · 오산 성호대로
            </span>
            <h1 class="hero__title" data-hero="2">
              한약은 어렵다고요?<br />
              <span class="serif accent">이해되는 한방</span>을<br />
              만들겠습니다.
            </h1>
            <p class="hero__desc" data-hero="3">
              오늘 받을 치료, 걸리는 시간, 들어가는 비용까지 — 막연한 불안 대신
              분명한 그림을 먼저 그려 드립니다. {CLINIC.tagline}.
            </p>
            <div class="hero__actions" data-hero="4">
              <a href="/reservation" class="btn btn-light"><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
              <a href="/sasang-test" class="btn btn-outline-light"><i class="fas fa-wand-magic-sparkles"></i> 내 체질 알아보기</a>
            </div>
          </div>
        </div>
        <a href="#intro" class="hero__scroll">
          SCROLL <i class="fas fa-chevron-down"></i>
        </a>
      </section>

      {/* ===== 통계 카운트업 ===== */}
      <section class="section-tight" id="intro">
        <div class="wrap">
          <div class="stats">
            <div class="stat" data-reveal>
              <div class="stat__num"><span data-count={CLINIC.openedYear === 2020 ? 6 : 5}></span><span class="unit">년+</span></div>
              <div class="stat__label">오산에서 함께한 시간</div>
            </div>
            <div class="stat" data-reveal data-reveal-delay="1">
              <div class="stat__num"><span data-count="13"></span><span class="unit">개</span></div>
              <div class="stat__label">한방 진료 과목</div>
            </div>
            <div class="stat" data-reveal data-reveal-delay="2">
              <div class="stat__num"><span data-count="365"></span></div>
              <div class="stat__label">평일 야간·주말 진료</div>
            </div>
            <div class="stat" data-reveal data-reveal-delay="3">
              <div class="stat__num"><span data-count="2"></span><span class="unit">시간</span></div>
              <div class="stat__label">주차 지원 (만차 시)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 철학 split ===== */}
      <section class="section bg-soft">
        <div class="wrap">
          <div class="split">
            <div class="split__media placeholder" data-reveal>
              <div style="text-align:center">
                <i class="fas fa-spa"></i>
                <p style="margin-top:14px;font-size:14px">정원한의원 진료 공간</p>
              </div>
            </div>
            <div data-reveal data-reveal-delay="1">
              <span class="eyebrow">왜 정원한의원인가</span>
              <h2>불안·불편·불신을 줄이면<br /><span class="serif" style="color:var(--brand-2)">치료에 집중</span>할 수 있습니다</h2>
              <p>
                "한의학은 어렵다, 비용과 기간을 예측하기 어렵다." 많은 분들이 한의원에서 느끼는
                불편입니다. 정원한의원은 쉬운 언어와 이미지로 설명하고, 치료 시간·비용·전체 기간을
                미리 안내합니다. 이해하고 동의한 치료를 함께 만들어 갑니다.
              </p>
              <ul>
                <li>오늘 받을 치료와 순서를 미리 안내하는 재진 시스템</li>
                <li>앞으로의 과정을 예고하는 초진 안내</li>
                <li>한방내과 전문의 기반 체질 맞춤 한약 처방</li>
              </ul>
              <a href="/mission" class="btn btn-ghost">병원 미션 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 핵심 진료 TOP3 ===== */}
      <section class="section">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow">CORE TREATMENTS</span>
            <h2>정원한의원이 집중하는 <span class="serif">세 가지</span></h2>
            <p>한방내과 전문의 진료를 토대로, 오산에서 가장 많이 찾으시는 세 가지 진료에 집중합니다.</p>
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

      {/* ===== 핵심 가치 ===== */}
      <section class="section bg-soft">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow">OUR VALUE</span>
            <h2>정원한의원이 지키는 <span class="serif">세 가지 약속</span></h2>
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

      {/* ===== 대표원장 ===== */}
      <section class="section">
        <div class="wrap">
          <div class="split rev">
            <div data-reveal>
              <span class="eyebrow">대표원장</span>
              <h2>{ceo.name} <span style="font-size:0.6em;color:var(--ink-3)">{ceo.title}</span></h2>
              <p style="font-size:15px;color:var(--brand-accent);font-weight:700;margin-bottom:16px">{ceo.specialty}</p>
              <p>{ceo.intro}</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin:22px 0">
                {ceo.memberships.map((m) => (
                  <span style="background:var(--brand-soft);color:var(--brand);padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700">{m}</span>
                ))}
              </div>
              <a href={`/doctors/${ceo.slug}`} class="btn btn-ghost">원장 프로필 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="split__media placeholder" data-reveal data-reveal-delay="1">
              <div style="text-align:center"><i class="fas fa-user-doctor"></i><p style="margin-top:14px;font-size:14px">{ceo.name} 대표원장</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 전체 진료 ===== */}
      <section class="section bg-soft">
        <div class="wrap">
          <div class="sec-head center" data-reveal>
            <span class="eyebrow">ALL TREATMENTS</span>
            <h2>온 가족의 건강을 <span class="serif">한 곳에서</span></h2>
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

      {/* ===== 체질 TI 유도 ===== */}
      <section class="section">
        <div class="wrap">
          <div class="cta-banner" data-reveal style="background:linear-gradient(135deg,#1b6e3c,#2f9e5e)">
            <h2><i class="fas fa-wand-magic-sparkles" style="margin-right:10px"></i>내 체질은 무엇일까?</h2>
            <p>8개의 질문으로 알아보는 나의 사상체질. 체질에 맞는 건강 관리의 첫걸음을 시작하세요.</p>
            <div class="hero__actions">
              <a href="/sasang-test" class="btn btn-light"><i class="fas fa-play"></i> 체질 TI 테스트 시작</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 최종 CTA ===== */}
      <section class="section bg-soft">
        <div class="wrap">
          <div class="cta-banner" data-reveal>
            <h2>오늘, 분명한 진료를 시작하세요</h2>
            <p>오산 성호대로 농협중앙회 앞. 전용주차장 완비. 평일 야간·주말 진료.</p>
            <div class="hero__actions">
              <a href="/reservation" class="btn btn-light"><i class="fas fa-calendar-check"></i> 진료 예약</a>
              <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}
