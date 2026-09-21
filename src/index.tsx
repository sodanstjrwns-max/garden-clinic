import { Hono } from 'hono'
import { HomePage } from './pages/home'
import { TreatmentListPage, TreatmentDetailPage } from './pages/treatments'
import { FaqPage } from './pages/faq'
import { DoctorListPage, DoctorDetailPage } from './pages/doctors'
import { MissionPage, DirectionsPage, PricingPage, PolicyPage, NotFoundPage } from './pages/info'
import { SasangTestPage, SasangResultPage } from './pages/sasang'
import { EncyclopediaListPage, EncyclopediaDetailPage } from './pages/encyclopedia'
import { ReservationPage, LoginPage, RegisterPage, MyPage, ReviewPage } from './pages/forms'
import { CaseGalleryPage, CaseDetailPage } from './pages/cases'
import { ColumnListPage, ColumnDetailPage, NoticeListPage, NoticeDetailPage, AreaPage, AreaIndexPage, SearchPage, HerbGalleryPage, HerbDetailPage, VideoPage, herbIsThin } from './pages/content'
import type { SearchHit } from './pages/content'
import { TREATMENTS } from './data/treatments'
import { ENC_TERMS } from './data/encyclopedia'
import { AdminLoginPage, AdminDashboard, AdminFeesPage } from './pages/admin'
import type { FeeEditGroup } from './pages/admin'
import { PRICE_CATEGORIES } from './data/pricing'
import type { PriceCategory } from './data/pricing'
import { adminStatsPage, fetchSiteStats, STATS_KEY, MASTER_KEY } from './pages/admin-stats'
import { SeoHealthPage } from './pages/seohealth'
import { getTreatment } from './data/treatments'
import { getDoctor } from './data/doctors'
import { getEncTerm } from './data/encyclopedia'
import { getArea, AREA_TREATMENTS } from './data/areas'
import {
  createToken,
  verifyToken,
  hashPassword,
  parseCookie,
  cookieHeader,
  clearCookieHeader,
  SESSION_SECRET_FALLBACK,
  USER_MAXAGE,
  ADMIN_MAXAGE,
} from './lib/auth'
import { sitemapIndexXml, sitemapChildXml, sitemapPagesUrls, sitemapColumnUrls, sitemapNoticeUrls, sitemapHerbUrls, SITEMAP_CHILDREN, robotsTxt, llmsTxt, webManifest, serviceWorkerJs } from './lib/seo'
import type { SitemapChild } from './lib/seo'
import { CLINIC } from './data/clinic'

type Bindings = {
  DB?: D1Database
  R2?: R2Bucket
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  RESEND_API_KEY?: string
  NOTIFICATION_EMAIL?: string
  MAIL_FROM?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ===== A4 canonical 통일: www → 비www 301 리다이렉트 =====
// 같은 페이지가 www / 비www 두 주소로 존재하면 색인·평가 점수가 분산된다.
// 대표 URL(gardenclinic.kr)로 영구(301) 통일. 쿼리스트링·경로 보존.
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname === 'www.gardenclinic.kr') {
    url.hostname = 'gardenclinic.kr'
    return c.redirect(url.toString(), 301)
  }
  await next()
})

const html = (node: any) => '<!DOCTYPE html>' + node.toString()
const secret = (c: any) => c.env.ADMIN_SESSION_SECRET || SESSION_SECRET_FALLBACK

// ===== IndexNow 핑 헬퍼 (빙·네이버 Yeti·Yandex 즉시 색인) =====
// 콘텐츠 발행/수정 시 변경된 URL을 검색엔진에 즉시 통보.
// 여러 URL 동시 제출 가능. 네트워크 실패는 무시(콘텐츠 저장은 이미 성공한 상태).
async function pingIndexNow(paths: string[]): Promise<Record<string, number>> {
  const host = CLINIC.domain.replace(/^https?:\/\//, '')
  const urlList = paths
    .filter(Boolean)
    .map((p) => (p.startsWith('http') ? p : `https://${host}${p.startsWith('/') ? p : '/' + p}`))
  if (urlList.length === 0) return {}
  const payload = {
    host,
    key: CLINIC.indexNowKey,
    keyLocation: `https://${host}/${CLINIC.indexNowKey}.txt`,
    urlList,
  }
  const results: Record<string, number> = {}
  await Promise.all(
    ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'].map(async (ep) => {
      try {
        // 외부 색인 API가 느리거나 응답 없을 때 저장 요청 전체가 멈추지 않도록 타임아웃(5초) 적용
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 5000)
        try {
          const r = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
            signal: ctrl.signal,
          })
          results[ep] = r.status
        } finally {
          clearTimeout(timer)
        }
      } catch {
        results[ep] = 0
      }
    })
  )
  return results
}

// HTML 본문에서 텍스트 길이로 읽기시간(분) 추정 — 한국어 분당 약 500자
function estimateReadingTime(html: string): number {
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, '')
  return Math.max(1, Math.round(text.length / 500))
}

// ===== 유튜브 video id 추출 (watch, youtu.be, shorts, embed 지원) =====
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m && m[1]) return m[1]
  }
  // 그냥 11자리 id를 붙여넣은 경우
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim()
  return null
}

// ===== 봇 판별 =====
function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|gptbot|claudebot|perplexity/i.test(ua || '')
}

// ===== 인증 헬퍼 =====
async function getUser(c: any): Promise<{ id: number; name: string; email: string } | null> {
  const token = parseCookie(c.req.header('Cookie') || null, 'session')
  if (!token) return null
  const payload = await verifyToken(secret(c), token)
  if (!payload || payload.role !== 'user') return null
  return { id: payload.id, name: payload.name, email: payload.email }
}
async function isAdmin(c: any): Promise<boolean> {
  const token = parseCookie(c.req.header('Cookie') || null, 'admin_session')
  if (!token) return false
  const payload = await verifyToken(secret(c), token)
  return !!(payload && payload.role === 'admin')
}

// ===== 비급여 진료비(수가) 로더 =====
// DB(fees)에서 sort_group 단위로 묶어 PriceCategory[] 구조로 복원.
// publishedOnly=true 면 공개 항목만. 실패/빈 결과면 null 반환 → 호출부에서 하드코딩 시드로 폴백.
async function loadFeeCategories(db: any, publishedOnly: boolean): Promise<PriceCategory[] | null> {
  if (!db) return null
  try {
    const where = publishedOnly ? 'WHERE is_published = 1' : ''
    const { results } = await db
      .prepare(
        `SELECT id, category, category_icon, group_note, name, price, note, is_published, sort_group, sort_order
         FROM fees ${where} ORDER BY sort_group ASC, sort_order ASC, id ASC`,
      )
      .all()
    if (!results || !results.length) return null
    const map = new Map<number, PriceCategory>()
    for (const r of results as any[]) {
      let cat = map.get(r.sort_group)
      if (!cat) {
        cat = { key: 'g' + r.sort_group, title: r.category, icon: r.category_icon || 'fa-circle-dot', desc: r.group_note || undefined, items: [] }
        map.set(r.sort_group, cat)
      }
      cat.items.push({ name: r.name, price: r.price, note: r.note || undefined })
    }
    return [...map.values()]
  } catch (e) {
    console.error('loadFeeCategories error', e)
    return null
  }
}

// 관리자 편집기용: 비공개 포함 전체 행 + 항목별 is_published 유지.
async function loadFeeGroupsForAdmin(db: any): Promise<FeeEditGroup[]> {
  if (!db) return seedFeeGroups()
  try {
    const { results } = await db
      .prepare(
        `SELECT id, category, category_icon, group_note, name, price, note, is_published, sort_group, sort_order
         FROM fees ORDER BY sort_group ASC, sort_order ASC, id ASC`,
      )
      .all()
    if (!results || !results.length) return seedFeeGroups()
    const map = new Map<number, FeeEditGroup>()
    for (const r of results as any[]) {
      let g = map.get(r.sort_group)
      if (!g) {
        g = { title: r.category, icon: r.category_icon || 'fa-circle-dot', desc: r.group_note || '', items: [] }
        map.set(r.sort_group, g)
      }
      g.items.push({ name: r.name, price: r.price, note: r.note || '', is_published: r.is_published })
    }
    return [...map.values()]
  } catch (e) {
    console.error('loadFeeGroupsForAdmin error', e)
    return seedFeeGroups()
  }
}

// 하드코딩 시드(src/data/pricing.ts) → 편집기 그룹 (전 항목 공개)
function seedFeeGroups(): FeeEditGroup[] {
  return PRICE_CATEGORIES.map((cat) => ({
    title: cat.title,
    icon: cat.icon,
    desc: cat.desc || '',
    items: cat.items.map((it) => ({ name: it.name, price: it.price, note: it.note || '', is_published: 1 })),
  }))
}

// ============================================================
// 정적 페이지
// ============================================================
app.get('/', async (c) => {
  let popup: any = null
  if (c.env.DB) {
    const today = new Date().toISOString().slice(0, 10)
    popup = await c.env.DB.prepare(
      `SELECT id, title, body, image, link_url, category FROM notices
       WHERE show_popup = 1 AND (popup_until IS NULL OR popup_until = '' OR popup_until >= ?)
       ORDER BY is_pinned DESC, created_at DESC LIMIT 1`
    ).bind(today).first().catch(() => null)
  }
  return c.html(html(<HomePage popup={popup as any} />))
})
app.get('/mission', (c) => c.html(html(<MissionPage />)))
app.get('/directions', (c) => c.html(html(<DirectionsPage />)))
app.get('/pricing', async (c) => {
  const cats = await loadFeeCategories(c.env.DB, true)
  return c.html(html(<PricingPage categories={cats || undefined} />))
})
app.get('/faq', (c) => c.html(html(<FaqPage />)))
app.get('/sasang-test', (c) => c.html(html(<SasangTestPage />)))
app.get('/sasang-test/result/:type', (c) => {
  const type = c.req.param('type')
  if (!['taeyang', 'taeeum', 'soyang', 'soeum'].includes(type)) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<SasangResultPage type={type as any} />))
})
app.get('/reservation', (c) => c.html(html(<ReservationPage preselect={c.req.query('t') || ''} />)))
app.get('/review', (c) => c.html(html(<ReviewPage />)))
app.get('/privacy', (c) => c.html(html(<PolicyPage kind="privacy" />)))
app.get('/terms', (c) => c.html(html(<PolicyPage kind="terms" />)))

// ===== 진료 =====
app.get('/treatments', (c) => c.html(html(<TreatmentListPage />)))
app.get('/treatments/:slug', (c) => {
  const t = getTreatment(c.req.param('slug'))
  if (!t) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<TreatmentDetailPage slug={t.slug} />))
})

// ===== 의료진 =====
app.get('/doctors', (c) => c.html(html(<DoctorListPage />)))
app.get('/doctors/:slug', (c) => {
  const d = getDoctor(c.req.param('slug'))
  if (!d) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<DoctorDetailPage slug={d.slug} />))
})

// ===== 백과사전 =====
app.get('/encyclopedia', (c) => c.html(html(<EncyclopediaListPage />)))
app.get('/encyclopedia/:slug', (c) => {
  const t = getEncTerm(c.req.param('slug'))
  if (!t) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<EncyclopediaDetailPage slug={t.slug} />))
})

// ===== 지역 SEO: 내원 가능 지역 인덱스 =====
app.get('/area', (c) => c.html(html(<AreaIndexPage />)))

// ===== 지역 SEO: /area/:area-:tx =====
app.get('/area/:combo', (c) => {
  const combo = c.req.param('combo')
  // 진료 slug는 다중 하이픈 가능(custom-herbal, car-accident). 뒤에서 매칭
  const txSlugs = AREA_TREATMENTS.map((t) => t.slug)
  let matchedTx = ''
  let areaSlug = ''
  for (const tx of txSlugs) {
    if (combo.endsWith('-' + tx)) {
      matchedTx = tx
      areaSlug = combo.slice(0, combo.length - tx.length - 1)
      break
    }
  }
  if (!matchedTx || !getArea(areaSlug) || !getTreatment(matchedTx)) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<AreaPage areaSlug={areaSlug} txSlug={matchedTx} />))
})

// ============================================================
// 인증 페이지 / API
// ============================================================
app.get('/auth/login', (c) => c.html(html(<LoginPage />)))
app.get('/auth/register', (c) => c.html(html(<RegisterPage />)))
app.get('/auth/mypage', async (c) => {
  const user = await getUser(c)
  let reservations: any[] = []
  if (user && c.env.DB) {
    const u: any = await c.env.DB.prepare('SELECT phone FROM users WHERE id = ?').bind(user.id).first()
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM reservations WHERE email = ? OR phone = ? ORDER BY created_at DESC LIMIT 20'
    ).bind(user.email, u?.phone || '').all()
    reservations = results || []
  }
  return c.html(html(<MyPage user={user || undefined} reservations={reservations} />))
})

app.post('/api/auth/register', async (c) => {
  if (!c.env.DB) return c.json({ error: '데이터베이스가 준비되지 않았습니다.' }, 503)
  const b = await c.req.json()
  if (!b.name || !b.email || !b.phone || !b.password || !b.agree) return c.json({ error: '필수 항목을 확인해 주세요.' }, 400)
  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(b.email).first()
  if (exists) return c.json({ error: '이미 가입된 이메일입니다.' }, 409)
  const hash = await hashPassword(b.password, b.email)
  const res = await c.env.DB.prepare(
    'INSERT INTO users (name, email, phone, password_hash, agree_marketing) VALUES (?,?,?,?,?)'
  ).bind(b.name, b.email, b.phone, hash, b.marketing ? 1 : 0).run()
  const id = res.meta.last_row_id
  const token = await createToken(secret(c), { role: 'user', id, name: b.name, email: b.email }, USER_MAXAGE)
  c.header('Set-Cookie', cookieHeader('session', token, USER_MAXAGE))
  return c.json({ ok: true })
})

app.post('/api/auth/login', async (c) => {
  if (!c.env.DB) return c.json({ error: '데이터베이스가 준비되지 않았습니다.' }, 503)
  const b = await c.req.json()
  const user: any = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(b.email).first()
  if (!user) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  const hash = await hashPassword(b.password, b.email)
  if (hash !== user.password_hash) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  const token = await createToken(secret(c), { role: 'user', id: user.id, name: user.name, email: user.email }, USER_MAXAGE)
  c.header('Set-Cookie', cookieHeader('session', token, USER_MAXAGE))
  return c.json({ ok: true })
})

app.post('/api/auth/logout', (c) => {
  c.header('Set-Cookie', clearCookieHeader('session'))
  return c.json({ ok: true })
})

// ===== 예약 API =====
app.post('/api/reservation', async (c) => {
  const b = await c.req.json()
  if (!b.name || !b.phone || !b.treatment || !b.agree) return c.json({ error: '필수 항목을 확인해 주세요.' }, 400)
  const utm = b.utm || {}
  if (c.env.DB) {
    await c.env.DB.prepare(
      'INSERT INTO reservations (name, phone, email, treatment, preferred, message, utm_source, utm_medium, utm_campaign, referrer) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).bind(
      b.name, b.phone, b.email || '', b.treatment, b.preferred || '', b.message || '',
      (utm.source || '').slice(0, 100), (utm.medium || '').slice(0, 100), (utm.campaign || '').slice(0, 100), (utm.referrer || '').slice(0, 300)
    ).run()
  }
  // 이메일 알림 (Resend)
  if (c.env.RESEND_API_KEY && c.env.NOTIFICATION_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: c.env.MAIL_FROM || '정원한의원 예약알림 <noreply@gardenclinic.kr>',
          to: c.env.NOTIFICATION_EMAIL,
          subject: `[예약] ${b.name}님 (${b.treatment})`,
          html: `<p>성함: ${b.name}<br>연락처: ${b.phone}<br>이메일: ${b.email || '-'}<br>진료: ${b.treatment}<br>희망: ${b.preferred || '-'}<br>내용: ${b.message || '-'}</p>`,
        }),
      })
    } catch (e) { console.error('[reservation mail]', e) }
  }
  return c.json({ ok: true })
})

// ===== 리드 API (체질 테스트 → 맞춤 진료 제안) =====
app.post('/api/lead', async (c) => {
  const b = await c.req.json()
  if (!b.name || !b.phone || !b.agree) return c.json({ error: '필수 항목을 확인해 주세요.' }, 400)
  const utm = b.utm || {}
  if (c.env.DB) {
    await c.env.DB.prepare(
      'INSERT INTO leads (name, phone, sasang_type, interest, message, utm_source, utm_medium, utm_campaign, referrer) VALUES (?,?,?,?,?,?,?,?,?)'
    ).bind(
      String(b.name).slice(0, 50), String(b.phone).slice(0, 30), b.sasang_type || '', b.interest || '', b.message || '',
      (utm.source || '').slice(0, 100), (utm.medium || '').slice(0, 100), (utm.campaign || '').slice(0, 100), (utm.referrer || '').slice(0, 300)
    ).run()
  }
  // 이메일 알림 (Resend)
  if (c.env.RESEND_API_KEY && c.env.NOTIFICATION_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: c.env.MAIL_FROM || '정원한의원 예약알림 <noreply@gardenclinic.kr>',
          to: c.env.NOTIFICATION_EMAIL,
          subject: `[체질테스트 리드] ${b.name}님 (${b.sasang_type || '-'})`,
          html: `<p>성함: ${b.name}<br>연락처: ${b.phone}<br>체질: ${b.sasang_type || '-'}<br>관심 진료: ${b.interest || '-'}</p>`,
        }),
      })
    } catch (e) { console.error('[lead mail]', e) }
  }
  return c.json({ ok: true })
})

// ===== 퍼널 이벤트 추적 API (sendBeacon) =====
const TRACK_EVENTS = new Set(['page_view', 'ti_start', 'ti_complete', 'ti_lead', 'resv_start', 'resv_step', 'resv_submit', 'share_click', 'review_click', 'cta_call', 'cta_book', 'cta_ti', 'cta_map'])
app.post('/api/track', async (c) => {
  if (!c.env.DB) return c.json({ ok: true })
  try {
    const b = await c.req.json()
    if (!b.event || !TRACK_EVENTS.has(b.event)) return c.json({ ok: true })
    const ua = c.req.header('User-Agent') || ''
    const utm = b.utm || {}
    await c.env.DB.prepare(
      'INSERT INTO funnel_events (event, path, session_id, utm_source, utm_medium, utm_campaign, referrer, meta, is_bot) VALUES (?,?,?,?,?,?,?,?,?)'
    ).bind(
      b.event, (b.path || '').slice(0, 200), (b.sid || '').slice(0, 64),
      (utm.source || '').slice(0, 100), (utm.medium || '').slice(0, 100), (utm.campaign || '').slice(0, 100), (utm.referrer || '').slice(0, 300),
      JSON.stringify(b.meta || {}).slice(0, 500), isBot(ua) ? 1 : 0
    ).run()
  } catch (e) {}
  return c.json({ ok: true })
})

// ============================================================
// 비포애프터
// ============================================================
app.get('/cases/gallery', async (c) => {
  const loggedIn = !!(await getUser(c))
  const cat = c.req.query('cat')
  const doctor = c.req.query('doctor')
  let cases: any[] = []
  if (c.env.DB) {
    let q
    if (cat && doctor) {
      q = c.env.DB.prepare('SELECT * FROM cases WHERE category = ? AND doctor = ? ORDER BY created_at DESC').bind(cat, doctor)
    } else if (cat) {
      q = c.env.DB.prepare('SELECT * FROM cases WHERE category = ? ORDER BY created_at DESC').bind(cat)
    } else if (doctor) {
      q = c.env.DB.prepare('SELECT * FROM cases WHERE doctor = ? ORDER BY created_at DESC').bind(doctor)
    } else {
      q = c.env.DB.prepare('SELECT * FROM cases ORDER BY created_at DESC')
    }
    const { results } = await q.all()
    cases = results || []
  }
  return c.html(html(<CaseGalleryPage cases={cases as any} loggedIn={loggedIn} activeCat={cat} activeDoctor={doctor} />))
})

app.get('/cases/:id', async (c) => {
  const loggedIn = !!(await getUser(c))
  const id = c.req.param('id')
  if (!c.env.DB) return c.html(html(<NotFoundPage />), 404)
  const caseData: any = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first()
  if (!caseData) return c.html(html(<NotFoundPage />), 404)
  // 조회수 (봇 제외)
  const ua = c.req.header('User-Agent') || ''
  const bot = isBot(ua)
  await c.env.DB.prepare('INSERT INTO view_logs (content_type, content_id, is_bot, ua) VALUES (?,?,?,?)').bind('case', id, bot ? 1 : 0, ua.slice(0, 200)).run()
  if (!bot) await c.env.DB.prepare('UPDATE cases SET views = views + 1 WHERE id = ?').bind(id).run()
  return c.html(html(<CaseDetailPage caseData={caseData} loggedIn={loggedIn} />))
})

// 케이스 이미지 (의료법 게이팅: after는 로그인 필수)
app.get('/api/case-image/:id/:type', async (c) => {
  if (!c.env.R2 || !c.env.DB) return c.notFound()
  const id = c.req.param('id')
  const type = c.req.param('type') // before | pano_before | pano_after | intra_before | intra_after
  const caseData: any = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first()
  if (!caseData) return c.notFound()
  // after 이미지 게이팅
  if (type.includes('after')) {
    const loggedIn = !!(await getUser(c))
    if (!loggedIn) return c.text('Unauthorized', 401)
  }
  let key = ''
  if (type === 'before') key = caseData.pano_before || caseData.intra_before
  else key = caseData[type]
  if (!key) return c.notFound()
  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'private, max-age=3600' } })
})

// ============================================================
// 칼럼 / 공지
// ============================================================
app.get('/column', async (c) => {
  let cols: any[] = []
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare('SELECT * FROM columns WHERE published = 1 ORDER BY published_at DESC').all()
    cols = results || []
  }
  return c.html(html(<ColumnListPage columns={cols as any} />))
})
app.get('/column/:slug', async (c) => {
  if (!c.env.DB) return c.html(html(<NotFoundPage />), 404)
  // 저장된 슬러그의 앞뒤 공백까지 허용 (과거 'our-treatment-philosophy ' 처럼 공백이 섞여 404 나던 문제)
  const col: any = await c.env.DB.prepare('SELECT * FROM columns WHERE TRIM(slug) = ? AND published = 1').bind(c.req.param('slug').trim()).first()
  if (!col) return c.html(html(<NotFoundPage />), 404)
  const ua = c.req.header('User-Agent') || ''
  if (!isBot(ua)) await c.env.DB.prepare('UPDATE columns SET views = views + 1 WHERE id = ?').bind(col.id).run()
  return c.html(html(<ColumnDetailPage column={col} />))
})
// ============================================================
// 사이트 통합 검색
// ============================================================
app.get('/search', async (c) => {
  const raw = (c.req.query('q') || '').trim()
  const q = raw.toLowerCase()
  const hits: SearchHit[] = []

  if (q.length >= 1) {
    const has = (...vals: (string | undefined | null)[]) =>
      vals.some((v) => (v || '').toLowerCase().includes(q))

    // 1) 진료 안내 (정적)
    for (const t of TREATMENTS) {
      if (has(t.name, t.shortName, t.tagline, t.summary, (t.keywords || []).join(' '))) {
        hits.push({
          type: 'treatment',
          typeLabel: '진료 안내',
          title: t.name,
          desc: t.summary || t.tagline || '',
          url: `/treatments/${t.slug}`,
          icon: t.icon || 'fa-stethoscope',
        })
      }
    }

    // 2) 한의학 백과사전 (정적) — 최대 12개
    let encCount = 0
    for (const term of ENC_TERMS) {
      if (encCount >= 12) break
      if (has(term.term, term.hanja, term.desc, term.category)) {
        hits.push({
          type: 'encyclopedia',
          typeLabel: '한의학 백과사전',
          title: `${term.term}${term.hanja ? ` (${term.hanja})` : ''}`,
          desc: term.desc || '',
          url: `/encyclopedia/${term.slug}`,
          icon: 'fa-book',
        })
        encCount++
      }
    }

    // 3) 칼럼 (D1)
    if (c.env.DB) {
      try {
        const like = `%${raw}%`
        const { results: cols } = await c.env.DB.prepare(
          'SELECT title, slug, excerpt FROM columns WHERE published = 1 AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ? OR keywords LIKE ?) ORDER BY published_at DESC LIMIT 20'
        ).bind(like, like, like, like).all()
        for (const col of (cols || []) as any[]) {
          hits.push({
            type: 'column',
            typeLabel: '원장 칼럼',
            title: col.title,
            desc: col.excerpt || '',
            url: `/column/${col.slug}`,
            icon: 'fa-feather-pointed',
          })
        }

        // 4) 공지 (D1)
        const { results: nots } = await c.env.DB.prepare(
          'SELECT id, title, body FROM notices WHERE title LIKE ? OR body LIKE ? ORDER BY created_at DESC LIMIT 10'
        ).bind(like, like).all()
        for (const n of (nots || []) as any[]) {
          const plain = String(n.body || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          hits.push({
            type: 'notice',
            typeLabel: '공지사항',
            title: n.title,
            desc: plain.slice(0, 90),
            url: `/notice/${n.id}`,
            icon: 'fa-bullhorn',
          })
        }
      } catch (e) {
        // 검색 실패 시에도 정적 결과는 노출
      }
    }
  }

  return c.html(html(<SearchPage query={raw} hits={hits} />))
})

// 본문 삽입 이미지 서빙 (R2 key 직접)
app.get('/api/content-image/:key{.+}', async (c) => {
  if (!c.env.R2) return c.notFound()
  const key = decodeURIComponent(c.req.param('key'))
  if (!key.startsWith('content/')) return c.notFound()
  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } })
})

app.get('/api/column-image/:id', async (c) => {
  if (!c.env.R2 || !c.env.DB) return c.notFound()
  const col: any = await c.env.DB.prepare('SELECT thumbnail FROM columns WHERE id = ?').bind(c.req.param('id')).first()
  if (!col?.thumbnail) return c.notFound()
  const obj = await c.env.R2.get(col.thumbnail)
  if (!obj) return c.notFound()
  // ?v= 버전 파라미터가 있으면 썸네일 교체 시 URL이 바뀌므로 장기 캐시 안전, 없으면 짧게 캐시
  const versioned = new URL(c.req.url).searchParams.has('v')
  const cacheControl = versioned
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=300, must-revalidate'
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': cacheControl } })
})

// ── 약재 갤러리 이미지 서빙 (herb/ 프리픽스) ──
app.get('/api/herb-image/:key{.+}', async (c) => {
  if (!c.env.R2) return c.notFound()
  const key = decodeURIComponent(c.req.param('key'))
  if (!key.startsWith('herb/')) return c.notFound()
  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } })
})

// ── 약재 갤러리 공개 페이지 ──
app.get('/herbs', async (c) => {
  let photos: any[] = []
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM herb_photos WHERE is_visible = 1 ORDER BY created_at DESC, id DESC LIMIT 200'
    ).all()
    photos = results || []
  }
  return c.html(html(<HerbGalleryPage photos={photos as any} />))
})
// 상세: 숫자면 id, 아니면 slug. 숨김/없음은 404
app.get('/herbs/:key', async (c) => {
  if (!c.env.DB) return c.html(html(<NotFoundPage />), 404)
  const key = decodeURIComponent(c.req.param('key') || '').trim()
  if (!key) return c.html(html(<NotFoundPage />), 404)
  const photo: any = /^\d+$/.test(key)
    ? await c.env.DB.prepare('SELECT * FROM herb_photos WHERE id = ? AND is_visible = 1').bind(Number(key)).first()
    : await c.env.DB.prepare('SELECT * FROM herb_photos WHERE slug = ? AND is_visible = 1').bind(key).first()
  if (!photo) return c.html(html(<NotFoundPage />), 404)
  // 이전(더 오래된)·다음(더 최신) — 목록 정렬(created_at DESC, id DESC) 기준
  const ca = photo.created_at || ''
  const [prevRes, nextRes] = await Promise.all([
    c.env.DB.prepare(
      'SELECT id, title, herb_name, slug FROM herb_photos WHERE is_visible = 1 AND (created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC, id DESC LIMIT 1'
    ).bind(ca, ca, photo.id).first(),
    c.env.DB.prepare(
      'SELECT id, title, herb_name, slug FROM herb_photos WHERE is_visible = 1 AND (created_at > ? OR (created_at = ? AND id > ?)) ORDER BY created_at ASC, id ASC LIMIT 1'
    ).bind(ca, ca, photo.id).first(),
  ])
  // 같은 날(KST) 같은 이름의 몇 번째 사진인지 → 제목 고유화 "(n번째)"
  let seq = 1
  try {
    const r: any = await c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM herb_photos WHERE is_visible = 1 AND id < ? AND date(created_at, '+9 hours') = date(?, '+9 hours') AND COALESCE(title,'') = COALESCE(?, '') AND COALESCE(herb_name,'') = COALESCE(?, '')"
    ).bind(photo.id, ca, photo.title ?? '', photo.herb_name ?? '').first()
    seq = Number(r?.n ?? 0) + 1
  } catch { seq = 1 }
  // 상세 본문 미작성(300자 미만)이면 검색 색인 제외 — 헤더로도 명시 (meta robots 와 동일)
  if (herbIsThin(photo)) c.header('X-Robots-Tag', 'noindex, follow')
  return c.html(html(<HerbDetailPage photo={photo} prev={prevRes as any} next={nextRes as any} seq={seq} />))
})

// ── 영상 공개 페이지 ──
app.get('/videos', async (c) => {
  let videos: any[] = []
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM videos WHERE is_visible = 1 ORDER BY sort_order ASC, created_at DESC, id DESC LIMIT 200'
    ).all()
    videos = results || []
  }
  return c.html(html(<VideoPage videos={videos as any} />))
})

app.get('/notice', async (c) => {
  let notices: any[] = []
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare('SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC').all()
    notices = results || []
  }
  return c.html(html(<NoticeListPage notices={notices as any} />))
})
app.get('/notice/:id', async (c) => {
  if (!c.env.DB) return c.html(html(<NotFoundPage />), 404)
  const n: any = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(c.req.param('id')).first()
  if (!n) return c.html(html(<NotFoundPage />), 404)
  return c.html(html(<NoticeDetailPage notice={n} />))
})
app.get('/api/notice-image/:id', async (c) => {
  if (!c.env.R2 || !c.env.DB) return c.notFound()
  const n: any = await c.env.DB.prepare('SELECT image FROM notices WHERE id = ?').bind(c.req.param('id')).first()
  if (!n?.image) return c.notFound()
  const obj = await c.env.R2.get(n.image)
  if (!obj) return c.notFound()
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' } })
})

// ============================================================
// 관리자
// ============================================================
app.get('/admin/login', (c) => c.html(html(<AdminLoginPage />)))
app.post('/admin/login', async (c) => {
  const b = await c.req.json()
  const adminPw = c.env.ADMIN_PASSWORD || 'jeongwon2020'
  if (b.password !== adminPw) return c.json({ error: 'invalid' }, 401)
  const token = await createToken(secret(c), { role: 'admin' }, ADMIN_MAXAGE)
  c.header('Set-Cookie', cookieHeader('admin_session', token, ADMIN_MAXAGE))
  return c.json({ ok: true })
})
app.post('/admin/logout', (c) => {
  c.header('Set-Cookie', clearCookieHeader('admin_session'))
  return c.json({ ok: true })
})

app.get('/admin/stats', async (c) => {
  if (!(await isAdmin(c)) && c.req.query('key') !== STATS_KEY && c.req.query('key') !== MASTER_KEY) return c.text('Not Found', 404)
  return c.html(adminStatsPage(await fetchSiteStats()))
})

// ────────────────────────────────────────────────────────────
// 실예약 로컬 통계 — GET /api/local-stats?key=<토큰|마스터키>
// 최근 28일/직전 28일 건수만 반환 (개인정보 응답 금지 — 건수만)
// ────────────────────────────────────────────────────────────
const LOCAL_STATS_TABLES = ['reservations', 'leads']

app.get('/api/local-stats', async (c) => {
  const key = c.req.query('key')
  if (key !== STATS_KEY && key !== MASTER_KEY) return c.text('Not Found', 404)
  const db = c.env.DB
  if (!db) return c.json({ supported: false })
  try {
    const tables: { name: string; cur: number; prev: number }[] = []
    for (const t of LOCAL_STATS_TABLES) {
      const row = await db
        .prepare(
          `SELECT
             SUM(CASE WHEN created_at >= datetime('now','-28 days') THEN 1 ELSE 0 END) AS cur,
             SUM(CASE WHEN created_at >= datetime('now','-56 days') AND created_at < datetime('now','-28 days') THEN 1 ELSE 0 END) AS prev
           FROM ${t}`,
        )
        .first<{ cur: number | null; prev: number | null }>()
      tables.push({ name: t, cur: Number(row?.cur ?? 0), prev: Number(row?.prev ?? 0) })
    }
    const total = tables.reduce((a, t) => ({ cur: a.cur + t.cur, prev: a.prev + t.prev }), { cur: 0, prev: 0 })
    return c.json({ supported: true, tables, total })
  } catch {
    return c.json({ supported: false })
  }
})

app.get('/admin', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login')
  const tab = c.req.query('tab') || 'dashboard'
  const db = c.env.DB
  let stats: any = { users: 0, reservations: 0, cases: 0, columns: 0, notices: 0, leads: 0, recalls: 0,
    todayReservations: 0, todayLeads: 0, pendingReservations: 0, newLeads: 0, dueRecalls: 0, popupActive: null }
  let data: any = null
  if (db) {
    const count = async (t: string) => ((await db.prepare(`SELECT COUNT(*) as n FROM ${t}`).first()) as any)?.n || 0
    const scalar = async (sql: string, ...b: any[]) => {
      try { const r: any = await db.prepare(sql).bind(...b).first(); return r?.n ?? 0 } catch { return 0 }
    }
    const today = new Date().toISOString().slice(0, 10)
    const popupRow: any = await db.prepare(
      `SELECT id, title FROM notices WHERE show_popup = 1 AND (popup_until IS NULL OR popup_until = '' OR popup_until >= ?)
       ORDER BY is_pinned DESC, created_at DESC LIMIT 1`
    ).bind(today).first().catch(() => null)
    stats = {
      users: await count('users'),
      reservations: await count('reservations'),
      cases: await count('cases'),
      columns: await count('columns'),
      notices: await count('notices'),
      leads: await count('leads'),
      recalls: await count('recalls'),
      todayReservations: await scalar(`SELECT COUNT(*) as n FROM reservations WHERE date(created_at) = ?`, today),
      todayLeads: await scalar(`SELECT COUNT(*) as n FROM leads WHERE date(created_at) = ?`, today),
      pendingReservations: await scalar(`SELECT COUNT(*) as n FROM reservations WHERE COALESCE(status,'') NOT IN ('confirmed','done','cancelled','완료','확정','취소')`),
      newLeads: await scalar(`SELECT COUNT(*) as n FROM leads WHERE COALESCE(status,'') NOT IN ('done','contacted','완료','상담완료')`),
      dueRecalls: await scalar(`SELECT COUNT(*) as n FROM recalls WHERE date(due_date) <= ? AND COALESCE(status,'') NOT IN ('done','완료')`, today),
      popupActive: popupRow ? popupRow.title : null,
    }
    if (tab === 'reservations') data = (await db.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all()).results
    else if (tab === 'cases') data = (await db.prepare('SELECT * FROM cases ORDER BY created_at DESC').all()).results
    else if (tab === 'columns') data = (await db.prepare('SELECT * FROM columns ORDER BY published_at DESC').all()).results
    else if (tab === 'notices') data = (await db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all()).results
    else if (tab === 'users') data = (await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()).results
    else if (tab === 'leads') data = (await db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all()).results
    else if (tab === 'recalls') data = (await db.prepare('SELECT * FROM recalls ORDER BY due_date ASC').all()).results
  }
  return c.html(html(<AdminDashboard tab={tab} stats={stats} data={data} />))
})

// 비급여 진료비 관리 페이지 (편집기)
app.get('/admin/fees', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login')
  const groups = await loadFeeGroupsForAdmin(c.env.DB)
  return c.html(html(<AdminFeesPage groups={groups} />))
})

// 관리자 미들웨어 (API)
app.use('/admin/api/*', async (c, next) => {
  if (!(await isAdmin(c))) return c.json({ error: 'unauthorized' }, 401)
  await next()
})

// 비급여 진료비 저장 — 전체 교체(delete-all + insert) 단일 트랜잭션(batch)
app.post('/admin/api/fees', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  let body: any
  try { body = await c.req.json() } catch { return c.json({ error: 'bad json' }, 400) }
  const groups = Array.isArray(body?.groups) ? body.groups : []
  const ins = c.env.DB.prepare(
    'INSERT INTO fees (category, category_icon, group_note, name, price, note, is_highlight, is_published, sort_group, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)',
  )
  const stmts: any[] = [c.env.DB.prepare('DELETE FROM fees')]
  groups.forEach((g: any, gi: number) => {
    const title = String(g?.title ?? '').trim()
    if (!title) return
    const icon = String(g?.icon ?? '').trim() || 'fa-circle-dot'
    const desc = g?.desc ? String(g.desc).trim() : null
    const items = Array.isArray(g?.items) ? g.items : []
    items.forEach((it: any, ii: number) => {
      const name = String(it?.name ?? '').trim()
      if (!name) return
      const price = String(it?.price ?? '').trim()
      const note = it?.note ? String(it.note).trim() : null
      const pub = it?.is_published === 0 || it?.is_published === false ? 0 : 1
      stmts.push(ins.bind(title, icon, desc, name, price, note, 0, pub, gi + 1, ii))
    })
  })
  try {
    await c.env.DB.batch(stmts)
    return c.json({ ok: true, count: stmts.length - 1 })
  } catch (e: any) {
    console.error('save fees error', e)
    return c.json({ error: 'save failed' }, 500)
  }
})

// 케이스 등록 (multipart + R2)
app.post('/admin/api/cases', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const form = await c.req.formData()
  const uploadKey = async (field: string): Promise<string | null> => {
    const file = form.get(field) as File | null
    if (!file || typeof file === 'string' || file.size === 0) return null
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const key = `cases/${Date.now()}-${field}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    if (c.env.R2) await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
    return key
  }
  const pano_before = await uploadKey('pano_before')
  const pano_after = await uploadKey('pano_after')
  const intra_before = await uploadKey('intra_before')
  const intra_after = await uploadKey('intra_after')
  const res = await c.env.DB.prepare(
    'INSERT INTO cases (title, description, age_group, gender, category, area, doctor, duration, pano_before, pano_after, intra_before, intra_after) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(
    form.get('title'), form.get('description') || '', form.get('age_group') || '', form.get('gender') || '',
    form.get('category') || '', form.get('area') || '', form.get('doctor') || '', form.get('duration') || '',
    pano_before, pano_after, intra_before, intra_after
  ).run()
  // 자동 색인: 새 케이스 상세 + 갤러리 목록 + 사이트맵
  const newId = res.meta?.last_row_id
  const indexnow = await pingIndexNow([
    newId ? `/cases/${newId}` : '',
    '/cases/gallery',
    '/sitemap.xml',
  ])
  return c.json({ ok: true, id: newId, indexnow })
})
// 케이스 단건 조회 (수정 폼 프리필용)
app.get('/admin/api/cases/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const row = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(c.req.param('id')).first()
  return row ? c.json(row) : c.json({ error: 'not found' }, 404)
})

// ── 약재 갤러리 admin API ──
// 목록
app.get('/admin/api/herbs', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const { results } = await c.env.DB.prepare('SELECT * FROM herb_photos ORDER BY created_at DESC, id DESC').all()
  return c.json({ ok: true, photos: results || [] })
})
// 등록 (multipart: 이미지 파일 + 이름/설명)
app.post('/admin/api/herbs', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  if (!c.env.R2) return c.json({ error: 'R2가 준비되지 않았습니다.' }, 503)
  const form = await c.req.formData()
  const file = form.get('image') as File | null
  if (!file || typeof file === 'string' || file.size === 0) return c.json({ error: '이미지가 없습니다.' }, 400)
  if (file.size > 8 * 1024 * 1024) return c.json({ error: '8MB 이하 이미지만 업로드할 수 있습니다.' }, 400)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const key = `herb/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  const res = await c.env.DB.prepare(
    'INSERT INTO herb_photos (image_key, herb_name, caption, is_visible) VALUES (?,?,?,1)'
  ).bind(key, (form.get('herb_name') as string) || '', (form.get('caption') as string) || '').run()
  return c.json({ ok: true, id: res.meta?.last_row_id })
})
// 본문 삽입용 사진 업로드 (R2 herb/body/ 프리픽스) → 공개 URL 반환
app.post('/admin/api/herbs/body-image', async (c) => {
  if (!c.env.R2) return c.json({ error: 'R2가 준비되지 않았습니다.' }, 503)
  const form = await c.req.formData()
  const file = form.get('image') as File | null
  if (!file || typeof file === 'string' || file.size === 0) return c.json({ error: '이미지가 없습니다.' }, 400)
  if (file.size > 8 * 1024 * 1024) return c.json({ error: '8MB 이하 이미지만 업로드할 수 있습니다.' }, 400)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const key = `herb/body/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'image/jpeg' } })
  return c.json({ ok: true, key, url: `/api/herb-image/${encodeURIComponent(key)}` })
})
// 슬러그 정규화: 소문자, 한글 유지, 공백→'-', 그 외 기호 제거. 숫자만이면 id 주소와 겹치므로 'h-' 접두
function herbSlugify(v: unknown): string {
  let s = String(v ?? '').trim().toLowerCase().replace(/\s+/g, '-')
  s = s.replace(/[^\p{L}\p{N}\-_]/gu, '').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  if (s && /^\d+$/.test(s)) s = 'h-' + s
  return s.slice(0, 80)
}
// 수정: 탕전 일자/제목/슬러그/설명/본문/노출 (전달된 필드만 갱신)
app.put('/admin/api/herbs/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({} as any))
  const cur: any = await c.env.DB.prepare('SELECT * FROM herb_photos WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: 'not found' }, 404)
  const herbName = body.herb_name !== undefined ? String(body.herb_name ?? '') : cur.herb_name
  const caption = body.caption !== undefined ? String(body.caption ?? '') : cur.caption
  const isVisible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : cur.is_visible
  const title = body.title !== undefined ? (String(body.title ?? '').trim() || null) : cur.title
  const text = body.body !== undefined ? (String(body.body ?? '').replace(/\r\n?/g, '\n').trim() || null) : cur.body
  let slug: string | null = cur.slug
  if (body.slug !== undefined || body.title !== undefined) {
    // 슬러그를 비우면 제목에서 자동 생성, 제목도 없으면 null(번호 주소만 사용)
    const wanted = body.slug !== undefined ? herbSlugify(body.slug) : (cur.slug || '')
    slug = wanted || herbSlugify(title || '') || null
    if (slug) {
      const dup: any = await c.env.DB.prepare('SELECT id FROM herb_photos WHERE slug = ? AND id != ?').bind(slug, id).first()
      if (dup) slug = `${slug}-${id}`
    }
  }
  await c.env.DB.prepare('UPDATE herb_photos SET herb_name = ?, caption = ?, is_visible = ?, title = ?, body = ?, slug = ? WHERE id = ?')
    .bind(herbName, caption, isVisible, title, text, slug, id).run()
  const photo = await c.env.DB.prepare('SELECT * FROM herb_photos WHERE id = ?').bind(id).first()
  return c.json({ ok: true, photo })
})
// 삭제 (R2 오브젝트도 제거)
app.delete('/admin/api/herbs/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const id = c.req.param('id')
  const cur: any = await c.env.DB.prepare('SELECT * FROM herb_photos WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: 'not found' }, 404)
  if (c.env.R2 && cur.image_key) await c.env.R2.delete(cur.image_key).catch(() => {})
  await c.env.DB.prepare('DELETE FROM herb_photos WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

// ── 영상 admin API ──
// 목록
app.get('/admin/api/videos', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const { results } = await c.env.DB.prepare('SELECT * FROM videos ORDER BY sort_order ASC, created_at DESC, id DESC').all()
  return c.json({ ok: true, videos: results || [] })
})
// 등록
app.post('/admin/api/videos', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const body = await c.req.json().catch(() => ({} as any))
  const title = (body.title || '').trim()
  const url = (body.youtube_url || '').trim()
  if (!title || !url) return c.json({ error: '제목과 URL은 필수입니다.' }, 400)
  const videoId = extractYouTubeId(url)
  if (!videoId) return c.json({ error: '유효한 유튜브 URL이 아닙니다.' }, 400)
  const channel = body.channel === 'diet' ? 'diet' : 'garden'
  const res = await c.env.DB.prepare(
    'INSERT INTO videos (title, youtube_url, video_id, channel, description, is_visible, sort_order) VALUES (?,?,?,?,?,1,?)'
  ).bind(title, url, videoId, channel, (body.description || '').trim(), Number(body.sort_order) || 0).run()
  return c.json({ ok: true, id: res.meta?.last_row_id, video_id: videoId })
})
// 수정 (노출토글/정보수정)
app.put('/admin/api/videos/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const id = c.req.param('id')
  const cur: any = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: 'not found' }, 404)
  const body = await c.req.json().catch(() => ({} as any))
  let videoId = cur.video_id
  let youtubeUrl = cur.youtube_url
  if (body.youtube_url !== undefined && body.youtube_url.trim()) {
    const v = extractYouTubeId(body.youtube_url.trim())
    if (!v) return c.json({ error: '유효한 유튜브 URL이 아닙니다.' }, 400)
    videoId = v; youtubeUrl = body.youtube_url.trim()
  }
  const title = body.title !== undefined ? body.title : cur.title
  const channel = body.channel !== undefined ? (body.channel === 'diet' ? 'diet' : 'garden') : cur.channel
  const description = body.description !== undefined ? body.description : cur.description
  const isVisible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : cur.is_visible
  const sortOrder = body.sort_order !== undefined ? (Number(body.sort_order) || 0) : cur.sort_order
  await c.env.DB.prepare(
    'UPDATE videos SET title = ?, youtube_url = ?, video_id = ?, channel = ?, description = ?, is_visible = ?, sort_order = ? WHERE id = ?'
  ).bind(title, youtubeUrl, videoId, channel, description, isVisible, sortOrder, id).run()
  return c.json({ ok: true })
})
// 삭제
app.delete('/admin/api/videos/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})
// 케이스 수정 (이미지는 새로 올린 항목만 교체, 미지정 시 기존 유지)
app.put('/admin/api/cases/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const id = c.req.param('id')
  const cur: any = await c.env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: '없는 사례입니다.' }, 404)
  const form = await c.req.formData()
  const uploadKey = async (field: string): Promise<string | null> => {
    const file = form.get(field) as File | null
    if (!file || typeof file === 'string' || file.size === 0) return cur[field] || null
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const key = `cases/${Date.now()}-${field}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    if (c.env.R2) await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
    return key
  }
  const pano_before = await uploadKey('pano_before')
  const pano_after = await uploadKey('pano_after')
  const intra_before = await uploadKey('intra_before')
  const intra_after = await uploadKey('intra_after')
  await c.env.DB.prepare(
    'UPDATE cases SET title=?, description=?, age_group=?, gender=?, category=?, area=?, doctor=?, duration=?, pano_before=?, pano_after=?, intra_before=?, intra_after=? WHERE id=?'
  ).bind(
    form.get('title'), form.get('description') || '', form.get('age_group') || '', form.get('gender') || '',
    form.get('category') || '', form.get('area') || '', form.get('doctor') || '', form.get('duration') || '',
    pano_before, pano_after, intra_before, intra_after, id
  ).run()
  const indexnow = await pingIndexNow([`/cases/${id}`, '/cases/gallery', '/sitemap.xml'])
  return c.json({ ok: true, id, indexnow })
})
app.delete('/admin/api/cases/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM cases WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 칼럼 등록
// 본문 이미지 업로드 (블로그 에디터 드래그&드롭 / 파일 선택용) → R2 → 공개 URL 반환
app.post('/admin/api/upload-image', async (c) => {
  if (!c.env.R2) return c.json({ error: 'R2가 준비되지 않았습니다.' }, 503)
  const form = await c.req.formData()
  const file = form.get('image') as File | null
  if (!file || typeof file === 'string' || file.size === 0) return c.json({ error: '이미지가 없습니다.' }, 400)
  if (file.size > 5 * 1024 * 1024) return c.json({ error: '5MB 이하 이미지만 업로드할 수 있습니다.' }, 400)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const key = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  return c.json({ ok: true, url: `/api/content-image/${encodeURIComponent(key)}` })
})

// 칼럼 등록 (multipart: 썸네일 파일 지원)
app.post('/admin/api/columns', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const form = await c.req.formData()
  const title = form.get('title') as string, slug = String(form.get('slug') || '').trim(), body = form.get('body') as string
  if (!title || !slug || !body) return c.json({ error: '필수 항목 누락' }, 400)
  let thumbnail: string | null = null
  const thumb = form.get('thumbnail') as File | null
  if (thumb && typeof thumb !== 'string' && thumb.size > 0 && c.env.R2) {
    const ext = (thumb.name.split('.').pop() || 'jpg').toLowerCase()
    thumbnail = `columns/${Date.now()}-thumb.${ext}`
    await c.env.R2.put(thumbnail, await thumb.arrayBuffer(), { httpMetadata: { contentType: thumb.type } })
  }
  const readingTime = estimateReadingTime(body)
  try {
    await c.env.DB.prepare(
      'INSERT INTO columns (title, slug, excerpt, body, category, author, meta_description, thumbnail, keywords, og_image, reading_time) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(
      title, slug, form.get('excerpt') || '', body, form.get('category') || '', form.get('author') || '',
      form.get('meta_description') || '', thumbnail, form.get('keywords') || '', thumbnail, readingTime
    ).run()
  } catch (e: any) {
    return c.json({ error: '슬러그가 중복되었을 수 있습니다.' }, 409)
  }
  // 자동 색인: 새 칼럼 상세 + 칼럼 목록 + 사이트맵
  const indexnow = await pingIndexNow([`/column/${slug}`, '/column', '/sitemap.xml'])
  return c.json({ ok: true, indexnow })
})
// 칼럼 수정
app.put('/admin/api/columns/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const form = await c.req.formData()
  const id = c.req.param('id')
  const cur: any = await c.env.DB.prepare('SELECT thumbnail FROM columns WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: '없는 게시물입니다.' }, 404)
  let thumbnail = cur.thumbnail
  const thumb = form.get('thumbnail') as File | null
  if (thumb && typeof thumb !== 'string' && thumb.size > 0 && c.env.R2) {
    const ext = (thumb.name.split('.').pop() || 'jpg').toLowerCase()
    thumbnail = `columns/${Date.now()}-thumb.${ext}`
    await c.env.R2.put(thumbnail, await thumb.arrayBuffer(), { httpMetadata: { contentType: thumb.type } })
  }
  const bodyHtml = (form.get('body') as string) || ''
  const readingTime = estimateReadingTime(bodyHtml)
  await c.env.DB.prepare(
    "UPDATE columns SET title=?, slug=?, excerpt=?, body=?, category=?, author=?, meta_description=?, thumbnail=?, keywords=?, og_image=?, reading_time=?, updated_at=datetime('now') WHERE id=?"
  ).bind(
    form.get('title'), String(form.get('slug') || '').trim(), form.get('excerpt') || '', bodyHtml, form.get('category') || '', form.get('author') || '',
    form.get('meta_description') || '', thumbnail, form.get('keywords') || '', thumbnail, readingTime, id
  ).run()
  // 자동 색인: 수정된 칼럼 재색인
  const indexnow = await pingIndexNow([`/column/${String(form.get('slug') || '').trim()}`, '/column', '/sitemap.xml'])
  return c.json({ ok: true, indexnow })
})
app.get('/admin/api/columns/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const col = await c.env.DB.prepare('SELECT * FROM columns WHERE id = ?').bind(c.req.param('id')).first()
  return col ? c.json(col) : c.json({ error: 'not found' }, 404)
})
app.delete('/admin/api/columns/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM columns WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 공지 등록 (multipart: 사진 업로드 지원)
app.post('/admin/api/notices', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const form = await c.req.formData()
  const title = form.get('title') as string, body = form.get('body') as string
  if (!title || !body) return c.json({ error: '필수 항목 누락' }, 400)
  let image: string | null = null
  const img = form.get('image') as File | null
  if (img && typeof img !== 'string' && img.size > 0 && c.env.R2) {
    const ext = (img.name.split('.').pop() || 'jpg').toLowerCase()
    image = `notices/${Date.now()}.${ext}`
    await c.env.R2.put(image, await img.arrayBuffer(), { httpMetadata: { contentType: img.type } })
  }
  const truthy = (v: any) => ['1', 'on', 'true'].includes(String(v))
  const res = await c.env.DB.prepare(
    'INSERT INTO notices (title, body, is_pinned, image, show_popup, popup_until, link_url, category) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(
    title, body,
    truthy(form.get('is_pinned')) ? 1 : 0,
    image,
    truthy(form.get('show_popup')) ? 1 : 0,
    (form.get('popup_until') as string) || null,
    (form.get('link_url') as string) || null,
    (form.get('category') as string) || 'notice'
  ).run()
  // 자동 색인: 새 공지 상세 + 공지 목록 + 사이트맵
  const newId = res.meta?.last_row_id
  const indexnow = await pingIndexNow([newId ? `/notice/${newId}` : '', '/notice', '/sitemap.xml'])
  return c.json({ ok: true, id: newId, indexnow })
})
// 공지 수정
app.put('/admin/api/notices/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const form = await c.req.formData()
  const id = c.req.param('id')
  const cur: any = await c.env.DB.prepare('SELECT image FROM notices WHERE id = ?').bind(id).first()
  if (!cur) return c.json({ error: '없는 게시물입니다.' }, 404)
  let image = cur.image
  const img = form.get('image') as File | null
  if (img && typeof img !== 'string' && img.size > 0 && c.env.R2) {
    const ext = (img.name.split('.').pop() || 'jpg').toLowerCase()
    image = `notices/${Date.now()}.${ext}`
    await c.env.R2.put(image, await img.arrayBuffer(), { httpMetadata: { contentType: img.type } })
  }
  const truthy2 = (v: any) => ['1', 'on', 'true'].includes(String(v))
  await c.env.DB.prepare(
    "UPDATE notices SET title=?, body=?, is_pinned=?, image=?, show_popup=?, popup_until=?, link_url=?, category=?, updated_at=datetime('now') WHERE id=?"
  ).bind(
    form.get('title'), form.get('body'),
    truthy2(form.get('is_pinned')) ? 1 : 0,
    image,
    truthy2(form.get('show_popup')) ? 1 : 0,
    (form.get('popup_until') as string) || null,
    (form.get('link_url') as string) || null,
    (form.get('category') as string) || 'notice',
    id
  ).run()
  return c.json({ ok: true })
})
app.get('/admin/api/notices/:id', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const n = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(c.req.param('id')).first()
  return n ? c.json(n) : c.json({ error: 'not found' }, 404)
})
app.delete('/admin/api/notices/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 예약 상태 변경
app.post('/admin/api/reservations/:id/status', async (c) => {
  if (c.env.DB) await c.env.DB.prepare("UPDATE reservations SET status = CASE WHEN status='pending' THEN 'done' ELSE 'pending' END WHERE id = ?").bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 리드 상태 변경 (new → contacted → converted → closed 순환)
app.post('/admin/api/leads/:id/status', async (c) => {
  if (c.env.DB) await c.env.DB.prepare(
    `UPDATE leads SET status = CASE status
      WHEN 'new' THEN 'contacted' WHEN 'contacted' THEN 'converted'
      WHEN 'converted' THEN 'closed' ELSE 'new' END WHERE id = ?`
  ).bind(c.req.param('id')).run()
  return c.json({ ok: true })
})
app.delete('/admin/api/leads/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 리콜 등록/상태/삭제
app.post('/admin/api/recalls', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  let b: any
  try { b = await c.req.json() } catch { return c.json({ error: '잘못된 요청 형식입니다.' }, 400) }
  if (!b || !b.name || !b.phone || !b.due_date) return c.json({ error: '필수 항목 누락' }, 400)
  await c.env.DB.prepare(
    'INSERT INTO recalls (name, phone, treatment, last_visit, due_date, note) VALUES (?,?,?,?,?,?)'
  ).bind(b.name, b.phone, b.treatment || '', b.last_visit || '', b.due_date, b.note || '').run()
  return c.json({ ok: true })
})
app.post('/admin/api/recalls/:id/status', async (c) => {
  if (c.env.DB) await c.env.DB.prepare(
    `UPDATE recalls SET status = CASE status
      WHEN 'pending' THEN 'notified' WHEN 'notified' THEN 'booked'
      WHEN 'booked' THEN 'done' ELSE 'pending' END WHERE id = ?`
  ).bind(c.req.param('id')).run()
  return c.json({ ok: true })
})
app.delete('/admin/api/recalls/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM recalls WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ============================================================
// SEO 파일
// ============================================================
app.get('/seo-health', (c) => c.html(html(<SeoHealthPage />)))
// ── 사이트맵: /sitemap.xml 은 인덱스, 실제 URL 은 /sitemap-{pages,column,notice,herbs}.xml ──
//   · lastmod 는 DB 의 실제 발행/등록일만 사용 (정적 페이지는 생략)
//   · 한약 상세는 공개 + 본문 300자 이상만 (미작성 페이지는 noindex 이므로 제외)
const HERB_BODY_LEN_SQL = "length(REPLACE(REPLACE(REPLACE(COALESCE(body,''), ' ', ''), char(10), ''), char(13), ''))"
async function sitemapUrlsFor(db: D1Database | undefined, name: SitemapChild) {
  if (name === 'pages') return sitemapPagesUrls()
  if (!db) return []
  try {
    if (name === 'column') {
      const rows = (await db.prepare(
        "SELECT slug, updated_at, published_at FROM columns WHERE COALESCE(published, 1) = 1 ORDER BY published_at DESC"
      ).all()).results as any[]
      return sitemapColumnUrls(rows)
    }
    if (name === 'notice') {
      const rows = (await db.prepare('SELECT id, created_at FROM notices ORDER BY created_at DESC').all()).results as any[]
      return sitemapNoticeUrls(rows)
    }
    // herbs — SQL 로 1차 필터 후 실제 본문 글자 수(herbIsThin)로 확정
    const rows = (await db.prepare(
      `SELECT id, slug, body, created_at FROM herb_photos WHERE is_visible = 1 AND ${HERB_BODY_LEN_SQL} >= 200 ORDER BY created_at DESC, id DESC`
    ).all()).results as any[]
    return sitemapHerbUrls(rows.filter((h) => !herbIsThin(h)))
  } catch {
    return []
  }
}
app.get('/sitemap.xml', async (c) => {
  const children = await Promise.all(SITEMAP_CHILDREN.map(async (name) => ({ name, urls: await sitemapUrlsFor(c.env.DB, name) })))
  return c.text(sitemapIndexXml(children), 200, { 'Content-Type': 'application/xml' })
})
SITEMAP_CHILDREN.forEach((name) => {
  app.get(`/sitemap-${name}.xml`, async (c) =>
    c.text(sitemapChildXml(await sitemapUrlsFor(c.env.DB, name)), 200, { 'Content-Type': 'application/xml' }))
})
app.get('/799b2128d4da4b8fb1735b660e248ff4.txt', (c) => c.text('799b2128d4da4b8fb1735b660e248ff4'))
app.get('/robots.txt', (c) => c.text(robotsTxt(), 200, { 'Content-Type': 'text/plain' }))
// ===== RSS 2.0 피드 (/rss.xml) — 칼럼 최신 글 (구독·AI 크롤러 발견성 + 네이버 서치어드바이저 RSS 제출용) =====
app.get('/rss.xml', async (c) => {
  const base = CLINIC.domain
  const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  const toRfc822 = (v: any): string => {
    const s = String(v || '').replace(' ', 'T')
    const d = new Date(/Z$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + 'Z')
    return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString()
  }
  let cols: any[] = []
  if (c.env.DB) {
    try {
      cols = ((await c.env.DB.prepare(
        'SELECT slug, title, excerpt, meta_description, author, category, published_at, updated_at FROM columns WHERE COALESCE(published, 1) = 1 ORDER BY published_at DESC LIMIT 50'
      ).all()).results as any[]) || []
    } catch { cols = [] }
  }
  const items = cols.map((col: any) => {
    const desc = col.meta_description || col.excerpt || col.title
    return `  <item>
    <title>${esc(col.title)}</title>
    <link>${base}/column/${esc(col.slug)}</link>
    <guid isPermaLink="true">${base}/column/${esc(col.slug)}</guid>
    <description>${esc(desc)}</description>${col.author ? `
    <dc:creator>${esc(col.author)}</dc:creator>` : ''}${col.category ? `
    <category>${esc(col.category)}</category>` : ''}
    <pubDate>${toRfc822(col.published_at)}</pubDate>
  </item>`
  }).join('\n')
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(CLINIC.nameFull)} 칼럼</title>
  <link>${base}/column</link>
  <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(CLINIC.nameFull)} 한의사가 직접 쓰는 건강 칼럼 — 한방 치료·체질·생활 건강 정보</description>
  <language>ko-KR</language>
  <lastBuildDate>${cols.length ? toRfc822(cols[0].published_at) : new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`
  return c.text(rss, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=1800' })
})

app.get('/llms.txt', (c) => c.text(llmsTxt(), 200, { 'Content-Type': 'text/plain' }))

// ===== 납품 안내서 (관계자 전용, 검색 비노출) =====
app.get('/handover', (c) => c.redirect('/static/handover.html', 302))

// ===== PWA: 매니페스트 + 서비스워커 (홈 화면 설치 지원) =====
app.get('/manifest.webmanifest', (c) =>
  c.text(webManifest(), 200, { 'Content-Type': 'application/manifest+json; charset=utf-8' }),
)
app.get('/sw.js', (c) =>
  c.text(serviceWorkerJs(), 200, {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Service-Worker-Allowed': '/',
  }),
)

// ===== 네이버 서치어드바이저 HTML 파일 소유 확인 =====
// /naver{code}.html — 메타태그와 병행. 파일 내용 형식: "naver-site-verification: {code}"
app.get(`/naver${CLINIC.naverHtmlVerification}.html`, (c) =>
  c.text(`naver-site-verification: naver${CLINIC.naverHtmlVerification}.html`, 200, { 'Content-Type': 'text/html' })
)

// ===== IndexNow (빙·네이버 Yeti·Yandex 즉시 색인) =====
// 키 검증 파일: 검색엔진이 이 파일을 조회해 소유권을 확인함
app.get(`/${CLINIC.indexNowKey}.txt`, (c) => c.text(CLINIC.indexNowKey, 200, { 'Content-Type': 'text/plain' }))
// 수동 핑: GET /api/indexnow?url=/treatments/diet 처럼 변경된 URL을 검색엔진에 통보
app.get('/api/indexnow', async (c) => {
  const target = c.req.query('url') || '/'
  const results = await pingIndexNow([target])
  const host = CLINIC.domain.replace(/^https?:\/\//, '')
  const fullUrl = target.startsWith('http') ? target : `https://${host}${target.startsWith('/') ? target : '/' + target}`
  return c.json({ submitted: fullUrl, results })
})

// ===== 404 =====
app.notFound((c) => c.html(html(<NotFoundPage />), 404))

export default app
