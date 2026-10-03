import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CORE_TREATMENTS, GENERAL_TREATMENTS, getTreatment } from '../data/treatments'
import { ADDRESS_SUGGESTIONS } from '../data/areas'
import { caseGraphSchema, collectionGraphSchema } from '../lib/schema'
import { getDoctor } from '../data/doctors'
import { metaDescription, isoDate, ymd } from '../lib/article-seo'
import { Pager, AuthorBox } from './content'

export interface CaseRow {
  id: number
  title: string
  description?: string
  age_group?: string
  gender?: string
  category?: string
  area?: string
  doctor?: string
  duration?: string
  pano_before?: string
  pano_after?: string
  intra_before?: string
  intra_after?: string
  views?: number
  created_at?: string
}

export const CASE_PAGE_SIZE = 18
const clean = (v?: string | null) => String(v || '').replace(/\s+/g, ' ').trim()

// 구조 필드(진료명·연령대·성별·기간·담당)만으로 만든 사례 요약 — 데이터에 있는 값만 사용
export function caseSummary(c: CaseRow): string {
  const tx = c.category ? getTreatment(c.category) : null
  const doc = c.doctor ? getDoctor(c.doctor) : null
  const who = [clean(c.age_group), clean(c.gender)].filter(Boolean).join(' ')
  const parts = [
    tx ? `${tx.name} 사례` : '한방 치료 사례',
    who ? `${who} 환자` : '',
    clean(c.duration) ? `치료 기간 ${clean(c.duration)}` : '',
    doc ? `담당 ${doc.name} ${doc.title}` : '',
  ].filter(Boolean)
  return parts.join(' · ') + '.'
}
const caseTxName = (c: CaseRow) => (c.category ? getTreatment(c.category)?.shortName || '' : '')

// ===== 비포애프터 갤러리 =====
export const CaseGalleryPage: FC<{
  cases: CaseRow[]
  loggedIn: boolean
  activeCat?: string
  activeDoctor?: string
  page?: number
  totalPages?: number
  catCounts?: Record<string, number>
}> = ({ cases, loggedIn, activeCat, activeDoctor, page = 1, totalPages = 1, catCounts }) => {
  const allTx = [...CORE_TREATMENTS, ...GENERAL_TREATMENTS].filter((t) => !catCounts || catCounts[t.slug] || t.slug === activeCat)
  const filterDoc = activeDoctor ? getDoctor(activeDoctor) : undefined
  const activeTx = activeCat ? getTreatment(activeCat) : undefined
  // 원장 필터는 진료 필터의 부분집합 → 정식 주소는 원장 필터를 뺀 목록
  const q: string[] = []
  if (activeCat) q.push(`cat=${encodeURIComponent(activeCat)}`)
  if (page > 1) q.push(`page=${page}`)
  const path = '/cases/gallery' + (q.length ? `?${q.join('&')}` : '')
  const name = activeTx ? `${activeTx.shortName} 치료 사례` : '치료 사례'
  const description = activeTx
    ? `오산 정원한의원 ${activeTx.name} 치료 사례 모음. 내원 당시 상태와 치료 과정, 치료 기간을 사례별로 정리했습니다. 치료 후 사진은 회원 로그인 후 열람 가능합니다.`
    : '오산 정원한의원의 한방 치료 사례. 다이어트·피부·신경계·소아 등 진료과목별 실제 치료 과정과 기간을 확인하세요. 치료 후 사진은 회원 로그인 후 열람 가능합니다.'
  return (
    <Page
      title={`${name}${page > 1 ? ` (${page}쪽)` : ''} — 오산 정원한의원`}
      description={description}
      path={path}
      jsonLd={collectionGraphSchema({
        url: path,
        name,
        description,
        crumbs: [
          { name: '홈', url: '/' },
          { name: '치료 사례', url: '/cases/gallery' },
          ...(activeTx ? [{ name: activeTx.shortName, url: `/cases/gallery?cat=${activeTx.slug}` }] : []),
        ],
        items: cases.map((c) => ({ name: clean(c.title), url: `/cases/${c.id}` })),
        startIndex: (page - 1) * CASE_PAGE_SIZE,
      })}
    >
      <PageHero
        title="치료 사례"
        desc="실제 치료 사례로 확인하는 정원한의원의 진료. 치료 후 사진은 로그인 후 열람하실 수 있습니다."
        breadcrumb={[{ label: '콘텐츠' }, { label: '치료 사례' }]}
      />
      <section class="section">
        <div class="wrap">
          {/* 카테고리 필터 */}
          <div class="enc-cats" data-reveal>
            <a class={`enc-cat ${!activeCat ? 'active' : ''}`} href="/cases/gallery">전체</a>
            {allTx.map((t) => (
              <a class={`enc-cat ${activeCat === t.slug ? 'active' : ''}`} href={`/cases/gallery?cat=${t.slug}`}>{t.shortName}</a>
            ))}
          </div>

          {filterDoc && (
            <div class="summary-box" style="margin-bottom:32px" data-reveal>
              <h2 style="font-size:17px"><i class="fas fa-user-doctor" style="margin-right:8px"></i>{filterDoc.name} 원장 치료 사례</h2>
              <ul style="grid-template-columns:1fr">
                <li>{filterDoc.specialty} — {filterDoc.name} 원장이 직접 진료한 사례만 모아 보고 있습니다.</li>
              </ul>
              <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
                <a href={`/doctors/${filterDoc.slug}`} class="btn btn-light"><i class="fas fa-id-badge"></i> 원장 프로필 보기</a>
                <a href="/cases/gallery" class="btn btn-light"><i class="fas fa-rotate-left"></i> 전체 사례 보기</a>
              </div>
            </div>
          )}

          {!loggedIn && (
            <div class="summary-box summary-box--dark" style="margin-bottom:40px" data-reveal>
              <h2 style="font-size:18px"><i class="fas fa-lock" style="margin-right:8px"></i>치료 후 사진 안내</h2>
              <ul style="grid-template-columns:1fr">
                <li>의료법 준수를 위해 치료 후(After) 사진은 회원 로그인 후 열람하실 수 있습니다.</li>
              </ul>
              <a href="/auth/login" class="btn btn-light" style="margin-top:16px">로그인하고 전체 보기</a>
            </div>
          )}

          {cases.length === 0 ? (
            <div class="text-center" style="padding:60px 0;color:var(--ink-3)">
              <i class="fas fa-images" style="font-size:48px;opacity:0.3"></i>
              <p style="margin-top:16px">등록된 사례가 준비 중입니다.</p>
            </div>
          ) : (
            <div class="case-grid">
              {cases.map((c) => (
                <a class="case-card" href={`/cases/${c.id}`} data-reveal>
                  <div class="case-card__media">
                    {c.pano_before || c.intra_before ? (
                      <img src={`/api/case-image/${c.id}/before`} alt={`${caseTxName(c) || clean(c.title)} 치료 전`} loading="lazy" decoding="async" />
                    ) : (
                      <div style="display:grid;place-items:center;height:100%;color:var(--ink-3)"><i class="fas fa-image"></i></div>
                    )}
                    {!loggedIn && (
                      <div class="case-locked">
                        <i class="fas fa-lock"></i>
                        <p>치료 후 사진은<br />로그인 후 확인</p>
                      </div>
                    )}
                  </div>
                  <div class="case-card__body">
                    {c.category && <div class="case-card__cat">{getTreatment(c.category)?.shortName || c.category}</div>}
                    <div class="case-card__title">{clean(c.title)}</div>
                    <div class="case-card__meta">
                      {c.age_group && <span>{c.age_group}</span>}
                      {c.gender && <span>{c.gender}</span>}
                      {c.duration && <span>{c.duration}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          <Pager base="/cases/gallery" cat={activeCat} page={page} totalPages={totalPages} label="치료 사례 목록" />
        </div>
      </section>
    </Page>
  )
}

// ===== 케이스 상세 (전후 슬라이더) =====
export const CaseDetailPage: FC<{
  caseData: CaseRow
  loggedIn: boolean
  relatedCases?: CaseRow[]
  relatedColumns?: { slug: string; title: string; published_at?: string }[]
}> = ({ caseData: c, loggedIn, relatedCases = [], relatedColumns = [] }) => {
  const tx = c.category ? getTreatment(c.category) : null
  const title = clean(c.title)
  const summary = caseSummary(c)
  const txLabel = tx ? tx.shortName : '한방 치료'
  const dur = clean(c.duration)
  // <title>: {진료명} 사례 — {사례 제목}{, 기간} (환자 식별정보 없음)
  const head = `${txLabel} 사례 — ${title}${dur && !title.includes(dur) ? `, ${dur}` : ''}`
  const description = metaDescription(c.description ? `${summary} ${clean(c.description)}` : '', summary + ' 오산 정원한의원 치료 사례입니다. 치료 효과는 개인에 따라 다를 수 있습니다.')
  const created = isoDate(c.created_at)
  return (
    <Page
      title={`${head} | 오산 정원한의원`.length <= 60 ? `${head} | 오산 정원한의원` : `${head.length > 52 ? head.slice(0, 51).trimEnd() + '…' : head} | 정원한의원`}
      description={description}
      path={`/cases/${c.id}`}
      ogType="article"
      publishedTime={created}
      jsonLd={caseGraphSchema({
        url: `/cases/${c.id}`,
        title,
        description,
        dateCreated: created,
        doctorSlug: c.doctor || undefined,
        treatmentSlug: tx?.slug,
        treatmentName: tx?.name,
      })}
    >
      <PageHero
        title={title}
        desc={tx ? tx.shortName : ''}
        breadcrumb={[
          { label: '치료 사례', href: '/cases/gallery' },
          ...(tx ? [{ label: tx.shortName, href: `/cases/gallery?cat=${tx.slug}` }] : []),
          { label: title },
        ]}
      />
      <section class="section">
        <div class="wrap detail-layout">
          <div data-reveal>
            <div class="answer-summary" role="note">
              <strong class="answer-summary__label">사례 요약</strong>
              <p>{summary}</p>
            </div>
            {/* 전신 전후 */}
            {(c.pano_before || c.pano_after) && (
              <div style="margin-bottom:30px">
                <h2 style="font-size:18px;color:var(--brand);margin-bottom:14px">치료 전 / 치료 후</h2>
                {loggedIn && c.pano_before && c.pano_after ? (
                  <div class="ba-slider">
                    <img src={`/api/case-image/${c.id}/pano_before`} alt={`${txLabel} 치료 전`} loading="lazy" decoding="async" />
                    <img class="ba-slider__after" src={`/api/case-image/${c.id}/pano_after`} alt={`${txLabel} 치료 후`} loading="lazy" decoding="async" />
                    <div class="ba-handle"></div>
                    <span class="ba-label before">BEFORE</span>
                    <span class="ba-label after">AFTER</span>
                  </div>
                ) : (
                  <div class="case-card__media" style="border-radius:14px">
                    {c.pano_before && <img src={`/api/case-image/${c.id}/pano_before`} alt={`${txLabel} 치료 전`} loading="lazy" decoding="async" />}
                    {!loggedIn && <div class="case-locked"><i class="fas fa-lock"></i><p>치료 후 사진은 로그인 후 확인</p><a href="/auth/login" class="btn btn-light" style="font-size:13px">로그인</a></div>}
                  </div>
                )}
              </div>
            )}
            {/* 부위 상세 전후 (항목명 없이) */}
            {(c.intra_before || c.intra_after) && (
              <div style="margin-bottom:30px">
                {loggedIn && c.intra_before && c.intra_after ? (
                  <div class="ba-slider">
                    <img src={`/api/case-image/${c.id}/intra_before`} alt={`${txLabel} 치료 전`} loading="lazy" decoding="async" />
                    <img class="ba-slider__after" src={`/api/case-image/${c.id}/intra_after`} alt={`${txLabel} 치료 후`} loading="lazy" decoding="async" />
                    <div class="ba-handle"></div>
                    <span class="ba-label before">BEFORE</span>
                    <span class="ba-label after">AFTER</span>
                  </div>
                ) : (
                  <div class="case-card__media" style="border-radius:14px">
                    {c.intra_before && <img src={`/api/case-image/${c.id}/intra_before`} alt={`${txLabel} 치료 전`} loading="lazy" decoding="async" />}
                    {!loggedIn && <div class="case-locked"><i class="fas fa-lock"></i><p>치료 후 사진은 로그인 후 확인</p></div>}
                  </div>
                )}
              </div>
            )}

            {c.description && (
              <div class="article"><h2>치료 설명</h2><p>{c.description}</p></div>
            )}
            <p style="font-size:13px;color:var(--ink-3);margin-top:24px;background:var(--paper-2);padding:14px;border-radius:10px">
              ※ 본 사례는 해당 환자의 치료 경과로, 치료 효과와 반응은 개인에 따라 다를 수 있습니다. 전후 사진은 같은 촬영 조건을 기준으로 하며 개인차가 있습니다.
            </p>
            <AuthorBox slug={c.doctor || undefined} reviewed={ymd(c.created_at)} label="담당 한의사" />
            {(tx || relatedColumns.length > 0 || relatedCases.length > 0) && (
              <div class="col-related">
                {tx && (
                  <div class="col-related__block">
                    <h2 class="col-related__title">관련 진료</h2>
                    <a href={`/treatments/${tx.slug}`} class="col-related__tx">
                      <i class={`fas ${tx.icon}`}></i>
                      <span><strong>{tx.name}</strong><small>{tx.tagline}</small></span>
                      <i class="fas fa-arrow-right"></i>
                    </a>
                  </div>
                )}
                {relatedColumns.length > 0 && (
                  <div class="col-related__block">
                    <h2 class="col-related__title">{tx ? `${tx.shortName} 관련 칼럼` : '관련 칼럼'}</h2>
                    <ul class="col-related__list">
                      {relatedColumns.map((r) => (
                        <li><a href={`/column/${r.slug}`}>{r.title}</a>{r.published_at && <time datetime={ymd(r.published_at)}>{ymd(r.published_at)}</time>}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {relatedCases.length > 0 && (
                  <div class="col-related__block">
                    <h2 class="col-related__title">{tx ? `다른 ${tx.shortName} 사례` : '다른 사례'}</h2>
                    <ul class="col-related__list">
                      {relatedCases.map((k) => (
                        <li><a href={`/cases/${k.id}`}>{clean(k.title)}</a>{k.duration && <span>{clean(k.duration)}</span>}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside class="sidebar">
            <div class="side-card">
              <h2 class="side-card__title">사례 정보</h2>
              {c.age_group && <div class="side-link">연령대<span>{c.age_group}</span></div>}
              {c.gender && <div class="side-link">성별<span>{c.gender}</span></div>}
              {c.area && <div class="side-link">지역<span>{c.area}</span></div>}
              {c.duration && <div class="side-link">치료 기간<span>{c.duration}</span></div>}
            </div>
            {tx && (
              <div class="side-card">
                <h2 class="side-card__title">관련 진료</h2>
                <a href={`/treatments/${tx.slug}`} class="side-link">{tx.shortName}<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
              </div>
            )}
            {c.doctor && (() => {
              const doc = getDoctor(c.doctor!)
              return (
                <div class="side-card">
                  <h2 class="side-card__title">담당 의료진</h2>
                  <a href={`/doctors/${c.doctor}`} class="doc-mini">
                    <span class="doc-mini__av"><i class="fas fa-user-doctor"></i></span>
                    <strong>{doc ? `${doc.name} ${doc.title}` : '원장 프로필 보기'}</strong>
                  </a>
                  <a href={`/cases/gallery?doctor=${c.doctor}`} class="side-link" style="margin-top:8px">이 원장의 다른 사례 보기<i class="fas fa-chevron-right" style="font-size:11px"></i></a>
                </div>
              )
            })()}
          </aside>
        </div>
      </section>
    </Page>
  )
}
