import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { getTreatment, TREATMENTS } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { autoLinkTerms, formatColumnBody } from '../data/encyclopedia'
import { getArea, AREA_TREATMENTS, AREAS } from '../data/areas'
import { CLINIC } from '../data/clinic'
import { articleSchema, breadcrumbSchema, faqPageSchema, cityAreaSchema, organizationSchema, localAreaClinicSchema, howToSchema, speakableSchema } from '../lib/schema'
import { metaTrim } from '../lib/seo'

// 썸네일 캐시버스터: 썸네일을 새로 올리면 updated_at 이 바뀌므로 URL 이 달라져 CDN/브라우저 캐시가 무효화됨
export function colImageUrl(col: { id: number; thumbnail?: string; updated_at?: string; published_at?: string }): string {
  const stamp = col.updated_at || col.published_at || ''
  const v = stamp ? String(stamp).replace(/[^0-9]/g, '') : ''
  return `/api/column-image/${col.id}${v ? `?v=${v}` : ''}`
}

// 공지 본문: **굵게** 마크다운 + 줄바꿈을 안전하게 HTML로 변환 (XSS 방지 위해 먼저 이스케이프)
export function formatNoticeBody(body: string): string {
  // 1) DB에 다양한 형태로 저장된 개행을 실제 개행(\n)으로 정규화
  const normalized = (body || '')
    .replace(/\\r\\n|\\n|\\r/g, '\n')        // literal "\n" / "\r\n" → 개행
    .replace(/&#0*10;|&#x0*a;/gi, '\n')      // HTML 엔티티 줄바꿈(&#10;, &#xa;) → 개행
    .replace(/<br\s*\/?>/gi, '\n')           // 이미 <br>로 저장된 경우 → 개행 (이후 재구성)
    .replace(/\r\n|\r/g, '\n')               // CRLF → LF
  // 2) XSS 방지 이스케이프
  const esc = normalized
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // 3) **굵게** 마크다운
  const bolded = esc.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // 4) 빈 줄 기준으로 단락(<p>) 분리, 단락 내 단일 개행은 <br/>
  return bolded
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

export interface ColumnRow {
  id: number
  title: string
  slug: string
  excerpt?: string
  body: string
  category?: string
  author?: string
  thumbnail?: string
  meta_description?: string
  keywords?: string
  og_image?: string
  reading_time?: number
  published?: number
  published_at?: string
  updated_at?: string
  views?: number
}

export interface NoticeRow {
  id: number
  title: string
  body: string
  image?: string
  is_pinned?: number
  show_popup?: number
  popup_until?: string
  link_url?: string
  category?: string
  created_at?: string
  updated_at?: string
}

// ===== 칼럼 목록 =====
export const ColumnListPage: FC<{ columns: ColumnRow[] }> = ({ columns }) => {
  // 칼럼에 실제로 존재하는 카테고리(진료 항목)만 필터 탭으로 노출.
  // TREATMENTS 순서를 유지하되, 칼럼에 있는 것만 포함.
  const usedCats = new Set(columns.map((c) => c.category).filter(Boolean) as string[])
  // '한의원'(clinic)은 특정 진료가 아닌 일반 한의원 글용 카테고리 → 진료 탭보다 먼저 노출
  const clinicTab = usedCats.has('clinic') ? [{ slug: 'clinic', label: '한의원' }] : []
  const filterTabs = [
    ...clinicTab,
    ...TREATMENTS
      .filter((t) => usedCats.has(t.slug))
      .map((t) => ({ slug: t.slug, label: t.shortName || t.name })),
  ]

  return (
    <Page
      title="원장 칼럼 — 한방 건강 이야기 | 오산 정원한의원"
      description="오산 정원한의원 원장이 직접 전하는 한방 건강 이야기. 다이어트·체질·교통사고 후유증 등 진료 현장의 이야기를 담았습니다."
      path="/column"
      jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '원장 칼럼', url: '/column' }])}
    >
      <PageHero title="원장 칼럼" desc="진료실에서 미처 못 다한 이야기, 여기에 담습니다." breadcrumb={[{ label: '콘텐츠' }, { label: '원장 칼럼' }]} />
      <section class="section">
        <div class="wrap">
          {columns.length === 0 ? (
            <div class="text-center" style="padding:60px 0;color:var(--ink-3)">
              <i class="fas fa-feather-pointed" style="font-size:48px;opacity:0.3"></i>
              <p style="margin-top:16px">칼럼이 곧 업데이트됩니다.</p>
            </div>
          ) : (
            <>
              {filterTabs.length > 1 && (
                <nav class="col-filter" id="col-filter" aria-label="진료 항목별 칼럼 필터">
                  <button type="button" class="col-filter__btn is-active" data-cat="all">
                    전체 <span class="col-filter__count">{columns.length}</span>
                  </button>
                  {filterTabs.map((t) => (
                    <button type="button" class="col-filter__btn" data-cat={t.slug}>
                      {t.label}
                      <span class="col-filter__count">
                        {columns.filter((c) => c.category === t.slug).length}
                      </span>
                    </button>
                  ))}
                </nav>
              )}
              <div class="col-grid" id="col-grid">
                {columns.map((col) => (
                  <a class="col-card" href={`/column/${col.slug}`} data-cat={col.category || ''} data-reveal>
                    <div class="col-card__thumb">
                      {col.thumbnail ? <img src={colImageUrl(col)} alt={col.title} loading="lazy" /> : <i class="fas fa-feather-pointed"></i>}
                    </div>
                    <div class="col-card__body">
                      {col.category && <div class="col-card__cat">{col.category === 'clinic' ? '한의원' : getTreatment(col.category)?.shortName || col.category}</div>}
                      <div class="col-card__title">{col.title}</div>
                      <div class="col-card__excerpt">{col.excerpt}</div>
                      <div class="col-card__meta">
                        <i class="fas fa-user-pen"></i>
                        {col.author ? getDoctor(col.author)?.name || '정원한의원' : '정원한의원'}
                        {col.published_at && <span>· {col.published_at.slice(0, 10)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <p class="col-filter__empty" id="col-filter-empty" style="display:none">
                <i class="fas fa-feather-pointed" style="opacity:0.3;margin-right:8px"></i>
                이 진료 항목의 칼럼이 아직 없습니다.
              </p>
              <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var filter = document.getElementById('col-filter');
  if(!filter) return;
  var grid = document.getElementById('col-grid');
  var empty = document.getElementById('col-filter-empty');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.col-card'));
  var btns = Array.prototype.slice.call(filter.querySelectorAll('.col-filter__btn'));
  function apply(cat){
    var shown = 0;
    cards.forEach(function(c){
      var ok = (cat === 'all') || (c.getAttribute('data-cat') === cat);
      c.style.display = ok ? '' : 'none';
      if(ok) shown++;
    });
    empty.style.display = shown === 0 ? '' : 'none';
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      btns.forEach(function(x){ x.classList.remove('is-active'); });
      b.classList.add('is-active');
      apply(b.getAttribute('data-cat'));
      // URL 해시로 상태 공유 (뒤로가기/새로고침 시 유지)
      try { history.replaceState(null,'', b.getAttribute('data-cat')==='all' ? location.pathname : '#cat='+b.getAttribute('data-cat')); } catch(e){}
    });
  });
  // 진입 시 해시(#cat=slug)가 있으면 해당 탭 활성화
  var m = (location.hash||'').match(/cat=([\\w-]+)/);
  if(m){
    var target = btns.filter(function(b){ return b.getAttribute('data-cat')===m[1]; })[0];
    if(target) target.click();
  }
})();
` }} />
            </>
          )}
        </div>
      </section>
    </Page>
  )
}

// ===== 칼럼 상세 =====
export const ColumnDetailPage: FC<{ column: ColumnRow }> = ({ column: col }) => {
  const tx = col.category ? getTreatment(col.category) : null
  const author = col.author ? getDoctor(col.author) : null
  const ogImg = col.thumbnail ? colImageUrl(col) : undefined
  const readMin = col.reading_time && col.reading_time > 0
    ? col.reading_time
    : Math.max(1, Math.round((col.body || '').replace(/<[^>]+>/g, '').replace(/\s+/g, '').length / 500))
  return (
    <Page
      title={`${col.title} — 원장 칼럼 | 오산 정원한의원`}
      description={col.meta_description || col.excerpt || col.title}
      path={`/column/${col.slug}`}
      ogType="article"
      keywords={col.keywords || undefined}
      ogImage={ogImg}
      jsonLd={[
        articleSchema({
          title: col.title,
          description: col.meta_description || col.excerpt || col.title,
          url: `/column/${col.slug}`,
          datePublished: col.published_at || new Date().toISOString(),
          dateModified: col.updated_at || col.published_at || new Date().toISOString(),
          author: author?.name || '정원한의원',
          image: ogImg,
          keywords: col.keywords || undefined,
          timeRequired: readMin,
        }),
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '원장 칼럼', url: '/column' },
          { name: col.title, url: `/column/${col.slug}` },
        ]),
      ]}
    >
      <PageHero title={col.title} breadcrumb={[{ label: '원장 칼럼', href: '/column' }, { label: col.title }]} />
      <section class="section">
        <div class="wrap detail-layout">
          <div data-reveal>
            <div class="col-meta-row">
              <span><i class="fas fa-user-pen"></i> {author ? <a href={`/doctors/${author.slug}`} style="color:var(--brand);font-weight:700">{author.name} {author.title}</a> : '정원한의원'}</span>
              {col.published_at && <span><i class="far fa-calendar"></i> {col.published_at.slice(0, 10)}</span>}
              <span><i class="far fa-clock"></i> 약 {readMin}분 읽기</span>
              {(col.views || 0) > 0 && <span><i class="far fa-eye"></i> {col.views!.toLocaleString()}</span>}
            </div>
            <div class="article" dangerouslySetInnerHTML={{ __html: formatColumnBody(col.body, 8) }}></div>
            {col.keywords && (
              <div class="col-tags">
                {col.keywords.split(',').map((k) => k.trim()).filter(Boolean).map((k) => (
                  <span class="col-tag">#{k}</span>
                ))}
              </div>
            )}
          </div>
          <aside class="sidebar">
            {author && (
              <div class="side-card">
                <h2 class="side-card__title">작성자</h2>
                <a href={`/doctors/${author.slug}`} class="doc-mini"><span class="doc-mini__av"><i class="fas fa-user-doctor"></i></span><strong>{author.name} {author.title}</strong></a>
              </div>
            )}
            {tx && (
              <div class="side-card">
                <h2 class="side-card__title">관련 진료</h2>
                <a href={`/treatments/${tx.slug}`} class="side-link">{tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              </div>
            )}
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h2 class="side-card__title" style="color:var(--brand)">진료 예약</h2>
              <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">궁금한 점이 있으시면 진료받아 보세요.</p>
              <a href="/reservation" class="btn btn-ghost" style="width:100%;justify-content:center;font-size:14px">예약하기</a>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}

// ===== 공지 목록 =====
export const NoticeListPage: FC<{ notices: NoticeRow[] }> = ({ notices }) => (
  <Page
    title="공지사항 — 오산 정원한의원"
    description="오산 정원한의원 공지사항입니다. 진료 일정과 휴진 안내, 진료 시간 변경, 병원 소식 등 내원 전 꼭 확인하면 좋은 안내를 정리해 전해 드립니다."
    path="/notice"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '공지사항', url: '/notice' }])}
  >
    <PageHero title="공지사항" breadcrumb={[{ label: '안내' }, { label: '공지사항' }]} />
    <section class="section">
      <div class="wrap-narrow">
        {notices.length === 0 ? (
          <div class="text-center" style="padding:60px 0;color:var(--ink-3)"><i class="fas fa-bullhorn" style="font-size:48px;opacity:0.3"></i><p style="margin-top:16px">등록된 공지가 없습니다.</p></div>
        ) : (
          notices.map((n) => (
            <a href={`/notice/${n.id}`} class="faq-item" style="display:block;text-decoration:none" data-reveal>
              <div style="padding:22px 4px;display:flex;justify-content:space-between;align-items:center;gap:16px">
                <div>
                  {n.is_pinned ? <span style="background:var(--brand);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;margin-right:8px">대표</span> : null}
                  {n.category === 'event' ? <span style="background:#c9a24b;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;margin-right:8px">이벤트</span> : null}
                  {n.category === 'holiday' ? <span style="background:#c0392b;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;margin-right:8px">휴진</span> : null}
                  <strong style="font-size:18px;color:var(--ink)">{n.title}</strong>
                </div>
                <span style="color:var(--ink-3);font-size:13px">{n.created_at?.slice(0, 10)}</span>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  </Page>
)

// ===== 공지 상세 =====
export const NoticeDetailPage: FC<{ notice: NoticeRow }> = ({ notice: n }) => {
  const catLabel = n.category === 'event' ? '이벤트' : n.category === 'holiday' ? '휴진' : null
  const catClass = n.category === 'event' ? 'notice-badge--event' : n.category === 'holiday' ? 'notice-badge--holiday' : ''
  return (
    <Page title={`${n.title} — 공지사항 | 오산 정원한의원`} description={n.title} path={`/notice/${n.id}`}>
      <PageHero title={n.title} breadcrumb={[{ label: '공지사항', href: '/notice' }, { label: n.title }]} />
      <section class="section">
        <div class="wrap-narrow">
          <article class="notice-detail" data-reveal>
            <div class="notice-detail__meta">
              {n.is_pinned ? <span class="notice-badge notice-badge--pin">대표</span> : null}
              {catLabel ? <span class={`notice-badge ${catClass}`}>{catLabel}</span> : null}
              {n.created_at && <span class="notice-detail__date"><i class="far fa-calendar"></i> {n.created_at.slice(0, 10)}</span>}
            </div>
            {n.image && (
              <img class="notice-detail__img" src={`/api/notice-image/${n.id}`} alt={n.title} loading="lazy" decoding="async" />
            )}
            <div class="notice-detail__body article" dangerouslySetInnerHTML={{ __html: formatNoticeBody(n.body) }}></div>
            {n.link_url && (
              <a href={n.link_url} target="_blank" rel="noopener" class="btn btn-primary notice-detail__link">
                <i class="fas fa-arrow-up-right-from-square"></i> 자세히 보기
              </a>
            )}
          </article>
          <div class="notice-detail__actions">
            <a href="/notice" class="btn btn-ghost"><i class="fas fa-arrow-left"></i> 목록으로</a>
            <a href="/reservation" class="btn btn-outline"><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
          </div>
        </div>
      </section>
    </Page>
  )
}

// ===== 지역 SEO 페이지 =====
export const AreaPage: FC<{ areaSlug: string; txSlug: string }> = ({ areaSlug, txSlug }) => {
  const area = getArea(areaSlug)
  const tx = getTreatment(txSlug)
  if (!area || !tx) return null
  const areaTx = AREA_TREATMENTS.find((a) => a.slug === txSlug)
  const title = `${area.name} ${areaTx?.name || tx.shortName} 한의원 — 정원한의원 오산`
  const otherAreas = AREAS.filter((a) => a.slug !== areaSlug).slice(0, 8)
  const otherTx = AREA_TREATMENTS.filter((t) => t.slug !== txSlug)

  const accessLine = [area.distance, area.driveTime].filter(Boolean).join(' · ')
  const faqs = [
    { q: `${area.name}에서 정원한의원까지 얼마나 걸리나요?`, a: `${area.full}에서 정원한의원까지는 ${accessLine || '가까운 거리'}입니다. ${area.access}` },
    { q: `${area.name}에서 ${tx.shortName} 진료를 받을 수 있나요?`, a: `네, 정원한의원은 ${area.full} 인근에서 내원하시는 환자분께 ${tx.shortName} 진료를 제공합니다. ${tx.summary} (효과·반응에는 개인차가 있습니다.)` },
    { q: `정원한의원에 주차장이 있나요?`, a: `네, 전용주차장을 운영하며 만차 시 인근 공영주차장 이용 후 2시간 주차를 지원합니다. ${area.name}에서 차량으로 내원하시기 편리합니다.` },
  ]

  return (
    <Page
      title={title}
      description={metaTrim(`${area.full}에서 가까운 한의원을 찾으신다면, 오산 정원한의원의 ${tx.shortName} 진료를 만나보세요. ${area.full}에서 ${accessLine || '가까운 거리'}. ${tx.summary}`, 155)}
      path={`/area/${areaSlug}-${txSlug}`}
      keywords={`${area.name} 한의원, ${area.name} ${tx.shortName}, ${areaTx?.keyword || tx.shortName}, 오산 한의원, 오산 ${tx.shortName}`}
      jsonLd={[
        organizationSchema(),
        localAreaClinicSchema({
          areaName: area.name,
          areaFull: area.full,
          url: `/area/${areaSlug}-${txSlug}`,
          serviceName: tx.name,
          serviceUrl: `/treatments/${tx.slug}`,
          distance: area.distance,
          driveTime: area.driveTime,
        }),
        cityAreaSchema(area.full),
        faqPageSchema(faqs),
        speakableSchema(['.area-answer', 'h1']),
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: `${area.name} ${tx.shortName}`, url: `/area/${areaSlug}-${txSlug}` },
        ]),
      ]}
    >
      <PageHero title={`${area.name} ${tx.shortName} 한의원`} desc={`${area.full}에서 가까운 한방 ${tx.shortName} 진료${accessLine ? ' · ' + accessLine : ''}`} breadcrumb={[{ label: `${area.name} ${tx.shortName}` }]} />
      <section class="section">
        <div class="wrap detail-layout">
          <div class="article" data-reveal>
            {/* AEO: 한 문장 직답 — AI/음성 검색이 인용하기 좋은 위치 */}
            <p class="area-answer answer" style="font-size:17px">
              <strong>{area.full}</strong>에서 {tx.shortName} 한의원을 찾으신다면, 오산 정원한의원이 {accessLine || '가까운 거리'}에 있습니다. {areaTx?.intent || tx.summary}
            </p>

            {/* 접근 정보 카드 */}
            <div class="area-access">
              {area.distance && <div class="area-access__item"><i class="fas fa-route"></i><span>거리</span><strong>{area.distance}</strong></div>}
              {area.driveTime && <div class="area-access__item"><i class="fas fa-car"></i><span>소요시간</span><strong>{area.driveTime}</strong></div>}
              <div class="area-access__item"><i class="fas fa-square-parking"></i><span>주차</span><strong>전용주차장</strong></div>
            </div>

            <h2>{area.name}에서 {tx.shortName}을(를) 찾으신다면</h2>
            <p dangerouslySetInnerHTML={{ __html: autoLinkTerms(tx.summary) }}></p>
            <p>
              정원한의원은 {CLINIC.address.full}에 위치해, {area.full}에서 {accessLine || '가까운 거리'}로
              편리하게 내원하실 수 있습니다.
              {area.landmarks && area.landmarks.length > 0 && ` ${area.landmarks.join(', ')} 인근에서 찾아오시기 좋습니다.`}
              {' '}전용주차장을 운영하며, 만차 시 인근 공영주차장 이용 후 2시간 주차를 지원해 드립니다.
            </p>

            {tx.sections[0] && (
              <>
                <h2>{tx.sections[0].h2}</h2>
                <div class="answer">{tx.sections[0].answer}</div>
                {tx.sections[0].body && <p dangerouslySetInnerHTML={{ __html: autoLinkTerms(tx.sections[0].body) }}></p>}
              </>
            )}

            <h2>{area.name} 주민분들을 위한 자주 묻는 질문</h2>
            {faqs.map((f) => (
              <div class="faq-item">
                <button class="faq-q">{f.q}<span class="ic"><i class="fas fa-plus"></i></span></button>
                <div class="faq-a"><div class="faq-a__inner">{f.a}</div></div>
              </div>
            ))}

            {/* 같은 지역의 다른 진료 — 내부링크 강화 */}
            <h2>{area.name}에서 받을 수 있는 다른 진료</h2>
            <div class="area-tx-links">
              {otherTx.map((t) => (
                <a href={`/area/${areaSlug}-${t.slug}`} class="area-tx-link">
                  <strong>{area.name} {t.name}</strong>
                  <span>{t.intent}</span>
                </a>
              ))}
            </div>

            <div class="cta-banner" style="margin-top:50px">
              <h2 style="font-size:26px">{area.name}에서 정원한의원으로</h2>
              <p>전화 한 통이면 예약 완료. 전용주차장에서 편안하게 진료받으세요.</p>
              <div class="hero__actions">
                <a href="/reservation" class="btn btn-light"><i class="fas fa-calendar-check"></i> 예약</a>
                <a href={`tel:${CLINIC.phoneRaw}`} class="btn btn-outline-light"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
              </div>
            </div>
          </div>

          <aside class="sidebar">
            <div class="side-card">
              <h2 class="side-card__title">{tx.shortName} 진료</h2>
              <a href={`/treatments/${tx.slug}`} class="side-link">진료 자세히 보기<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
            </div>
            <div class="side-card">
              <h2 class="side-card__title">다른 지역 {tx.shortName}</h2>
              {otherAreas.map((a) => (
                <a href={`/area/${a.slug}-${txSlug}`} class="side-link">{a.name} {tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              ))}
            </div>
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h2 class="side-card__title" style="color:var(--brand)">바로 예약</h2>
              <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">{area.name}에서 오시는 길이 궁금하면 전화로 문의하세요.</p>
              <a href="/reservation" class="btn btn-ghost" style="width:100%;justify-content:center;font-size:14px">예약하기</a>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}

// ===== 지역 인덱스 (내원 가능 지역 허브) =====
export const AreaIndexPage: FC = () => {
  const dongs = AREAS.filter((a) => a.type === 'dong')
  const cities = AREAS.filter((a) => a.type === 'city')
  return (
    <Page
      title="오산·동탄·평택 한의원 — 내원 가능 지역 | 정원한의원"
      description="오산 한의원 — 오산 전역과 동탄·평택·화성·병점·수원에서 내원하시는 환자를 진료합니다. 지역별 거리·소요시간 안내."
      path="/area"
      keywords="오산 한의원, 동탄 한의원, 평택 한의원, 화성 한의원, 병점 한의원, 수원 한의원, 오산 다이어트 한의원, 오산 교통사고 한의원"
      jsonLd={[
        organizationSchema(),
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '내원 가능 지역', url: '/area' },
        ]),
      ]}
    >
      <PageHero title="내원 가능 지역" desc="오산 전역과 인근 도시에서 편리하게 내원하실 수 있습니다" breadcrumb={[{ label: '내원 가능 지역' }]} />
      <section class="section">
        <div class="wrap">
          <p class="answer" style="font-size:17px;margin-bottom:30px">
            정원한의원은 <strong>{CLINIC.address.full}</strong>에 위치해, 오산 전역은 물론 동탄·평택·화성·병점·수원에서도
            차량으로 편리하게 내원하실 수 있습니다. 전용주차장을 운영합니다.
          </p>

          <h2 class="area-idx-h">오산시</h2>
          <div class="area-idx-grid">
            {dongs.map((a) => (
              <div class="area-idx-card">
                <strong>{a.name}</strong>
                <span class="area-idx-card__meta">{[a.distance, a.driveTime].filter(Boolean).join(' · ')}</span>
                <div class="area-idx-card__links">
                  {AREA_TREATMENTS.map((t) => (
                    <a href={`/area/${a.slug}-${t.slug}`}>{t.name}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h2 class="area-idx-h" style="margin-top:40px">인근 도시</h2>
          <div class="area-idx-grid">
            {cities.map((a) => (
              <div class="area-idx-card">
                <strong>{a.name}</strong>
                <span class="area-idx-card__meta">{[a.distance, a.driveTime].filter(Boolean).join(' · ')}</span>
                <div class="area-idx-card__links">
                  {AREA_TREATMENTS.map((t) => (
                    <a href={`/area/${a.slug}-${t.slug}`}>{t.name}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  )
}

// ===== 사이트 검색 결과 =====
export interface SearchHit {
  type: 'treatment' | 'column' | 'notice' | 'encyclopedia'
  typeLabel: string
  title: string
  desc: string
  url: string
  icon: string
}

export const SearchPage: FC<{ query: string; hits: SearchHit[] }> = ({ query, hits }) => {
  const grouped: Record<string, SearchHit[]> = {}
  for (const h of hits) {
    ;(grouped[h.typeLabel] = grouped[h.typeLabel] || []).push(h)
  }
  const order = ['진료 안내', '원장 칼럼', '한의학 백과사전', '공지사항']
  const groupKeys = Object.keys(grouped).sort((a, b) => order.indexOf(a) - order.indexOf(b))
  return (
    <Page
      title={query ? `"${query}" 검색 결과 — 오산 정원한의원` : '검색 — 오산 정원한의원'}
      description="오산 정원한의원 사이트 내 진료·칼럼·한방 용어·공지 통합 검색."
      path="/search"
      noindex
    >
      <PageHero title="검색 결과" desc={query ? `"${query}"에 대한 검색 결과입니다` : '검색어를 입력해 주세요'} breadcrumb={[{ label: '검색' }]} />
      <section class="section">
        <div class="wrap-narrow">
          <form class="search-page-form" action="/search" method="get">
            <i class="fas fa-magnifying-glass"></i>
            <input type="search" name="q" value={query} placeholder="증상·진료·칼럼·한방 용어를 검색해 보세요" autocomplete="off" aria-label="검색어" />
            <button type="submit">검색</button>
          </form>

          {query && (
            <p class="search-page-count">
              총 <strong>{hits.length}</strong>건의 결과를 찾았습니다.
            </p>
          )}

          {query && hits.length === 0 && (
            <div class="search-page-empty">
              <i class="fas fa-magnifying-glass"></i>
              <p>“{query}”에 대한 검색 결과가 없습니다.</p>
              <span>다른 키워드로 검색하시거나, 아래 진료 안내를 참고해 보세요.</span>
              <div class="search-page-empty__links">
                <a href="/treatments" class="btn btn-outline"><i class="fas fa-stethoscope"></i> 진료 안내</a>
                <a href="/column" class="btn btn-outline"><i class="fas fa-feather-pointed"></i> 원장 칼럼</a>
                <a href="/encyclopedia" class="btn btn-outline"><i class="fas fa-book"></i> 한방 백과사전</a>
              </div>
            </div>
          )}

          {groupKeys.map((k) => (
            <div class="search-group" data-reveal>
              <h2 class="search-group__head">{k} <span>{grouped[k].length}</span></h2>
              <div class="search-hit-list">
                {grouped[k].map((h) => (
                  <a href={h.url} class="search-hit">
                    <span class="search-hit__icon"><i class={`fas ${h.icon}`}></i></span>
                    <span class="search-hit__body">
                      <strong class="search-hit__title">{h.title}</strong>
                      <span class="search-hit__desc">{h.desc}</span>
                    </span>
                    <i class="fas fa-chevron-right search-hit__arrow"></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  )
}

// ============================================================
// 약재 사진 갤러리 (공개)
//   · 매일 올라오는 약재 사진을 보여주는 갤러리 게시판
//   · 의료광고법: 효능 단정 없이 '약재 소개' 정보 제공 톤
// ============================================================
interface HerbPhotoRow {
  id: number
  image_key: string
  herb_name?: string
  caption?: string
  is_visible?: number
  created_at?: string
  title?: string | null
  body?: string | null
  slug?: string | null
}

export const herbImageUrl = (p: { image_key: string }) => `/api/herb-image/${encodeURIComponent(p.image_key)}`
// 탕전 일자 — created_at(UTC) 을 한국시간으로 바꿔 YYYY.MM.DD 로 (구분자 인자로 변경 가능)
export function herbDate(p: { created_at?: string | null }, sep = '.'): string {
  const raw = (p.created_at || '').trim()
  if (!raw) return ''
  const d = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return raw.slice(0, 10).replace(/-/g, sep)
  const k = new Date(d.getTime() + 9 * 3600 * 1000)
  const mm = String(k.getUTCMonth() + 1).padStart(2, '0'), dd = String(k.getUTCDate()).padStart(2, '0')
  return `${k.getUTCFullYear()}${sep}${mm}${sep}${dd}`
}
// 본문 실제 글자 수 (마크업·URL 제외). 300자 미만이면 '상세 미작성'으로 보고 noindex + 사이트맵 제외
export const HERB_THIN_LIMIT = 300
export const herbBodyLength = (p: { body?: string | null }) => herbPlainText(p.body, 100000).length
export const herbIsThin = (p: { body?: string | null }) => herbBodyLength(p) < HERB_THIN_LIMIT
// 검색용 고유 제목: "YYYY.MM.DD {이름/제목} ({짧은 캡션}) (n번째)"
//   · 같은 이름(김ㅇㅇ님 한약)이 수십 건 반복돼 <title> 중복으로 색인 제외되던 문제 대응
//   · seq: 같은 날 같은 이름의 몇 번째 사진인지 (1이면 생략)
export function herbSeoTitle(p: { title?: string | null; herb_name?: string | null; caption?: string | null; created_at?: string | null }, seq = 1): string {
  const date = herbDate(p)
  const t = (p.title || '').trim()
  const n = (p.herb_name || '').trim()
  const nameIsDate = /^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/.test(n)
  let base = t ? t : n && !nameIsDate ? (n.includes('한약') ? n : `${n} 달인 한약`) : '달인 한약'
  const cap = (p.caption || '').replace(/\s+/g, ' ').trim()
  if (cap && cap.length <= 24 && !base.includes(cap) && !t) base += ` (${cap})`
  const parts = [date, base]
  if (seq > 1) parts.push(`(${seq}번째)`)
  return parts.filter(Boolean).join(' ')
}
export const herbPath = (p: { id: number; slug?: string | null }) => `/herbs/${p.slug ? encodeURIComponent(p.slug) : p.id}`
// 제목 폴백: 제목 > "{탕전 일자/이름} 달인 한약" (이미 '한약'이 들어 있으면 그대로) > "오늘 달인 한약"
export function herbTitle(p: { title?: string | null; herb_name?: string | null }): string {
  const t = (p.title || '').trim()
  if (t) return t
  const n = (p.herb_name || '').trim()
  if (!n) return '오늘 달인 한약'
  return n.includes('한약') ? n : `${n} 달인 한약`
}

// ---- 본문 경량 마크업 → 안전한 HTML ----
//   · HTML 특수문자를 먼저 전부 이스케이프한 뒤 변환하므로 원본에 태그를 넣어도 실행되지 않음
//   · 빈 줄 = 문단, 줄바꿈 = <br>
//   · ![설명](주소) 또는 이미지 주소만 있는 줄 = 사진
//   · [글자](주소) = 링크, http(s):// 주소 = 자동 링크 (외부는 새 창 + noopener)
const HERB_ESC = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const herbSafeHref = (u: string): string => {
  const v = (u || '').trim()
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v
  if (/^\/(?!\/)/.test(v)) return v
  return ''
}
const herbIsImage = (u: string) => /^\/api\/(herb|content|case)-image\//.test(u) || /\.(jpe?g|png|gif|webp|avif)(\?[^\s]*)?$/i.test(u)
const herbAnchor = (href: string, label: string) => {
  const ext = /^https?:\/\//i.test(href) && !href.startsWith(CLINIC.domain)
  return `<a href="${HERB_ESC(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`
}
const herbInline = (line: string): string => {
  // 한 번의 치환으로 사진 → 링크 → 자동링크를 처리해 중복 변환을 막는다
  const re = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|https?:\/\/[^\s<]+/g
  return line.replace(re, (m, imgAlt, imgUrl, lnkTxt, lnkUrl) => {
    if (imgUrl !== undefined) {
      const href = herbSafeHref(imgUrl)
      return href ? `<img class="herb-detail__inline" src="${HERB_ESC(href)}" alt="${HERB_ESC(imgAlt || '')}" loading="lazy" />` : HERB_ESC(m)
    }
    if (lnkUrl !== undefined) {
      const href = herbSafeHref(lnkUrl)
      return href ? herbAnchor(href, HERB_ESC(lnkTxt)) : HERB_ESC(m)
    }
    const trail = m.match(/[.,;:!?)\]]+$/)
    const url = trail ? m.slice(0, -trail[0].length) : m
    return herbAnchor(url, HERB_ESC(url)) + HERB_ESC(trail ? trail[0] : '')
  })
}
export function formatHerbBody(raw: string | null | undefined): string {
  const text = (raw || '').replace(/\r\n?/g, '\n').trim()
  if (!text) return ''
  const figure = (src: string, alt: string) =>
    `<figure class="herb-detail__fig"><img src="${HERB_ESC(src)}" alt="${HERB_ESC(alt)}" loading="lazy" />${alt ? `<figcaption>${HERB_ESC(alt)}</figcaption>` : ''}</figure>`
  return text.split(/\n{2,}/).map((block) => {
    const out: string[] = []
    let para: string[] = []
    const flush = () => { if (para.length) { out.push('<p>' + para.map((l) => herbInline(HERB_ESC(l))).join('<br />') + '</p>'); para = [] } }
    for (const line of block.split('\n')) {
      const t = line.trim()
      const m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
      if (m && herbSafeHref(m[2])) { flush(); out.push(figure(m[2], m[1] || '')); continue }
      if (/^\S+$/.test(t) && herbSafeHref(t) && herbIsImage(t)) { flush(); out.push(figure(t, '')); continue }
      if (t) para.push(t)
    }
    flush()
    return out.join('')
  }).join('\n')
}
// 메타 설명용: 마크업 제거 후 앞 120자
export function herbPlainText(raw: string | null | undefined, max = 120): string {
  const t = (raw || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/(^|\s)\/api\/\S+/g, ' ')
    .replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max).trim() + '…' : t
}

export const HerbGalleryPage: FC<{ photos: HerbPhotoRow[] }> = ({ photos }) => (
  <Page
    title="오늘도 달였습니다 — 오산 정원한의원 오늘 달인 한약"
    description="정원한의원 탕전실에서 매일 나가는 한약입니다. 달인 날짜 그대로, 연출 없이 올립니다. (효능·효과는 개인·체질에 따라 다를 수 있습니다.)"
    path="/herbs"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '오늘 달인 한약', url: '/herbs' }])}
  >
    <PageHero
      title="오늘도 달였습니다"
      desc="정원한의원 탕전실에서 매일 나가는 한약입니다. 달인 날짜 그대로, 연출 없이 올립니다."
      breadcrumb={[{ label: '콘텐츠' }, { label: '오늘 달인 한약' }]}
    />
    <section class="section">
      <div class="wrap">
        {photos.length === 0 ? (
          <div class="text-center" style="padding:80px 0;color:var(--ink-3)">
            <i class="fas fa-seedling" style="font-size:52px;opacity:0.3"></i>
            <p style="margin-top:18px">아직 등록된 탕전 사진이 없습니다.</p>
          </div>
        ) : (
          <div class="herb-gallery">
            {photos.map((p) => (
              <figure class="herb-card" data-reveal>
                <a class="herb-card__link" href={herbPath(p)} aria-label={`${herbTitle(p)} 상세 보기`}>
                  <div class="herb-card__img">
                    <img
                      src={herbImageUrl(p)}
                      alt={p.herb_name ? `${p.herb_name} 약재 사진` : '한약재 사진'}
                      loading="lazy"
                    />
                  </div>
                  <figcaption class="herb-card__cap">
                    {p.title && <strong class="herb-card__title">{p.title}</strong>}
                    {p.herb_name && <strong class={p.title ? 'herb-card__name herb-card__name--sub' : 'herb-card__name'}>{p.herb_name}</strong>}
                    {p.caption && <span class="herb-card__desc">{p.caption}</span>}
                    {p.created_at && <span class="herb-card__date">{herbDate(p)}</span>}
                    <span class="herb-card__more">자세히 보기 <i class="fas fa-chevron-right"></i></span>
                  </figcaption>
                </a>
              </figure>
            ))}
          </div>
        )}
        <p class="herb-gallery__note">
          <i class="fas fa-circle-info"></i> 소개하는 약재의 효능·효과는 체질과 상태에 따라 개인차가 있을 수 있으며, 처방은 반드시 의료진 진료 후 이루어집니다.
        </p>
      </div>
    </section>
  </Page>
)

// ===== 오늘 달인 한약 상세 (/herbs/:id 또는 /herbs/:slug) =====
//   · 원장이 배송 한약과 함께 환자에게 보내는 안내 페이지
//   · 본문은 formatHerbBody 로 이스케이프 후 렌더 (사진·링크만 허용)
//   · title/H1/설명/JSON-LD 는 herbSeoTitle 로 URL마다 고유하게 (날짜 + 이름 + n번째)
//   · 본문 300자 미만(상세 미작성)은 noindex,follow — 방문자·환자에게는 그대로 보임
export const HerbDetailPage: FC<{ photo: HerbPhotoRow; prev?: HerbPhotoRow | null; next?: HerbPhotoRow | null; seq?: number }> = ({ photo: p, prev, next, seq = 1 }) => {
  const title = herbSeoTitle(p, seq)
  const name = herbTitle(p)
  // 설명문용 주어: 제목 > 이름(날짜 모양이면 제외) > '한약'
  const subject = (p.title || '').trim() || ((p.herb_name || '').trim().match(/^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/) ? '' : (p.herb_name || '').trim()) || '한약'
  const path = herbPath(p)
  const img = herbImageUrl(p)
  const date = herbDate(p)
  const plain = herbPlainText(p.body, 80)
  const thin = herbIsThin(p)
  const description = plain
    ? `${date} 달인 ${subject}. ${plain}`
    : `${date} 정원한의원 탕전실에서 달인 ${subject}입니다.${p.caption ? ' ' + p.caption : ''} 효능·효과는 개인·체질에 따라 다를 수 있습니다.`
  const bodyHtml = formatHerbBody(p.body)
  const iso = (v?: string | null) => {
    const raw = (v || '').trim()
    const d = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z')
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  }
  return (
    <Page
      title={`${title} — 오늘 달인 한약 | 오산 정원한의원`}
      description={metaTrim(description, 150)}
      path={path}
      ogType="article"
      ogImage={img}
      noindex={thin}
      jsonLd={[
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '오늘 달인 한약', url: '/herbs' },
          { name: title, url: path },
        ]),
        articleSchema({
          title,
          description: metaTrim(description, 150),
          url: path,
          datePublished: iso(p.created_at),
          dateModified: iso(p.created_at),
          author: CLINIC.nameFull,
          image: img,
        }),
      ]}
    >
      <PageHero title={title} breadcrumb={[{ label: '오늘 달인 한약', href: '/herbs' }, { label: title }]} />
      <section class="section">
        <div class="wrap">
          <article class="herb-detail" data-reveal>
            <div class="herb-detail__hero">
              <img src={img} alt={p.herb_name ? `${p.herb_name} 약재 사진` : '한약재 사진'} fetchpriority="high" />
            </div>
            <div class="herb-detail__meta">
              {date && <span><i class="far fa-calendar"></i> {date}</span>}
              {p.herb_name && p.herb_name !== name && <span><i class="fas fa-seedling"></i> {p.herb_name}</span>}
              <span><i class="fas fa-house-medical"></i> 정원한의원 탕전실</span>
            </div>
            {p.caption && <p class="herb-detail__caption">{p.caption}</p>}
            {bodyHtml
              ? <div class="herb-detail__body" dangerouslySetInnerHTML={{ __html: bodyHtml }}></div>
              : <p class="herb-detail__empty">정원한의원 탕전실에서 달인 한약입니다. 복용 방법과 궁금한 점은 진료 시 안내드린 내용을 참고해 주세요.</p>}
            <p class="herb-gallery__note" style="text-align:left">
              <i class="fas fa-circle-info"></i> 한약의 효능·효과는 체질과 상태에 따라 개인차가 있을 수 있으며, 처방과 복용은 반드시 의료진 진료 후 안내에 따라 주세요.
            </p>
            <nav class="herb-detail__nav" aria-label="이전·다음 한약">
              <div class="prev">{prev && <a href={herbPath(prev)}><i class="fas fa-chevron-left"></i> {herbTitle(prev)}</a>}</div>
              <a href="/herbs" class="btn btn-ghost btn-sm"><i class="fas fa-list"></i> 목록으로</a>
              <div class="next">{next && <a href={herbPath(next)}>{herbTitle(next)} <i class="fas fa-chevron-right"></i></a>}</div>
            </nav>
          </article>
        </div>
      </section>
    </Page>
  )
}

// ============================================================
// 콘텐츠 영상 (유튜브) — 공개
//   · YouTube API 없이 admin에서 등록한 영상 URL을 썸네일 그리드로 노출
//   · 2채널(가고싶은 한의원 이야기 / 다이어트 멘토 김은아) 안내 배너
// ============================================================
interface VideoRow {
  id: number
  title: string
  youtube_url: string
  video_id: string
  channel?: string
  description?: string
  is_visible?: number
  created_at?: string
}

const CHANNEL_META: Record<string, { name: string; url: string; handle: string }> = {
  garden: { name: '가고싶은 한의원 이야기', url: CLINIC.social.youtube, handle: '@garden_365clinic' },
  diet: { name: '다이어트 멘토 김은아', url: (CLINIC.social as any).youtubeDiet || 'https://www.youtube.com/@diet_mentor_kim', handle: '@diet_mentor_kim' },
}

export const VideoPage: FC<{ videos: VideoRow[] }> = ({ videos }) => (
  <Page
    title="영상 콘텐츠 — 오산 정원한의원"
    description="오산 정원한의원의 유튜브 영상을 모았습니다. 한의원 이야기와 다이어트·건강 관리 정보를 영상으로 만나보세요. (건강 정보는 참고용이며 개인차가 있을 수 있습니다.)"
    path="/videos"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '영상', url: '/videos' }])}
  >
    <PageHero
      title="영상 콘텐츠"
      desc="정원한의원의 유튜브 영상으로 한의원 이야기와 건강 정보를 만나보세요."
      breadcrumb={[{ label: '콘텐츠' }, { label: '영상' }]}
    />

    {/* 채널 안내 배너 */}
    <section class="section" style="padding-bottom:0">
      <div class="wrap">
        <div class="video-channels">
          {Object.entries(CHANNEL_META).map(([, ch]) => (
            <a href={ch.url} target="_blank" rel="noopener" class="video-channel-card">
              <span class="video-channel-card__icon"><i class="fab fa-youtube"></i></span>
              <span class="video-channel-card__body">
                <strong>{ch.name}</strong>
                <span class="video-channel-card__handle">{ch.handle}</span>
              </span>
              <span class="video-channel-card__go">채널 바로가기 <i class="fas fa-arrow-up-right-from-square"></i></span>
            </a>
          ))}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        {videos.length === 0 ? (
          <div class="text-center" style="padding:70px 0;color:var(--ink-3)">
            <i class="fab fa-youtube" style="font-size:52px;opacity:0.3"></i>
            <p style="margin-top:18px">아직 등록된 영상이 없습니다. 위 채널에서 최신 영상을 확인해 주세요.</p>
          </div>
        ) : (
          <div class="video-grid">
            {videos.map((v) => (
              <a
                href={`https://www.youtube.com/watch?v=${v.video_id}`}
                target="_blank"
                rel="noopener"
                class="video-card"
                data-reveal
              >
                <span class="video-card__thumb">
                  <img
                    src={`https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`}
                    alt={`${v.title} 영상 썸네일`}
                    loading="lazy"
                  />
                  <span class="video-card__play"><i class="fas fa-play"></i></span>
                </span>
                <span class="video-card__body">
                  <strong class="video-card__title">{v.title}</strong>
                  {v.description && <span class="video-card__desc">{v.description}</span>}
                  <span class="video-card__channel">
                    <i class="fab fa-youtube"></i> {(CHANNEL_META[v.channel || 'garden'] || CHANNEL_META.garden).name}
                  </span>
                </span>
              </a>
            ))}
          </div>
        )}
        <p class="herb-gallery__note">
          <i class="fas fa-circle-info"></i> 영상에서 소개하는 건강 정보는 참고용이며, 효과와 적합한 치료는 체질·상태에 따라 개인차가 있을 수 있습니다. 정확한 진단·치료는 의료진 진료 후 이루어집니다.
        </p>
      </div>
    </section>
  </Page>
)
