// ============================================================
// /seo-health — SEO 건강 대시보드
// 사이트맵 커버리지, JSON-LD 스키마 현황, 그리고
// "내부링크 커버리지"(몇 개 페이지가 링크 그물에 들어왔나)를 시각화.
// 운영자 참고용 진단 페이지 (robots에서 색인 제외 권장).
// ============================================================
import { Page, PageHero } from '../components/Layout'
import { CLINIC } from '../data/clinic'
import { buildLinkGraph } from '../lib/linkgraph'

function pct(n: number) {
  return `${n}%`
}

// 커버리지 비율에 따른 색상 (녹/황/적)
function barColor(p: number) {
  if (p >= 95) return '#1f7a4d'
  if (p >= 80) return '#c98a00'
  return '#c0392b'
}

export function SeoHealthPage() {
  const g = buildLinkGraph()

  // 스키마 점검 항목 (정적 — 코드에 구현된 스키마 기준)
  const schemaChecks = [
    { name: 'Organization / LocalBusiness', ok: true, note: '좌표·영업시간·hasMap·areaServed·결제수단 포함' },
    { name: 'aggregateRating (평점)', ok: !!CLINIC.rating, note: CLINIC.rating ? '실측 평점 적용됨' : '실측 리뷰 데이터 대기 중(허위표시 방지)' },
    { name: 'MedicalProcedure (진료)', ok: true, note: '진료 상세 페이지마다 적용' },
    { name: 'Person (의료진)', ok: true, note: '의료진 상세 페이지마다 적용' },
    { name: 'FAQPage', ok: true, note: 'FAQ 페이지 적용' },
    { name: 'BreadcrumbList', ok: true, note: '주요 페이지 적용' },
    { name: 'Article / MedicalWebPage', ok: true, note: '칼럼 페이지 적용' },
    { name: 'sitemap.xml / robots.txt / llms.txt', ok: true, note: '자동 생성' },
  ]

  return (
    <Page
      title="SEO 건강 대시보드"
      description={`${CLINIC.nameFull} 내부 SEO/AEO 진단 — 내부링크 커버리지, 스키마 현황, 사이트맵 점검`}
      path="/seo-health"
    >
      <PageHero
        title="SEO 건강 대시보드"
        desc="검색·AI 노출을 위한 내부 진단 리포트 (운영자 참고용)"
        breadcrumb={[{ label: 'SEO 건강' }]}
      />

      <section class="section">
        <div class="wrap">
          {/* ── 상단 요약 카드 ── */}
          <div class="seo-cards" id="seo-summary">
            <article class="seo-card">
              <div class="seo-card-num">{g.totalPages}</div>
              <div class="seo-card-label">전체 페이지(사이트맵)</div>
            </article>
            <article class="seo-card">
              <div class="seo-card-num" style="color:#1f7a4d">{g.connectedPages}</div>
              <div class="seo-card-label">링크 그물 연결 페이지</div>
            </article>
            <article class="seo-card">
              <div class="seo-card-num" style={`color:${g.orphanPages ? '#c0392b' : '#1f7a4d'}`}>
                {g.orphanPages}
              </div>
              <div class="seo-card-label">고아 페이지(인링크 0)</div>
            </article>
            <article class="seo-card">
              <div class="seo-card-num" style={`color:${barColor(g.coveragePct)}`}>{pct(g.coveragePct)}</div>
              <div class="seo-card-label">내부링크 커버리지</div>
            </article>
            <article class="seo-card">
              <div class="seo-card-num">{g.edges.toLocaleString()}</div>
              <div class="seo-card-label">내부링크 연결(엣지)</div>
            </article>
          </div>

          {/* ── 내부링크 커버리지 시각화 ── */}
          <h2 class="seo-h2" id="coverage">
            <i class="fas fa-diagram-project"></i> 내부링크 커버리지
          </h2>
          <p class="seo-desc">
            사이트맵에 포함된 모든 페이지 중 <strong>다른 페이지로부터 내부링크(인바운드)를 1개 이상 받는</strong>
            페이지의 비율입니다. 비율이 높을수록 검색엔진 크롤러와 AI가 사이트 전체를 빠짐없이 발견·이해할 수 있습니다.
          </p>

          {/* 전체 게이지 */}
          <div class="cov-gauge">
            <div class="cov-gauge-track">
              <div
                class="cov-gauge-fill"
                style={`width:${g.coveragePct}%;background:${barColor(g.coveragePct)}`}
              >
                <span>{pct(g.coveragePct)}</span>
              </div>
            </div>
            <div class="cov-gauge-cap">
              {g.connectedPages.toLocaleString()} / {g.totalPages.toLocaleString()} 페이지 연결됨
            </div>
          </div>

          {/* 그룹별 커버리지 막대 */}
          <h3 class="seo-h3">분류별 커버리지</h3>
          <div class="cov-table">
            {g.byGroup.map((row) => (
              <div class="cov-row">
                <div class="cov-row-label">
                  {row.group} <small>({row.connected}/{row.total})</small>
                </div>
                <div class="cov-row-track">
                  <div
                    class="cov-row-fill"
                    style={`width:${row.coveragePct}%;background:${barColor(row.coveragePct)}`}
                  ></div>
                </div>
                <div class="cov-row-pct" style={`color:${barColor(row.coveragePct)}`}>
                  {pct(row.coveragePct)}
                </div>
              </div>
            ))}
          </div>

          {/* 고아 페이지 목록 */}
          <h3 class="seo-h3">
            고아 페이지 {g.orphanPages === 0 ? '없음 ✅' : `(${g.orphanPages}개)`}
          </h3>
          {g.orphanPages === 0 ? (
            <p class="seo-ok">
              <i class="fas fa-circle-check"></i> 모든 페이지가 내부링크 그물에 연결되어 있습니다.
              크롤러가 어떤 페이지도 놓치지 않고 발견할 수 있는 상태입니다.
            </p>
          ) : (
            <ul class="orphan-list">
              {g.orphans.map((o) => (
                <li>
                  <span class="orphan-group">{o.group}</span>
                  <a href={o.path}>{o.label}</a>
                  <code>{o.path}</code>
                </li>
              ))}
            </ul>
          )}

          {/* ── 스키마(JSON-LD) 현황 ── */}
          <h2 class="seo-h2" id="schema">
            <i class="fas fa-code"></i> 구조화 데이터(JSON-LD) 현황
          </h2>
          <p class="seo-desc">
            구글 리치 결과·지도 노출과 AI 답변 인용(AEO)을 위한 스키마 적용 상태입니다.
          </p>
          <div class="schema-list">
            {schemaChecks.map((s) => (
              <div class="schema-item">
                <span class={`schema-dot ${s.ok ? 'on' : 'off'}`}>
                  <i class={`fas ${s.ok ? 'fa-check' : 'fa-minus'}`}></i>
                </span>
                <div>
                  <strong>{s.name}</strong>
                  <small>{s.note}</small>
                </div>
              </div>
            ))}
          </div>

          {/* ── 점검 링크 ── */}
          <h2 class="seo-h2" id="tools">
            <i class="fas fa-toolbox"></i> 빠른 점검 도구
          </h2>
          <div class="seo-tools">
            <a href="/sitemap.xml" target="_blank" rel="noopener">
              <i class="fas fa-sitemap"></i> sitemap.xml
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener">
              <i class="fas fa-robot"></i> robots.txt
            </a>
            <a href="/llms.txt" target="_blank" rel="noopener">
              <i class="fas fa-microchip"></i> llms.txt (AI)
            </a>
            <a
              href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(CLINIC.domain)}`}
              target="_blank"
              rel="noopener"
            >
              <i class="fab fa-google"></i> 리치결과 테스트
            </a>
          </div>

          <p class="seo-foot">
            ※ 이 페이지는 운영자 진단용이며 검색 색인에서 제외됩니다(robots.txt Disallow). 데이터는 페이지 요청 시 코드 기준으로 실시간 산출됩니다.
          </p>
        </div>
      </section>
    </Page>
  )
}
