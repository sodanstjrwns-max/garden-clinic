// ============================================================
// 칼럼·치료 사례 SEO/AEO 헬퍼 (PFWE-COLUMN-CASE-SEO 표준, 2026-10-03)
// - 본문 HTML 정리: 본문 속 <h1> → <h2>(페이지 H1은 제목 하나), 이미지 alt·lazy 보강
// - 핵심 답변: 본문 첫 문단에서 그대로 발췌(새 문장을 만들지 않음)
// - FAQ: 질문형 <h3> + 다음 제목 전까지의 답변
// ============================================================

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n)
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const c = parseInt(n, 16)
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''
    })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')

export const htmlText = (s: string) =>
  decodeEntities(
    String(s || '')
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(?:p|li|div|blockquote|tr|figcaption|h[1-6])>/gi, ' ')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/\[\d+(?:\s*[,–-]\s*\d+)*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 렌더용 본문 정리 — 내용은 바꾸지 않고 태그만 보정 */
export function prepareArticleHtml(html: string, title: string): string {
  let out = String(html || '')
  // 빈 h1(<h1><br></h1>) 제거, 나머지 본문 h1 은 h2 로 (페이지 H1 = 글 제목 하나)
  out = out.replace(/<h1\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/h1>/gi, '')
  out = out.replace(/<h1(\b[^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>')
  // 이미지: alt 없으면 제목 기반, 첫 이미지 외 lazy, decoding async
  let n = 0
  out = out.replace(/<img\b([^>]*?)\/?>/gi, (_m, attrs: string) => {
    n++
    let a = attrs
    const altM = a.match(/\salt\s*=\s*("([^"]*)"|'([^']*)')/i)
    const altVal = altM ? (altM[2] ?? altM[3] ?? '').trim() : ''
    if (!altVal) {
      a = a.replace(/\salt\s*=\s*("[^"]*"|'[^']*')/i, '')
      a += ` alt="${escAttr(`${title} 이미지 ${n}`)}"`
    }
    if (n > 1 && !/\sloading\s*=/i.test(a)) a += ' loading="lazy"'
    if (!/\sdecoding\s*=/i.test(a)) a += ' decoding="async"'
    return `<img${a.replace(/\s+$/, '')} />`
  })
  return out
}

const GREETING = /^(안녕하세요|안녕하십니까|반갑습니다)/
const SENTENCE_SPLIT = /(?<=[.!?。])\s+/
const CONNECTOR = /^(그리고|그런데|하지만|그러나|그래서|그렇게|또|또한|특히|물론|이처럼|이렇게)\s/
const LEAD_IN = /(이런|다음과 같|아래와 같|아래처럼)/

/**
 * 핵심 요약 박스 문구 — 본문 앞부분 문단에서 그대로 발췌(새 문장을 만들지 않음).
 * 1) "결론부터/결론적으로/요약하면/한마디로"로 시작하는 문단
 * 2) 인사·인용·질문·접속사로 시작하는 도입·"이런 말씀" 같은 예고 문단을 건너뛴 첫 설명 문단(…입니다/됩니다)
 * 3) 그 외 첫 실질 문단(40자 이상)
 * 문장 단위로 최대 3문장·220자. 적당한 문단이 없으면 빈 문자열(박스 미표시).
 */
export function answerSummaryFromHtml(html: string): string {
  const src = String(html || '')
  const paras = Array.from(src.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .slice(0, 25)
    .map((m) => htmlText(m[1]))
    .filter((t) => t.length >= 20)
  const ok = (t: string) =>
    t.length >= 40 &&
    !GREETING.test(t) &&
    !/^[“"'「『(]/.test(t) &&
    !/[“”"]/.test(t) &&
    !CONNECTOR.test(t) &&
    !/원장입니다\.?$/.test(t) &&
    !/[?？]$|까요\.?$/.test(t) &&
    !(LEAD_IN.test(t) && t.length < 90)
  const pick =
    paras.find((t) => /^(먼저\s*)?(결론부터|결론적으로|요약하면|한마디로|핵심만)/.test(t)) ||
    paras.slice(0, 15).find((t) => ok(t) && /(입니다|됩니다|습니다)\.?$/.test(t) && /(입니다|됩니다|때문입니다)/.test(t)) ||
    paras.find(ok)
  if (!pick) return ''
  const sentences = pick.split(SENTENCE_SPLIT).filter(Boolean)
  let out = ''
  for (const s of sentences.slice(0, 3)) {
    if ((out + ' ' + s).trim().length > 220 && out) break
    out = (out + ' ' + s).trim()
  }
  if (out.length > 220) out = out.slice(0, 219).trimEnd() + '…'
  return out
}

const QUESTION_END = /(?:[?？]|(?:나요|까요|가요|은가|는가|인가|니까|는지요|을까|ㄹ까|죠|습니까|되나요|있나요)[.!]?)$/
const clip = (s: string, n: number) => {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다. '), cut.lastIndexOf('요. '))
  return (end > n * 0.5 ? cut.slice(0, end + 1) : cut.trimEnd()) + '…'
}

export type Faq = { q: string; a: string }
/** 질문형 h3 + 다음 h1~h3 전까지 답변. 렌더 HTML(prepareArticleHtml 결과)을 넣어 화면 내용과 일치시킨다. */
export function faqsFromArticleHtml(html: string, maxItems = 20, maxAnswer = 1000): Faq[] {
  const src = String(html || '')
  const heads = Array.from(src.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi))
  const out: Faq[] = []
  const seen = new Set<string>()
  for (const m of heads) {
    if (out.length >= maxItems) break
    const q = htmlText(m[1]).replace(/^(?:Q\s*\d*\s*[.:)]|질문\s*\d*\s*[.:)])\s*/i, '').trim()
    if (!q || q.length > 200 || !QUESTION_END.test(q) || seen.has(q)) continue
    let seg = src.slice(m.index! + m[0].length)
    const next = seg.search(/<h[1-3][\s>]/i)
    if (next >= 0) seg = seg.slice(0, next)
    const stop = seg.search(/<p\b[^>]*>\s*<(strong|b)\b[^>]*>[^<]{1,40}<\/\1>\s*<\/p>|<hr\b|<p\b[^>]*>\s*※/i)
    if (stop >= 0) seg = seg.slice(0, stop)
    const a = htmlText(seg).replace(/^(?:A\s*\d*\s*[.:)]|답변\s*[.:)])\s*/i, '').trim()
    if (a.length < 10) continue
    seen.add(q)
    out.push({ q, a: clip(a, maxAnswer) })
  }
  return out
}

/** meta description 80~160자: 우선 값이 80자 미만이면 본문 발췌로 보충 */
export function metaDescription(primary: string | undefined | null, fallback: string, max = 160): string {
  const norm = (s: string) => String(s || '').replace(/\s+/g, ' ').trim()
  let d = norm(primary || '')
  if (d.length < 80) {
    const f = norm(fallback)
    d = d ? (f && !f.startsWith(d) ? `${d} ${f}` : f || d) : f
  }
  if (d.length <= max) return d
  const cut = d.slice(0, max - 1)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다.'), cut.lastIndexOf('요.'))
  return stop >= max * 0.5 ? cut.slice(0, stop + (cut[stop] === '.' ? 1 : 2)).trim() : cut.trimEnd() + '…'
}

/** D1 'YYYY-MM-DD HH:MM:SS' → ISO(UTC) */
export function isoDate(v: string | null | undefined): string | undefined {
  if (!v) return undefined
  const s = String(v).trim().replace(' ', 'T')
  const d = new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(s) ? s : s + 'Z')
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}
export const ymd = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : '')
