import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { FAQ_CATEGORIES, getAllFaqs } from '../data/faq'
import { faqPageSchema, breadcrumbSchema } from '../lib/schema'

export const FaqPage: FC = () => {
  const allItems = getAllFaqs()
  return (
    <Page
      title="자주 묻는 질문 — 오산 정원한의원"
      description="오산 정원한의원 자주 묻는 질문 — 이용 안내부터 비만 다이어트·체질 한약·교통사고 후유증 진료까지 궁금증을 해결해 드립니다."
      path="/faq"
      jsonLd={[
        faqPageSchema(allItems.slice(0, 30)),
        breadcrumbSchema([{ name: '홈', url: '/' }, { name: '자주 묻는 질문', url: '/faq' }]),
      ]}
    >
      <PageHero
        title="자주 묻는 질문"
        desc="진료 전 궁금하셨던 점, 여기서 먼저 확인하세요."
        breadcrumb={[{ label: '안내' }, { label: '자주 묻는 질문' }]}
      />
      <section class="section">
        <div class="wrap-narrow">
          {/* 카테고리 탭 */}
          <div class="faq-cat-tabs" data-reveal>
            <button class="faq-cat-tab active" data-cat="all">전체</button>
            {FAQ_CATEGORIES.map((c) => (
              <button class="faq-cat-tab" data-cat={c.slug}>{c.label}</button>
            ))}
          </div>

          {FAQ_CATEGORIES.map((cat) => (
            <div data-faq-group={cat.slug} id={cat.slug}>
              <h2 style="font-size:24px;color:var(--brand);margin:36px 0 8px" data-reveal>
                <i class="fas fa-circle-question" style="margin-right:10px"></i>{cat.label}
              </h2>
              {cat.items.map((f) => (
                <div class="faq-item">
                  <button class="faq-q">{f.q}<span class="ic"><i class="fas fa-plus"></i></span></button>
                  <div class="faq-a"><div class="faq-a__inner">{f.a}</div></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </Page>
  )
}
