import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { getTreatment, TREATMENTS } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { autoLinkTerms } from '../data/encyclopedia'
import { getArea, AREA_TREATMENTS, AREAS } from '../data/areas'
import { CLINIC } from '../data/clinic'
import { articleSchema, breadcrumbSchema, faqPageSchema, cityAreaSchema, organizationSchema } from '../lib/schema'

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
  created_at?: string
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
  return (
    <Page
      title={`${col.title} — 원장 칼럼 | 오산 정원한의원`}
      description={col.meta_description || col.excerpt || col.title}
      path={`/column/${col.slug}`}
      ogType="article"
      jsonLd={[
        articleSchema({
          title: col.title,
          description: col.meta_description || col.excerpt || col.title,
          url: `/column/${col.slug}`,
          datePublished: col.published_at || new Date().toISOString(),
          dateModified: col.updated_at || col.published_at || new Date().toISOString(),
          author: author?.name || '정원한의원',
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
            <div style="display:flex;gap:14px;align-items:center;margin-bottom:30px;color:var(--ink-3);font-size:14px">
              <i class="fas fa-user-pen"></i>
              {author ? <a href={`/doctors/${author.slug}`} style="color:var(--brand);font-weight:700">{author.name} {author.title}</a> : '정원한의원'}
              {col.published_at && <span>· {col.published_at.slice(0, 10)}</span>}
            </div>
            <div class="article" dangerouslySetInnerHTML={{ __html: autoLinkTerms(col.body, 8) }}></div>
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
export const NoticeDetailPage: FC<{ notice: NoticeRow }> = ({ notice: n }) => (
  <Page title={`${n.title} — 공지사항 | 오산 정원한의원`} description={n.title} path={`/notice/${n.id}`}>
    <PageHero title={n.title} breadcrumb={[{ label: '공지사항', href: '/notice' }, { label: n.title }]} />
    <section class="section">
      <div class="wrap-narrow">
        <div class="article" data-reveal>
          {n.image && <img src={`/api/notice-image/${n.id}`} alt={n.title} style="border-radius:14px;margin-bottom:24px" />}
          <div dangerouslySetInnerHTML={{ __html: n.body.replace(/\n/g, '<br/>') }}></div>
        </div>
        <a href="/notice" class="btn btn-ghost" style="margin-top:30px"><i class="fas fa-arrow-left"></i> 목록으로</a>
      </div>
    </section>
  </Page>
)

// ===== 지역 SEO 페이지 =====
export const AreaPage: FC<{ areaSlug: string; txSlug: string }> = ({ areaSlug, txSlug }) => {
  const area = getArea(areaSlug)
  const tx = getTreatment(txSlug)
  if (!area || !tx) return null
  const areaTx = AREA_TREATMENTS.find((a) => a.slug === txSlug)
  const title = `${area.name} ${areaTx?.name || tx.shortName} 한의원 — 정원한의원 오산`
  const otherAreas = AREAS.filter((a) => a.slug !== areaSlug).slice(0, 6)

  const faqs = [
    { q: `${area.name}에서 정원한의원까지 어떻게 가나요?`, a: area.access },
    { q: `${area.name}에서 ${tx.shortName} 진료를 받을 수 있나요?`, a: `네, 정원한의원은 ${area.full} 인근에서 내원하시는 환자분께 ${tx.shortName} 진료를 제공합니다. ${tx.summary}` },
  ]

  return (
    <Page
      title={title}
      description={`${area.full}에서 가까운 한의원을 찾으신다면, 오산 정원한의원의 ${tx.shortName} 진료를 만나보세요. ${tx.summary}`}
      path={`/area/${areaSlug}-${txSlug}`}
      jsonLd={[
        organizationSchema(),
        cityAreaSchema(area.full),
        faqPageSchema(faqs),
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: `${area.name} ${tx.shortName}`, url: `/area/${areaSlug}-${txSlug}` },
        ]),
      ]}
    >
      <PageHero title={`${area.name} ${tx.shortName}`} desc={`${area.full}에서 가까운 한방 ${tx.shortName} 진료`} breadcrumb={[{ label: `${area.name} ${tx.shortName}` }]} />
      <section class="section">
        <div class="wrap detail-layout">
          <div class="article" data-reveal>
            <h2>{area.name}에서 {tx.shortName}을(를) 찾으신다면</h2>
            <div class="answer">{area.access}</div>
            <p dangerouslySetInnerHTML={{ __html: autoLinkTerms(tx.summary) }}></p>
            <p>
              정원한의원은 {CLINIC.address.full}에 위치해, {area.full}에서 차량으로 편리하게
              내원하실 수 있습니다. 전용주차장을 운영하며, 만차 시 인근 공영주차장 이용 후 2시간
              주차를 지원해 드립니다.
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
              <h4>다른 지역</h4>
              {otherAreas.map((a) => (
                <a href={`/area/${a.slug}-${txSlug}`} class="side-link">{a.name} {tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}
