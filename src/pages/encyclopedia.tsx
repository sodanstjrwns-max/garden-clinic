import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { ENC_TERMS, ENC_CATEGORIES, getEncTerm } from '../data/encyclopedia'
import { getTreatment } from '../data/treatments'
import { breadcrumbSchema } from '../lib/schema'
import { CLINIC } from '../data/clinic'

export const EncyclopediaListPage: FC = () => (
  <Page
    title={`한방 백과사전 — ${ENC_TERMS.length}개 용어 | 오산 정원한의원`}
    description="한약재·경혈·방제·증상 등 한의학 용어 500여 개를 쉽게 풀어낸 한방 백과사전. 오산 정원한의원이 제공하는 한방 건강 지식 사전입니다."
    path="/encyclopedia"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '한방 백과사전', url: '/encyclopedia' }])}
  >
    <PageHero
      title="한방 백과사전"
      desc={`한약재, 경혈, 방제, 증상까지 — 한의학 용어 ${ENC_TERMS.length}개를 쉽게 풀어냈습니다.`}
      breadcrumb={[{ label: '콘텐츠' }, { label: '한방 백과사전' }]}
    />
    <section class="section">
      <div class="wrap">
        <div class="enc-search" data-reveal>
          <input type="text" id="enc-search-input" placeholder="용어를 검색하세요 (예: 한약, 어혈, 침치료...)" />
        </div>
        <div class="enc-cats" data-reveal>
          <button class="enc-cat active" data-cat="all">전체 ({ENC_TERMS.length})</button>
          {ENC_CATEGORIES.map((cat) => {
            const cnt = ENC_TERMS.filter((t) => t.category === cat).length
            return <button class="enc-cat" data-cat={cat}>{cat} ({cnt})</button>
          })}
        </div>
        <div class="enc-grid">
          {ENC_TERMS.map((t) => (
            <a class="enc-card" href={`/encyclopedia/${t.slug}`} data-cat={t.category}>
              <div class="enc-card__term">{t.term}<span class="enc-card__hanja">{t.hanja}</span></div>
              <div class="enc-card__cat">{t.category}</div>
              <div class="enc-card__desc">{t.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  </Page>
)

export const EncyclopediaDetailPage: FC<{ slug: string }> = ({ slug }) => {
  const t = getEncTerm(slug)
  if (!t) {
    return (
      <Page title="용어를 찾을 수 없습니다" description="요청하신 한방 용어를 찾을 수 없습니다." path="/encyclopedia">
        <PageHero title="용어를 찾을 수 없습니다" breadcrumb={[{ label: '백과사전', href: '/encyclopedia' }]} />
        <section class="section"><div class="wrap text-center"><a href="/encyclopedia" class="btn btn-primary">백과사전으로</a></div></section>
      </Page>
    )
  }
  const rel = getTreatment(t.related)
  // 같은 카테고리 관련 용어
  const sameCategory = ENC_TERMS.filter((e) => e.category === t.category && e.slug !== slug).slice(0, 8)

  return (
    <Page
      title={`${t.term}(${t.hanja}) — 한방 백과사전 | 오산 정원한의원`}
      description={`${t.term}(${t.hanja}): ${t.desc}`}
      path={`/encyclopedia/${slug}`}
      ogType="article"
      jsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          name: t.term,
          description: t.desc,
          inDefinedTermSet: CLINIC.domain + '/encyclopedia',
        },
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '백과사전', url: '/encyclopedia' },
          { name: t.term, url: `/encyclopedia/${slug}` },
        ]),
      ]}
    >
      <PageHero
        title={`${t.term} ${t.hanja}`}
        desc={t.category}
        breadcrumb={[{ label: '백과사전', href: '/encyclopedia' }, { label: t.term }]}
      />
      <section class="section">
        <div class="wrap detail-layout">
          <div class="article" data-reveal>
            <div class="answer" style="font-size:18px">{t.desc}</div>
            {rel && (
              <>
                <h2>관련 진료</h2>
                <p>
                  <strong>{t.term}</strong>은(는) 정원한의원의{' '}
                  <a href={`/treatments/${rel.slug}`} class="enc-link">{rel.shortName}</a> 진료와 관련이
                  있습니다. {rel.summary}
                </p>
                <a href={`/treatments/${rel.slug}`} class="btn btn-ghost" style="margin-top:10px">{rel.shortName} 진료 보기 <i class="fas fa-arrow-right"></i></a>
              </>
            )}
          </div>
          <aside class="sidebar">
            <div class="side-card">
              <h4>같은 분류 용어</h4>
              {sameCategory.map((e) => (
                <a href={`/encyclopedia/${e.slug}`} class="side-link">{e.term}<span style="font-size:11px;color:var(--ink-3)">{e.hanja}</span></a>
              ))}
            </div>
            <div class="side-card" style="background:var(--brand-soft);border-color:transparent">
              <h4 style="color:var(--brand)">전체 사전</h4>
              <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">{ENC_TERMS.length}개의 한방 용어를 둘러보세요.</p>
              <a href="/encyclopedia" class="btn btn-ghost" style="width:100%;justify-content:center;font-size:14px">백과사전 전체</a>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}
