// ============================================================
// 내부링크 그래프 분석 (Internal Link Coverage)
// "몇 개의 페이지가 링크 그물(internal link web)에 들어왔나"를 계산.
// - 노드: sitemap.xml에 포함되는 모든 페이지(canonical 경로)
// - 엣지: 페이지 간 실제로 렌더되는 내부 <a> 링크 관계
// 이 분석으로 고아 페이지(orphan: 인바운드 0)와 커버리지 비율을 산출.
// ============================================================
import { CLINIC, SITE_NAV } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { ENC_TERMS } from '../data/encyclopedia'
import { AREAS, AREA_TREATMENTS } from '../data/areas'

export interface LinkNode {
  path: string
  label: string
  group: string // 분류 그룹 (진료/의료진/백과사전/지역/기타)
  inbound: number // 받은 내부링크 수
  outbound: number // 내보낸 내부링크 수
}

export interface LinkGraphReport {
  nodes: LinkNode[]
  totalPages: number
  connectedPages: number // 인바운드 ≥ 1
  orphanPages: number // 인바운드 0
  coveragePct: number // connected / total * 100
  edges: number // 전체 내부링크 엣지 수
  byGroup: { group: string; total: number; connected: number; coveragePct: number }[]
  orphans: { path: string; label: string; group: string }[]
}

// ── 1) 사이트의 모든 캐노니컬 페이지(노드) 수집 ──────────────
function collectNodes(): Map<string, LinkNode> {
  const m = new Map<string, LinkNode>()
  const add = (path: string, label: string, group: string) => {
    if (!m.has(path)) m.set(path, { path, label, group, inbound: 0, outbound: 0 })
  }

  // 메인/안내/주요 (sitemap 기준)
  add('/', '홈', '주요')
  add('/mission', '병원미션', '주요')
  add('/doctors', '의료진 목록', '의료진')
  add('/treatments', '진료 목록', '진료')
  add('/cases/gallery', '치료 사례', '콘텐츠')
  add('/column', '원장 칼럼', '콘텐츠')
  add('/encyclopedia', '한의학 백과사전', '백과사전')
  add('/faq', '자주 묻는 질문', '안내')
  add('/directions', '오시는 길', '안내')
  add('/pricing', '진료시간·비용', '안내')
  add('/notice', '공지사항', '안내')
  add('/sasang-test', '내 체질 알아보기', '안내')
  add('/sasang-test/result/taeyang', '체질결과·태양인', '안내')
  add('/sasang-test/result/taeeum', '체질결과·태음인', '안내')
  add('/sasang-test/result/soyang', '체질결과·소양인', '안내')
  add('/sasang-test/result/soeum', '체질결과·소음인', '안내')
  add('/reservation', '예약 문의', '주요')
  add('/review', '리뷰', '콘텐츠')

  TREATMENTS.forEach((t) => add(`/treatments/${t.slug}`, t.shortName, '진료'))
  DOCTORS.forEach((d) => add(`/doctors/${d.slug}`, d.name, '의료진'))
  ENC_TERMS.forEach((e) => add(`/encyclopedia/${e.slug}`, e.term, '백과사전'))
  AREAS.forEach((a) =>
    AREA_TREATMENTS.forEach((tx) => add(`/area/${a.slug}-${tx.slug}`, `${a.name} ${tx.name}`, '지역'))
  )

  return m
}

// ── 2) 페이지 간 내부링크(엣지) 매핑 ─────────────────────────
// 각 페이지가 실제로 렌더링하는 내부 <a href> 관계를 코드 동작에 맞춰 재현.
function collectEdges(nodes: Map<string, LinkNode>): [string, string][] {
  const edges: [string, string][] = []
  const link = (from: string, to: string) => {
    if (from === to) return
    if (!nodes.has(to)) return
    edges.push([from, to])
  }

  // (a) 전역 네비게이션: 모든 페이지의 헤더/푸터에서 SITE_NAV 대상으로 링크가 나간다.
  const navTargets = new Set<string>()
  SITE_NAV.forEach((n) => {
    navTargets.add(n.href)
    ;(n as any).children?.forEach((c: any) => navTargets.add(c.href))
  })
  // 푸터 공통 링크 (Footer 컴포넌트 기준)
  ;[
    '/',
    '/reservation',
    '/directions',
    '/pricing',
    '/faq',
    '/privacy',
    '/terms',
    '/sasang-test',
    '/review',
  ].forEach((p) => navTargets.add(p))
  // 모든 노드는 전역 네비를 내보낸다 → 네비 대상은 사실상 전부 인바운드 확보
  for (const from of nodes.keys()) {
    navTargets.forEach((to) => link(from, to))
  }

  // (b) 진료 상세 → 담당 의료진 (상호 인링크)
  TREATMENTS.forEach((t) => {
    const tp = `/treatments/${t.slug}`
    t.doctors.forEach((ds) => link(tp, `/doctors/${ds}`))
  })
  // (c) 의료진 상세 → 담당 진료 (역방향)
  DOCTORS.forEach((d) => {
    const dp = `/doctors/${d.slug}`
    TREATMENTS.filter((t) => t.doctors.includes(d.slug)).forEach((t) =>
      link(dp, `/treatments/${t.slug}`)
    )
  })

  // (d) 백과사전 용어 → related 진료 (autoLink/related 필드)
  ENC_TERMS.forEach((e) => {
    const ep = `/encyclopedia/${e.slug}`
    if (e.related) link(ep, `/treatments/${e.related}`)
  })
  // (e) 백과사전 목록 → 각 용어 (목록 페이지가 모든 용어를 링크)
  ENC_TERMS.forEach((e) => link('/encyclopedia', `/encyclopedia/${e.slug}`))

  // (f) 진료/칼럼 본문의 autoLinkTerms → 백과사전 용어 (역방향 인링크 확보)
  // 핵심 진료 본문은 백과사전 핵심 용어를 자동 링크한다(최대 6~8개).
  // 보수적으로 related로 연결된 용어만 역링크가 보장된다고 본다 → (d)에서 진료가 인바운드 확보.
  // 진료 목록/홈 → 진료 상세
  TREATMENTS.forEach((t) => link('/treatments', `/treatments/${t.slug}`))
  TREATMENTS.filter((t) => t.category === 'core').forEach((t) => link('/', `/treatments/${t.slug}`))
  // 의료진 목록 → 의료진 상세
  DOCTORS.forEach((d) => link('/doctors', `/doctors/${d.slug}`))

  // 체질 테스트 인트로 → 4가지 체질 결과 (미리보기 카드 인링크)
  ;['taeyang', 'taeeum', 'soyang', 'soeum'].forEach((k) =>
    link('/sasang-test', `/sasang-test/result/${k}`)
  )
  // 각 체질 결과 → 테스트 인트로 + 추천 진료 (역링크)
  ;['taeyang', 'taeeum', 'soyang', 'soeum'].forEach((k) =>
    link(`/sasang-test/result/${k}`, '/sasang-test')
  )

  // (g) 지역 페이지 → 해당 진료 + 오시는 길 (지역 SEO 내부링크)
  AREAS.forEach((a) =>
    AREA_TREATMENTS.forEach((tx) => {
      const ap = `/area/${a.slug}-${tx.slug}`
      link(ap, `/treatments/${tx.slug}`)
      link(ap, '/directions')
    })
  )
  // 오시는 길 → 지역 페이지 (지역 허브 역링크)
  AREAS.forEach((a) =>
    AREA_TREATMENTS.forEach((tx) => link('/directions', `/area/${a.slug}-${tx.slug}`))
  )

  return edges
}

export function buildLinkGraph(): LinkGraphReport {
  const nodes = collectNodes()
  const edges = collectEdges(nodes)

  // 인/아웃바운드 카운트 (중복 엣지는 1회로 집계 — 페이지쌍 단위 연결 여부가 핵심)
  const seen = new Set<string>()
  for (const [from, to] of edges) {
    const key = from + '→' + to
    if (seen.has(key)) continue
    seen.add(key)
    nodes.get(to)!.inbound++
    nodes.get(from)!.outbound++
  }

  const list = [...nodes.values()]
  const total = list.length
  const connected = list.filter((n) => n.inbound > 0).length
  const orphans = list.filter((n) => n.inbound === 0)

  // 그룹별 집계
  const groups = [...new Set(list.map((n) => n.group))]
  const byGroup = groups
    .map((g) => {
      const items = list.filter((n) => n.group === g)
      const c = items.filter((n) => n.inbound > 0).length
      return {
        group: g,
        total: items.length,
        connected: c,
        coveragePct: items.length ? Math.round((c / items.length) * 1000) / 10 : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  return {
    nodes: list,
    totalPages: total,
    connectedPages: connected,
    orphanPages: orphans.length,
    coveragePct: total ? Math.round((connected / total) * 1000) / 10 : 0,
    edges: seen.size,
    byGroup,
    orphans: orphans
      .map((n) => ({ path: n.path, label: n.label, group: n.group }))
      .slice(0, 50), // 최대 50개만 표시
  }
}

// 사이트맵에 포함된 총 URL 수 (대시보드 상단 요약용)
export function sitemapUrlCount(): number {
  return buildLinkGraph().totalPages
}

export { CLINIC }
