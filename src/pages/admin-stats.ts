// ============================================================
// 관리자 검색·방문 통계 — /admin/stats
// 중앙 대시보드(pf-dashboard) API를 서버사이드로 호출해 렌더
// 토큰은 서버사이드 전용 — 클라이언트에 노출 금지
// ============================================================

const STATS_DOMAIN = 'gardenclinic.kr'
const STATS_TOKEN = '0022d5f5b0744d0abc84f58cbcedf18520823fc6553cb9c4'
export const STATS_KEY = STATS_TOKEN
export const MASTER_KEY = 'pfwe-b4f42f06'
const PFS_PALETTE = `--pfs-a:#0A5234;--pfs-a-soft:#D9E5DD;--pfs-ink:#16201A;--pfs-mut:#5C6B62;--pfs-line:#E0E7E1;--pfs-card:#ffffff;--pfs-good:#0A5234;--pfs-bad:#b3402e;--pfs-head:#00381E`

// ────────────────────────────────────────────────────────────
// 공통 코어 — 업스트림 호출 + 렌더 헬퍼 (서버사이드 전용)
// ────────────────────────────────────────────────────────────

type Delta = number | null
interface GscStats {
  clicks: number; impressions: number; ctr: number; position: number | null
  delta: { clicks: Delta; impressions: Delta; ctr: Delta; position: Delta }
  topQueries: { query: string; clicks: number; impressions: number }[]
  topPages: { page: string; clicks: number; impressions: number }[]
  dailyClicks: { date: string; clicks: number }[]
}
interface GaStats {
  users: number; sessions: number; pageviews: number; avgDuration: number; leads: number
  delta: { users: Delta; sessions: Delta; leads: Delta }
  dailyUsers: { date: string; users: number; sessions: number }[]
}
interface AiStats {
  sessions: number; share: number; delta: Delta
  bySource: Record<string, number>
  topLandingPages: { page: string; sessions: number }[]
}
export interface SiteStats {
  configured: boolean; hasGa?: boolean; updatedAt?: string
  range?: { start: string; end: string }
  gsc?: GscStats | null; ga?: GaStats | null; ai?: AiStats | null
}

export async function fetchSiteStats(): Promise<SiteStats | null> {
  try {
    const ac: AbortSignal | undefined =
      typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function'
        ? (AbortSignal as any).timeout(12000)
        : undefined
    const res = await fetch(`https://pf-dashboard-2nt.pages.dev/api/stats/${STATS_DOMAIN}`, {
      headers: { Authorization: `Bearer ${STATS_TOKEN}` },
      signal: ac,
    })
    if (!res.ok) return null
    const j: any = await res.json()
    if (!j || j.error || typeof j.configured !== 'boolean') return null
    return j as SiteStats
  } catch {
    return null
  }
}

const escS = (s: any): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const num = (v: any): string =>
  typeof v === 'number' && isFinite(v) ? v.toLocaleString('ko-KR') : '–'

function deltaBadge(v: Delta | undefined, invert = false): string {
  if (v == null || !isFinite(v)) return ''
  const good = v === 0 ? null : invert ? v < 0 : v > 0
  const cls = good == null ? 'flat' : good ? 'up' : 'down'
  const arrow = v === 0 ? '·' : v > 0 ? '▲' : '▼'
  return `<span class="pfs-delta ${cls}">${arrow} ${Math.abs(v).toFixed(1)}%</span>`
}

function sparkSvg(vals: number[], label: string): string {
  if (!vals || vals.length < 2 || vals.every((v) => !v)) {
    return `<div class="pfs-empty">아직 표시할 추이 데이터가 없습니다</div>`
  }
  const w = 280, h = 60
  const max = Math.max(...vals, 1)
  const pts = vals
    .map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - 5 - (v / max) * (h - 12)).toFixed(1)}`)
    .join(' ')
  return `<svg class="pfs-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${escS(label)}">
<polygon fill="currentColor" fill-opacity=".09" points="0,${h} ${pts} ${w},${h}"></polygon>
<polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts}"></polyline>
</svg>`
}

function pathOf(p: string): string {
  const s = String(p || '').replace(/^https?:\/\/[^/]+/, '')
  return s === '' ? '/' : s
}

function durFmt(sec: any): string {
  if (typeof sec !== 'number' || !isFinite(sec)) return '–'
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return m > 0 ? `${m}분 ${s}초` : `${s}초`
}

function buildInsights(d: SiteStats | null): string[] {
  const out: string[] = []
  const gsc = d?.configured ? d.gsc : null
  const ga = d?.configured ? d.ga : null
  const ai = d?.configured ? d.ai : null
  if (!d || !d.configured) {
    out.push('중앙 대시보드와의 데이터 연동을 기다리고 있습니다. 연동이 완료되면 이 페이지에 검색·방문 지표가 자동으로 표시됩니다.')
    out.push('연동 전에도 사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 정상 작동 중입니다.')
    out.push('신규 사이트는 색인과 순위 안착까지 시간이 걸립니다. 본격적인 순위 경쟁은 개설 6개월부터 시작됩니다.')
    return out
  }
  if (gsc) {
    if (gsc.clicks < 100) out.push('아직 색인·초기 노출 단계입니다. 순위 안착 전에는 노출(임프레션) 증가가 클릭보다 먼저 나타나는 것이 정상입니다.')
    if (gsc.delta?.clicks != null && gsc.delta.clicks >= 20) out.push(`검색 클릭이 이전 기간 대비 ${gsc.delta.clicks.toFixed(0)}% 증가했습니다. 상승 흐름이 이어지고 있습니다.`)
    else if (gsc.delta?.clicks != null && gsc.delta.clicks <= -20) out.push(`검색 클릭이 이전 기간 대비 ${Math.abs(gsc.delta.clicks).toFixed(0)}% 감소했습니다. 칼럼·사례 등 신규 콘텐츠 발행 주기를 점검해 보세요.`)
    if (gsc.impressions >= 500 && gsc.ctr < 0.01) out.push('노출 대비 클릭률(CTR)이 1% 미만입니다. 노출은 확보되고 있으므로 순위가 오르면 클릭이 자연히 따라옵니다.')
    if (gsc.delta?.position != null && gsc.delta.position <= -5) out.push('평균 게재순위가 개선되고 있습니다. 현재의 콘텐츠 발행 흐름을 유지하는 것이 중요합니다.')
    if (gsc.topQueries?.length) out.push(`현재 가장 많은 유입을 만드는 검색어는 “${escS(gsc.topQueries[0].query)}”입니다.`)
  } else {
    out.push('Search Console 데이터가 아직 수집되지 않았습니다. 색인 초기에는 정상적인 상태입니다.')
  }
  if (ga && ga.leads > 0) out.push(`최근 28일 동안 예약·상담 등 전환 리드가 ${num(ga.leads)}건 발생했습니다.`)
  if (ai && ai.sessions > 0) out.push(`AI 검색(ChatGPT·Perplexity 등) 경유 방문이 ${num(ai.sessions)}회 — 전체 방문의 ${ai.share}%입니다. AEO 세팅이 작동하고 있습니다.`)
  const pool = [
    '지표는 최근 28일 기준이며 매일 자동 갱신됩니다.',
    '사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 정상 작동 중입니다.',
    '칼럼·치료사례 등 콘텐츠를 꾸준히 발행하면 롱테일 키워드 노출이 빨라집니다.',
  ]
  for (const p of pool) { if (out.length >= 3) break; out.push(p) }
  return out.slice(0, 5)
}

const PFS_CSS = `
.pfs{${PFS_PALETTE};color:var(--pfs-ink);line-height:1.55}
.pfs *{box-sizing:border-box}
.pfs-card{background:var(--pfs-card);border:1px solid var(--pfs-line);border-radius:16px;padding:22px;margin-bottom:18px}
.pfs-h{font-size:1.02rem;font-weight:800;margin:0 0 14px;color:var(--pfs-head)}
.pfs-meta{font-size:.82rem;color:var(--pfs-mut);margin:0 0 18px}
.pfs-badge-wait{display:inline-block;background:var(--pfs-a-soft);color:var(--pfs-a);font-weight:800;font-size:.78rem;border-radius:99px;padding:5px 13px;margin-right:8px}
.pfs-expect{border:1px solid var(--pfs-line);background:var(--pfs-card);border-radius:16px;padding:18px 22px;margin-bottom:18px}
.pfs-expect.big{padding:30px 26px;border:2px solid var(--pfs-a);background:linear-gradient(135deg,var(--pfs-a-soft) 0%,var(--pfs-card) 70%)}
.pfs-expect h2{font-size:1.15rem;font-weight:800;margin:0;color:var(--pfs-head)}
.pfs-expect.big h2{font-size:1.45rem}
.pfs-expect .pfs-expect-msg{margin:10px 0 0;font-size:.95rem;max-width:720px;word-break:keep-all}
.pfs-timeline{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
.pfs-step{background:var(--pfs-card);border:1px solid var(--pfs-line);border-radius:12px;padding:13px 14px}
.pfs-step .t{display:block;font-weight:800;font-size:.78rem;color:var(--pfs-a);letter-spacing:.03em}
.pfs-step .d{display:block;font-size:.86rem;margin-top:3px;font-weight:700;word-break:keep-all}
.pfs-expect details summary{cursor:pointer;font-weight:800;font-size:.95rem;color:var(--pfs-head);list-style:none;display:flex;align-items:center;gap:8px}
.pfs-expect details summary::after{content:'▾';color:var(--pfs-mut);font-size:.8rem}
.pfs-expect details[open] summary::after{content:'▴'}
.pfs-sec{font-size:.78rem;font-weight:800;letter-spacing:.08em;color:var(--pfs-mut);text-transform:uppercase;margin:22px 0 10px}
.pfs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.pfs-stat{background:var(--pfs-card);border:1px solid var(--pfs-line);border-radius:14px;padding:15px 16px}
.pfs-stat .l{display:block;font-size:.75rem;color:var(--pfs-mut);font-weight:700}
.pfs-stat .n{font-size:1.45rem;font-weight:800;margin-top:2px;color:var(--pfs-head);white-space:nowrap}
.pfs-stat .s{display:block;font-size:.74rem;color:var(--pfs-mut);margin-top:2px}
.pfs-delta{display:inline-block;font-size:.7rem;font-weight:800;border-radius:99px;padding:2px 8px;margin-left:6px;vertical-align:2px}
.pfs-delta.up{background:rgba(26,127,78,.13);color:var(--pfs-good)}
.pfs-delta.down{background:rgba(179,64,46,.13);color:var(--pfs-bad)}
.pfs-delta.flat{background:var(--pfs-a-soft);color:var(--pfs-mut)}
.pfs-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.pfs table{width:100%;border-collapse:collapse;font-size:.85rem}
.pfs th{text-align:left;padding:8px 10px;border-bottom:2px solid var(--pfs-line);font-size:.72rem;color:var(--pfs-mut);letter-spacing:.04em}
.pfs td{padding:8px 10px;border-bottom:1px solid var(--pfs-line);word-break:break-all}
.pfs tr:last-child td{border-bottom:none}
.pfs td.r,.pfs th.r{text-align:right;white-space:nowrap}
.pfs-spark{width:100%;height:64px;color:var(--pfs-a);display:block}
.pfs-empty{color:var(--pfs-mut);font-size:.85rem;padding:20px 0;text-align:center}
.pfs-insights{margin:0;padding-left:20px}
.pfs-insights li{margin-bottom:8px;font-size:.92rem;word-break:keep-all}
.pfs-insights li:last-child{margin-bottom:0}
@media(max-width:720px){.pfs-timeline{grid-template-columns:repeat(2,1fr)}}
`

const AI_SOURCE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini', etc: '기타 AI',
}

export function statsBody(d: SiteStats | null): string {
  const waiting = !d || !d.configured
  const gsc = d?.configured ? d.gsc : null
  const ga = d?.configured ? d.ga : null
  const ai = d?.configured ? d.ai : null
  const early = waiting || !gsc || gsc.clicks < 100

  const timeline = `<div class="pfs-timeline">
<div class="pfs-step"><span class="t">0–1개월</span><span class="d">구글 색인 등록</span></div>
<div class="pfs-step"><span class="t">1–3개월</span><span class="d">롱테일 키워드 노출 시작</span></div>
<div class="pfs-step"><span class="t">3–6개월</span><span class="d">지역+진료 키워드 진입</span></div>
<div class="pfs-step"><span class="t">6개월~</span><span class="d">경쟁 키워드 본순위 경쟁</span></div>
</div>`

  const expectCard = early
    ? `<div class="pfs-expect big">
<h2>⏳ 검색 순위는 시간이 필요합니다</h2>
<p class="pfs-expect-msg">신규 사이트는 색인과 순위 안착까지 시간이 걸립니다. 본격적인 순위 경쟁은 개설 6개월부터 시작됩니다. 사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 모두 완료되어 있습니다.</p>
${timeline}</div>`
    : `<div class="pfs-expect"><details>
<summary>검색 순위는 시간이 필요합니다 — 성장 타임라인 보기</summary>
${timeline}</details></div>`

  const metaLine = waiting
    ? `<p class="pfs-meta"><span class="pfs-badge-wait">데이터 연동 대기 중</span>중앙 통계 시스템과의 연동이 준비되는 대로 지표가 자동으로 표시됩니다.</p>`
    : `<p class="pfs-meta">집계 기간: ${escS(d!.range?.start ?? '')} ~ ${escS(d!.range?.end ?? '')} (최근 28일 · 증감은 직전 28일 대비)${d!.updatedAt ? ` · 갱신 ${escS(String(d!.updatedAt).slice(0, 16).replace('T', ' '))}` : ''}</p>`

  const stat = (l: string, nHtml: string, sub = '') =>
    `<div class="pfs-stat"><span class="l">${l}</span><div class="n">${nHtml}</div>${sub ? `<span class="s">${sub}</span>` : ''}</div>`

  const gscCards = `<div class="pfs-sec">검색 유입 — Google Search Console</div><div class="pfs-grid">
${stat('클릭', num(gsc?.clicks) + deltaBadge(gsc?.delta?.clicks))}
${stat('노출', num(gsc?.impressions) + deltaBadge(gsc?.delta?.impressions))}
${stat('CTR', (gsc && typeof gsc.ctr === 'number' ? (gsc.ctr * 100).toFixed(2) + '%' : '–') + deltaBadge(gsc?.delta?.ctr))}
${stat('평균 게재순위', (gsc?.position != null ? gsc.position.toFixed(1) + '위' : '–') + deltaBadge(gsc?.delta?.position, true), '낮을수록 상위 노출')}
</div>`

  const gaCards = `<div class="pfs-sec">방문 — Google Analytics 4</div><div class="pfs-grid">
${stat('사용자', num(ga?.users) + deltaBadge(ga?.delta?.users))}
${stat('세션', num(ga?.sessions) + deltaBadge(ga?.delta?.sessions))}
${stat('페이지뷰', num(ga?.pageviews), ga ? `평균 체류 ${durFmt(ga.avgDuration)}` : '')}
${stat('전환 리드', num(ga?.leads) + deltaBadge(ga?.delta?.leads), '예약·상담 신청')}
${stat('AI 검색 유입', num(ai?.sessions) + deltaBadge(ai?.delta), ai ? `전체 방문의 ${ai.share}%` : 'ChatGPT·Perplexity 등')}
</div>`

  const sparkCards = `<div class="pfs-two" style="margin-top:22px">
<div class="pfs-card" style="margin-bottom:0"><div class="pfs-h">일별 검색 클릭 추이</div>${sparkSvg((gsc?.dailyClicks ?? []).map((x) => x.clicks), '일별 검색 클릭 추이')}</div>
<div class="pfs-card" style="margin-bottom:0"><div class="pfs-h">일별 방문 사용자 추이</div>${sparkSvg((ga?.dailyUsers ?? []).map((x) => x.users), '일별 방문 사용자 추이')}</div>
</div>`

  const rows3 = (arr: { a: string; b: number; c: number }[], h: [string, string, string]) =>
    arr.length
      ? `<table><thead><tr><th>${h[0]}</th><th class="r">${h[1]}</th><th class="r">${h[2]}</th></tr></thead><tbody>
${arr.map((r) => `<tr><td>${r.a}</td><td class="r">${num(r.b)}</td><td class="r">${num(r.c)}</td></tr>`).join('')}
</tbody></table>`
      : `<div class="pfs-empty">아직 수집된 데이터가 없습니다</div>`

  const qTable = rows3(
    (gsc?.topQueries ?? []).slice(0, 10).map((q) => ({ a: escS(q.query), b: q.clicks, c: q.impressions })),
    ['검색어', '클릭', '노출'],
  )
  const pTable = rows3(
    (gsc?.topPages ?? []).slice(0, 10).map((p) => ({ a: escS(pathOf(p.page)), b: p.clicks, c: p.impressions })),
    ['페이지', '클릭', '노출'],
  )
  const aiRows = ai
    ? Object.entries(ai.bySource ?? {})
        .map(([k, v]) => ({ label: AI_SOURCE_LABELS[k] ?? k, n: Number(v) || 0 }))
        .sort((x, y) => y.n - x.n)
    : []
  const aiTable = aiRows.length && aiRows.some((r) => r.n > 0)
    ? `<table><thead><tr><th>AI 소스</th><th class="r">세션</th></tr></thead><tbody>
${aiRows.map((r) => `<tr><td>${escS(r.label)}</td><td class="r">${num(r.n)}</td></tr>`).join('')}
</tbody></table>${
        ai!.topLandingPages?.length
          ? `<div class="pfs-sec" style="margin-top:16px">AI 유입 상위 랜딩</div><table><tbody>${ai!.topLandingPages
              .slice(0, 5)
              .map((p) => `<tr><td>${escS(pathOf(p.page))}</td><td class="r">${num(p.sessions)}</td></tr>`)
              .join('')}</tbody></table>`
          : ''
      }`
    : `<div class="pfs-empty">아직 AI 검색 유입이 집계되지 않았습니다</div>`

  const tables = `<div class="pfs-two" style="margin-top:16px">
<div class="pfs-card" style="margin-bottom:0"><div class="pfs-h">상위 검색어 TOP 10</div>${qTable}</div>
<div class="pfs-card" style="margin-bottom:0"><div class="pfs-h">상위 페이지 TOP 10</div>${pTable}</div>
<div class="pfs-card" style="margin-bottom:0"><div class="pfs-h">AI 검색 소스별 유입</div>${aiTable}</div>
</div>`

  const insights = `<div class="pfs-card" style="margin-top:16px"><div class="pfs-h">자동 인사이트</div>
<ul class="pfs-insights">${buildInsights(d).map((l) => `<li>${l}</li>`).join('')}</ul></div>`

  return `<div class="pfs"><style>${PFS_CSS}</style>
${metaLine}
${expectCard}
${gscCards}
${gaCards}
${sparkCards}
${tables}
${insights}
</div>`
}

// ────────────────────────────────────────────────────────────
// 독립 페이지 (정원한의원 관리자 톤 — 종이·초록)
// ────────────────────────────────────────────────────────────
export function adminStatsPage(d: SiteStats | null): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>검색·방문 통계 — 정원한의원 관리자</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',-apple-system,sans-serif;background:#F6F8F6;color:#16201A;min-height:100vh}
.stats-top{background:#00381E;color:#F2EBDD;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.stats-top strong{font-size:1rem}
.stats-top a{color:rgba(242,235,221,.85);text-decoration:none;font-size:.85rem;font-weight:700;border:1px solid rgba(242,235,221,.35);border-radius:8px;padding:7px 13px}
.stats-top a:hover{background:rgba(242,235,221,.1)}
</style>
</head>
<body>
<header class="stats-top"><strong>정원한의원 — 검색·방문 통계</strong><a href="/admin">관리자 홈</a></header>
<main style="max-width:1100px;margin:0 auto;padding:26px 20px 80px">${statsBody(d)}</main>
</body>
</html>`
}
