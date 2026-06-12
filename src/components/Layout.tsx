import type { FC, PropsWithChildren } from 'hono/jsx'
import { CLINIC, SITE_NAV } from '../data/clinic'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'

interface LayoutProps {
  title: string
  description: string
  path: string
  ogType?: string
  jsonLd?: object | object[]
  breadcrumb?: { label: string; href?: string }[]
}

// ============= <head> 메타 =============
export const Head: FC<LayoutProps> = ({ title, description, path, ogType = 'website', jsonLd }) => {
  const url = CLINIC.domain + path
  const fullTitle = title.includes(CLINIC.name) ? title : `${title} | ${CLINIC.nameFull}`
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return (
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content={CLINIC.nameFull} />
      {/* OG */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={CLINIC.nameFull} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content={CLINIC.domain + '/static/og-image.png'} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {/* Favicon */}
      <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/static/apple-touch-icon.png" />
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Song+Myung&family=Noto+Serif+KR:wght@400;500;600;700;900&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css"
      />
      <link rel="stylesheet" href="/static/style.css" />
      {ldArray.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </head>
  )
}

// ============= 헤더 =============
export const Header: FC = () => {
  return (
    <header class="site-header">
      <div class="wrap site-header__inner">
        <a href="/" class="logo" aria-label="정원한의원 오산 홈">
          <span class="logo__mark"><i class="fas fa-leaf"></i></span>
          <span class="logo__txt">
            <span class="logo__name">정원한의원</span>
            <span class="logo__sub">JEONGWON · OSAN</span>
          </span>
        </a>

        <nav aria-label="주 메뉴">
          <ul class="gnb">
            <li><a href="/mission">병원미션</a></li>
            <li><a href="/doctors">의료진</a></li>
            <li>
              <a href="/treatments">진료 <i class="fas fa-chevron-down" style="font-size:10px;margin-left:2px"></i></a>
              <div class="mega">
                <div class="mega__grid">
                  <span class="mega__head">핵심 진료</span>
                  <div class="mega__core">
                    {CORE_TREATMENTS.map((t) => (
                      <a class="mega__core-item" href={`/treatments/${t.slug}`}>
                        <i class={`fas ${t.icon}`}></i>
                        <strong>{t.shortName}</strong>
                        <span>{t.tagline}</span>
                      </a>
                    ))}
                  </div>
                  <span class="mega__head">전체 진료</span>
                  {GENERAL_TREATMENTS.map((t) => (
                    <a class="mega__link" href={`/treatments/${t.slug}`}>
                      <i class={`fas ${t.icon}`} style="margin-right:8px;color:var(--brand-accent);font-size:13px"></i>
                      {t.shortName}
                    </a>
                  ))}
                </div>
              </div>
            </li>
            <li>
              <a href="/cases/gallery">콘텐츠 <i class="fas fa-chevron-down" style="font-size:10px;margin-left:2px"></i></a>
              <div class="dropdown">
                <a href="/cases/gallery">비포/애프터</a>
                <a href="/column">원장 칼럼</a>
                <a href="/encyclopedia">한방 백과사전</a>
              </div>
            </li>
            <li>
              <a href="/directions">안내 <i class="fas fa-chevron-down" style="font-size:10px;margin-left:2px"></i></a>
              <div class="dropdown">
                <a href="/directions">오시는 길</a>
                <a href="/pricing">진료시간·비용</a>
                <a href="/faq">자주 묻는 질문</a>
                <a href="/notice">공지사항</a>
                <a href="/sasang-test">체질 TI 테스트</a>
              </div>
            </li>
          </ul>
        </nav>

        <a href="/reservation" class="header-cta"><i class="fas fa-calendar-check"></i> 진료 예약</a>
        <button class="burger" aria-label="메뉴 열기"><i class="fas fa-bars"></i></button>
      </div>

      {/* 모바일 메뉴 */}
      <div class="mobile-menu">
        <div class="mobile-menu__top">
          <span class="logo"><span class="logo__mark"><i class="fas fa-leaf"></i></span><span class="logo__name">정원한의원</span></span>
          <button class="mobile-menu__close" aria-label="메뉴 닫기" style="background:none;border:0;color:#fff;font-size:26px"><i class="fas fa-xmark"></i></button>
        </div>
        <ul class="mobile-menu__list">
          <li><a href="/mission">병원미션</a></li>
          <li><a href="/doctors">의료진</a></li>
          <li>
            <button class="m-acc-btn">진료 <i class="fas fa-chevron-down" style="font-size:14px;transition:transform .3s"></i></button>
            <div class="m-sub">
              {[...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => (
                <a href={`/treatments/${t.slug}`}>{t.shortName}</a>
              ))}
            </div>
          </li>
          <li>
            <button class="m-acc-btn">콘텐츠 <i class="fas fa-chevron-down" style="font-size:14px;transition:transform .3s"></i></button>
            <div class="m-sub">
              <a href="/cases/gallery">비포/애프터</a>
              <a href="/column">원장 칼럼</a>
              <a href="/encyclopedia">한방 백과사전</a>
            </div>
          </li>
          <li>
            <button class="m-acc-btn">안내 <i class="fas fa-chevron-down" style="font-size:14px;transition:transform .3s"></i></button>
            <div class="m-sub">
              <a href="/directions">오시는 길</a>
              <a href="/pricing">진료시간·비용</a>
              <a href="/faq">자주 묻는 질문</a>
              <a href="/notice">공지사항</a>
              <a href="/sasang-test">체질 TI 테스트</a>
            </div>
          </li>
          <li><a href="/reservation" style="color:#9be3b6">진료 예약하기 →</a></li>
        </ul>
      </div>
    </header>
  )
}

// ============= 푸터 =============
export const Footer: FC = () => {
  return (
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="/" class="logo">
              <span class="logo__mark"><i class="fas fa-leaf"></i></span>
              <span class="logo__txt"><span class="logo__name">정원한의원</span><span class="logo__sub">JEONGWON · OSAN</span></span>
            </a>
            <p>{CLINIC.mission}. 오산에서 예측 가능하고 이해되는 한방 진료를 제공합니다.</p>
            <div class="footer-social">
              <a href={`tel:${CLINIC.phoneRaw}`} aria-label="전화"><i class="fas fa-phone"></i></a>
              <a href="/reservation" aria-label="예약"><i class="fas fa-calendar-check"></i></a>
              <a href={CLINIC.social.kakao} target="_blank" rel="noopener" aria-label="카카오톡 채널"><i class="fas fa-comment"></i></a>
              <a href={CLINIC.social.blog} target="_blank" rel="noopener" aria-label="네이버 블로그"><i class="fas fa-blog"></i></a>
              <a href={CLINIC.social.youtube} target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a>
              <a href={CLINIC.social.naverPlace} target="_blank" rel="noopener" aria-label="네이버 플레이스"><i class="fas fa-map-location-dot"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>진료 안내</h4>
            <ul>
              {CORE_TREATMENTS.map((t) => (<li><a href={`/treatments/${t.slug}`}>{t.shortName}</a></li>))}
              <li><a href="/treatments">전체 진료과목</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>병원 안내</h4>
            <ul>
              <li><a href="/mission">병원 미션</a></li>
              <li><a href="/doctors">의료진 소개</a></li>
              <li><a href="/cases/gallery">비포/애프터</a></li>
              <li><a href="/column">원장 칼럼</a></li>
              <li><a href="/encyclopedia">한방 백과사전</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>이용 안내</h4>
            <ul>
              <li><a href="/directions">오시는 길</a></li>
              <li><a href="/pricing">진료시간·비용</a></li>
              <li><a href="/faq">자주 묻는 질문</a></li>
              <li><a href="/sasang-test">체질 TI 테스트</a></li>
              <li><a href="/reservation">진료 예약</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-biz">
          <div class="legal-links">
            <a href="/privacy">개인정보 처리방침</a>
            <a href="/terms">이용약관</a>
            <a href="/sitemap.xml">사이트맵</a>
          </div>
          <div>
            상호: {CLINIC.nameFull} &nbsp;|&nbsp; 대표원장: {CLINIC.ceo} &nbsp;|&nbsp; 주소: {CLINIC.address.full}<br />
            대표전화: {CLINIC.phone} &nbsp;|&nbsp; 개원: {CLINIC.openedYear}년 {CLINIC.openedMonth}월 &nbsp;|&nbsp; 진료시간: {CLINIC.hours.weekday.label} {CLINIC.hours.weekday.time}
          </div>
          <p class="footer-disclaimer">
            본 웹사이트의 의료 정보는 일반적인 이해를 돕기 위한 것으로, 진료를 대체하지 않습니다. 치료 효과와 반응은 개인에 따라 다를 수 있으며, 정확한 진단과 치료는 한의사와의 상담이 필요합니다. © {new Date().getFullYear()} {CLINIC.nameFull}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ============= 플로팅 CTA (데스크탑) =============
export const FloatCta: FC = () => (
  <div class="float-cta">
    <a class="fc-call" href={`tel:${CLINIC.phoneRaw}`} aria-label="전화 상담"><i class="fas fa-phone"></i></a>
    <a class="fc-book" href="/reservation" aria-label="진료 예약"><i class="fas fa-calendar-check"></i></a>
    <a class="fc-top" href="#" aria-label="맨 위로"><i class="fas fa-arrow-up"></i></a>
  </div>
)

// ============= 모바일 하단 고정 CTA 바 =============
export const MobileCtaBar: FC = () => (
  <nav class="mobile-cta-bar" id="mobile-cta-bar" aria-label="빠른 실행">
    <a href={`tel:${CLINIC.phoneRaw}`} class="mcb-item" data-track="cta_call">
      <i class="fas fa-phone"></i><span>전화</span>
    </a>
    <a href="/reservation" class="mcb-item mcb-item--primary" data-track="cta_book">
      <i class="fas fa-calendar-check"></i><span>예약</span>
    </a>
    <a href="/sasang-test" class="mcb-item" data-track="cta_ti">
      <i class="fas fa-feather-pointed"></i><span>체질테스트</span>
    </a>
    <a href="/directions" class="mcb-item" data-track="cta_map">
      <i class="fas fa-location-dot"></i><span>길찾기</span>
    </a>
  </nav>
)

// ============= 페이지 히어로 (서브페이지 공통) =============
export const PageHero: FC<{ title: string; desc?: string; breadcrumb?: { label: string; href?: string }[] }> = ({
  title,
  desc,
  breadcrumb,
}) => (
  <section class="page-hero">
    <div class="wrap">
      {breadcrumb && (
        <nav class="breadcrumb" aria-label="breadcrumb">
          <a href="/">홈</a>
          {breadcrumb.map((b) => (
            <span> / {b.href ? <a href={b.href}>{b.label}</a> : b.label}</span>
          ))}
        </nav>
      )}
      <h1>{title}</h1>
      {desc && <p>{desc}</p>}
    </div>
  </section>
)

// ============= 전체 페이지 셸 =============
export const Page: FC<PropsWithChildren<LayoutProps>> = (props) => {
  return (
    <html lang="ko">
      <Head {...props} />
      <body>
        <Header />
        <main>{props.children}</main>
        <Footer />
        <FloatCta />
        <MobileCtaBar />
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
}
