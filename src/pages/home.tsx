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
      {/* ===== 히어로 — 本草 아카이브 표지 ===== */}
      <section class="hero" id="hero">
        <span class="hero__hanja" aria-hidden="true">本草</span>
        <div class="wrap-wide">
          <div class="hero__grid">
            <div class="hero__inner">
              <span class="hero__badge" data-hero="1">
                <i class="fas fa-stethoscope"></i> 한방내과 전문의 진료 · 오산 성호대로
              </span>
              <h1 class="hero__title">
                <span class="line"><span>한약은</span></span>
                <span class="line"><span>어렵다고요?</span></span>
                <span class="line"><span><em class="stamp accent">이해되는 한방</em></span></span>
              </h1>
              <p class="hero__desc" data-hero="3">
                오늘 받을 치료, 걸리는 시간, 들어가는 비용까지 — 막연한 불안 대신
                분명한 그림을 먼저 그려 드립니다. {CLINIC.tagline}.
              </p>
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
        <div class="wrap">
          <div class="stats" data-reveal>
            <div class="stat">
              <div class="stat__num"><span data-count="6"></span><span class="unit">년+</span></div>
              <div class="stat__label">오산에서 함께한 시간</div>
            </div>
            <div class="stat">
              <div class="stat__num"><span data-count="13"></span><span class="unit">개</span></div>
              <div class="stat__label">한방 진료 과목</div>
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
                <img src="/static/img/clinic-room.webp" alt="정원한의원 진료 공간 — 따뜻한 한지 톤의 한약장과 진료실" loading="lazy" />
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
                <li>오늘 받을 치료와 순서를 미리 안내하는 재진 시스템</li>
                <li>앞으로의 과정을 예고하는 초진 안내</li>
                <li>한방내과 전문의 기반 체질 맞춤 한약 처방</li>
              </ul>
              <a href="/mission" class="btn-text">병원 미션 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
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
      <section class="section">
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
              <div style="margin-top:26px">
                <a href={`/doctors/${ceo.slug}`} class="btn-text">원장 프로필 보기 <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            <div class="doc-portrait" data-reveal data-reveal-delay="1">
              <div class="doc-portrait__seal">{ceo.name.charAt(0)}</div>
              <div class="doc-portrait__mono">{ceo.name.charAt(0)}</div>
              <div class="doc-portrait__info">
                <strong>{ceo.name} <span>{ceo.title}</span></strong>
                <em>{ceo.specialty}</em>
              </div>
            </div>
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

      {/* ===== 체질 TI 유도 ===== */}
      <section class="section">
        <div class="wrap">
          <div class="cta-banner" data-reveal>
            <span class="eyebrow eyebrow--paper">SELF-DIAGNOSIS · 體質</span>
            <h2>내 체질은 <span class="serif" style="color:var(--gold-2)">무엇일까?</span></h2>
            <p>8개의 질문으로 알아보는 나의 사상체질. 체질에 맞는 건강 관리의 첫걸음을 시작하세요.</p>
            <div class="hero__actions">
              <a href="/sasang-test" class="btn btn-paper btn-lg" data-magnetic><i class="fas fa-feather-pointed"></i> 체질 TI 테스트 시작</a>
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
    </Page>
  )
}
