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
import { ColumnListPage, ColumnDetailPage, NoticeListPage, NoticeDetailPage, AreaPage, AreaIndexPage } from './pages/content'
import { AdminLoginPage, AdminDashboard } from './pages/admin'
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
import { sitemapXml, robotsTxt, llmsTxt } from './lib/seo'
import { CLINIC } from './data/clinic'

type Bindings = {
  DB?: D1Database
  R2?: R2Bucket
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  RESEND_API_KEY?: string
  NOTIFICATION_EMAIL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

const html = (node: any) => '<!DOCTYPE html>' + node.toString()
const secret = (c: any) => c.env.ADMIN_SESSION_SECRET || SESSION_SECRET_FALLBACK

// HTML 본문에서 텍스트 길이로 읽기시간(분) 추정 — 한국어 분당 약 500자
function estimateReadingTime(html: string): number {
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, '')
  return Math.max(1, Math.round(text.length / 500))
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
app.get('/pricing', (c) => c.html(html(<PricingPage />)))
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
          from: 'noreply@jeongwon-hani.com',
          to: c.env.NOTIFICATION_EMAIL,
          subject: `[예약] ${b.name}님 (${b.treatment})`,
          html: `<p>성함: ${b.name}<br>연락처: ${b.phone}<br>이메일: ${b.email || '-'}<br>진료: ${b.treatment}<br>희망: ${b.preferred || '-'}<br>내용: ${b.message || '-'}</p>`,
        }),
      })
    } catch (e) {}
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
          from: 'noreply@jeongwon-hani.com',
          to: c.env.NOTIFICATION_EMAIL,
          subject: `[체질테스트 리드] ${b.name}님 (${b.sasang_type || '-'})`,
          html: `<p>성함: ${b.name}<br>연락처: ${b.phone}<br>체질: ${b.sasang_type || '-'}<br>관심 진료: ${b.interest || '-'}</p>`,
        }),
      })
    } catch (e) {}
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
  const col: any = await c.env.DB.prepare('SELECT * FROM columns WHERE slug = ? AND published = 1').bind(c.req.param('slug')).first()
  if (!col) return c.html(html(<NotFoundPage />), 404)
  const ua = c.req.header('User-Agent') || ''
  if (!isBot(ua)) await c.env.DB.prepare('UPDATE columns SET views = views + 1 WHERE id = ?').bind(col.id).run()
  return c.html(html(<ColumnDetailPage column={col} />))
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
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' } })
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

app.get('/admin', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login')
  const tab = c.req.query('tab') || 'dashboard'
  const db = c.env.DB
  let stats: any = { users: 0, reservations: 0, cases: 0, columns: 0, notices: 0, leads: 0, recalls: 0,
    todayReservations: 0, todayLeads: 0, pendingReservations: 0, newLeads: 0, dueRecalls: 0, popupActive: null }
  let data: any = null
  let funnel: any = null
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
    else if (tab === 'funnel') {
      // 깔때기: 최근 30일 이벤트 집계 (봇 제외)
      const days = c.req.query('days') || '30'
      const evt = await db.prepare(
        `SELECT event, COUNT(*) as n, COUNT(DISTINCT session_id) as sessions FROM funnel_events
         WHERE is_bot = 0 AND created_at >= datetime('now', '-' || ? || ' days') GROUP BY event`
      ).bind(days).all()
      const src = await db.prepare(
        `SELECT COALESCE(NULLIF(utm_source,''), '(직접/기타)') as source, COUNT(*) as n FROM funnel_events
         WHERE is_bot = 0 AND created_at >= datetime('now', '-' || ? || ' days') GROUP BY source ORDER BY n DESC LIMIT 10`
      ).bind(days).all()
      const resvSrc = await db.prepare(
        `SELECT COALESCE(NULLIF(utm_source,''), '(직접/기타)') as source, COUNT(*) as n FROM reservations
         WHERE created_at >= datetime('now', '-' || ? || ' days') GROUP BY source ORDER BY n DESC LIMIT 10`
      ).bind(days).all()
      funnel = { events: evt.results || [], sources: src.results || [], resvSources: resvSrc.results || [], days }
    }
  }
  return c.html(html(<AdminDashboard tab={tab} stats={stats} data={data} funnel={funnel} />))
})

// 관리자 미들웨어 (API)
app.use('/admin/api/*', async (c, next) => {
  if (!(await isAdmin(c))) return c.json({ error: 'unauthorized' }, 401)
  await next()
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
  await c.env.DB.prepare(
    'INSERT INTO cases (title, description, age_group, gender, category, area, doctor, duration, pano_before, pano_after, intra_before, intra_after) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(
    form.get('title'), form.get('description') || '', form.get('age_group') || '', form.get('gender') || '',
    form.get('category') || '', form.get('area') || '', form.get('doctor') || '', form.get('duration') || '',
    pano_before, pano_after, intra_before, intra_after
  ).run()
  return c.json({ ok: true })
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
  const title = form.get('title') as string, slug = form.get('slug') as string, body = form.get('body') as string
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
  return c.json({ ok: true })
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
    form.get('title'), form.get('slug'), form.get('excerpt') || '', bodyHtml, form.get('category') || '', form.get('author') || '',
    form.get('meta_description') || '', thumbnail, form.get('keywords') || '', thumbnail, readingTime, id
  ).run()
  return c.json({ ok: true })
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
  await c.env.DB.prepare(
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
  return c.json({ ok: true })
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
  const b = await c.req.json()
  if (!b.name || !b.phone || !b.due_date) return c.json({ error: '필수 항목 누락' }, 400)
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
app.get('/sitemap.xml', async (c) => {
  let columns: any[] = []
  let notices: any[] = []
  if (c.env.DB) {
    try {
      columns = (await c.env.DB.prepare(
        "SELECT slug, updated_at, published_at FROM columns WHERE COALESCE(published, 1) = 1 ORDER BY published_at DESC"
      ).all()).results as any[]
    } catch { columns = [] }
    try {
      notices = (await c.env.DB.prepare('SELECT id, created_at FROM notices ORDER BY created_at DESC').all()).results as any[]
    } catch { notices = [] }
  }
  return c.text(sitemapXml({ columns, notices }), 200, { 'Content-Type': 'application/xml' })
})
app.get('/robots.txt', (c) => c.text(robotsTxt(), 200, { 'Content-Type': 'text/plain' }))
app.get('/llms.txt', (c) => c.text(llmsTxt(), 200, { 'Content-Type': 'text/plain' }))

// ===== IndexNow (빙·네이버 Yeti·Yandex 즉시 색인) =====
// 키 검증 파일: 검색엔진이 이 파일을 조회해 소유권을 확인함
app.get(`/${CLINIC.indexNowKey}.txt`, (c) => c.text(CLINIC.indexNowKey, 200, { 'Content-Type': 'text/plain' }))
// 수동 핑: GET /api/indexnow?url=/treatments/diet 처럼 변경된 URL을 검색엔진에 통보
app.get('/api/indexnow', async (c) => {
  const target = c.req.query('url') || '/'
  const host = 'gardenclinic.kr'
  const fullUrl = target.startsWith('http') ? target : `https://${host}${target.startsWith('/') ? target : '/' + target}`
  const payload = {
    host,
    key: CLINIC.indexNowKey,
    keyLocation: `https://${host}/${CLINIC.indexNowKey}.txt`,
    urlList: [fullUrl],
  }
  const results: Record<string, number> = {}
  for (const ep of ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow']) {
    try {
      const r = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })
      results[ep] = r.status
    } catch {
      results[ep] = 0
    }
  }
  return c.json({ submitted: fullUrl, results })
})

// ===== 404 =====
app.notFound((c) => c.html(html(<NotFoundPage />), 404))

export default app
