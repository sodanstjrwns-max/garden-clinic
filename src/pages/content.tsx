import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { getTreatment, TREATMENTS } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { autoLinkTerms } from '../data/encyclopedia'
import { getArea, AREA_TREATMENTS, AREAS } from '../data/areas'
import { CLINIC } from '../data/clinic'
import { articleSchema, breadcrumbSchema, faqPageSchema, cityAreaSchema, organizationSchema, localAreaClinicSchema, howToSchema, speakableSchema } from '../lib/schema'

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
export const ColumnListPage: FC<{ columns: ColumnRow[] }> = ({ columns }) => (
  <Page
    title="원장 칼럼 — 한방 건강 이야기 | 오산 정원한의원"
    description="오산 정원한의원 원장이 직접 전하는 한방 건강 이야기. 비만·체질·교통사고 후유증 등 진료 현장의 이야기를 담았습니다."
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
          <div class="col-grid">
            {columns.map((col) => (
              <a class="col-card" href={`/column/${col.slug}`} data-reveal>
                <div class="col-card__thumb">
                  {col.thumbnail ? <img src={`/api/column-image/${col.id}`} alt={col.title} loading="lazy" /> : <i class="fas fa-feather-pointed"></i>}
                </div>
                <div class="col-card__body">
                  {col.category && <div class="col-card__cat">{getTreatment(col.category)?.shortName || col.category}</div>}
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
        )}
      </div>
    </section>
  </Page>
)

// ===== 칼럼 상세 =====
export const ColumnDetailPage: FC<{ column: ColumnRow }> = ({ column: col }) => {
  const tx = col.category ? getTreatment(col.category) : null
  const author = col.author ? getDoctor(col.author) : null
  const ogImg = col.thumbnail ? `/api/column-image/${col.id}` : undefined
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
            <div class="article" dangerouslySetInnerHTML={{ __html: autoLinkTerms(col.body, 8) }}></div>
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
                <h4>작성자</h4>
                <a href={`/doctors/${author.slug}`} class="doc-mini"><span class="doc-mini__av"><i class="fas fa-user-doctor"></i></span><strong>{author.name} {author.title}</strong></a>
              </div>
            )}
            {tx && (
              <div class="side-card">
                <h4>관련 진료</h4>
                <a href={`/treatments/${tx.slug}`} class="side-link">{tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              </div>
            )}
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h4 style="color:var(--brand)">진료 예약</h4>
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
    description="오산 정원한의원 공지사항. 진료 일정, 휴진 안내 등 병원 소식을 전합니다."
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
              <img class="notice-detail__img" src={`/api/notice-image/${n.id}`} alt={n.title} />
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
      description={`${area.full}에서 가까운 한의원을 찾으신다면, 오산 정원한의원의 ${tx.shortName} 진료를 만나보세요. ${area.full}에서 ${accessLine || '가까운 거리'}. ${tx.summary}`}
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
              <h4>{tx.shortName} 진료</h4>
              <a href={`/treatments/${tx.slug}`} class="side-link">진료 자세히 보기<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
            </div>
            <div class="side-card">
              <h4>다른 지역 {tx.shortName}</h4>
              {otherAreas.map((a) => (
                <a href={`/area/${a.slug}-${txSlug}`} class="side-link">{a.name} {tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              ))}
            </div>
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h4 style="color:var(--brand)">바로 예약</h4>
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
