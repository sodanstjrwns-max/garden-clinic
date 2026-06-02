import { Hono } from 'hono'
import { HomePage } from './pages/home'
import { TreatmentListPage, TreatmentDetailPage } from './pages/treatments'
import { FaqPage } from './pages/faq'
import { DoctorListPage, DoctorDetailPage } from './pages/doctors'
import { MissionPage, DirectionsPage, PricingPage, PolicyPage, NotFoundPage } from './pages/info'
import { SasangTestPage } from './pages/sasang'
import { EncyclopediaListPage, EncyclopediaDetailPage } from './pages/encyclopedia'
import { ReservationPage, LoginPage, RegisterPage, MyPage } from './pages/forms'
import { CaseGalleryPage, CaseDetailPage } from './pages/cases'
import { ColumnListPage, ColumnDetailPage, NoticeListPage, NoticeDetailPage, AreaPage } from './pages/content'
import { AdminLoginPage, AdminDashboard } from './pages/admin'
import { getTreatment } from './data/treatments'
import { getDoctor } from './data/doctors'
import { getEncTerm } from './data/encyclopedia'
import { getArea } from './data/areas'
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
app.get('/', (c) => c.html(html(<HomePage />)))
app.get('/mission', (c) => c.html(html(<MissionPage />)))
app.get('/directions', (c) => c.html(html(<DirectionsPage />)))
app.get('/pricing', (c) => c.html(html(<PricingPage />)))
app.get('/faq', (c) => c.html(html(<FaqPage />)))
app.get('/sasang-test', (c) => c.html(html(<SasangTestPage />)))
app.get('/reservation', (c) => c.html(html(<ReservationPage />)))
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

// ===== 지역 SEO: /area/:area-:tx =====
app.get('/area/:combo', (c) => {
  const combo = c.req.param('combo')
  // 진료 slug는 다중 하이픈 가능(custom-herbal, car-accident). 뒤에서 매칭
  const txSlugs = ['diet', 'custom-herbal', 'car-accident']
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
  return c.html(html(<MyPage user={user || undefined} />))
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
  if (c.env.DB) {
    await c.env.DB.prepare(
      'INSERT INTO reservations (name, phone, email, treatment, preferred, message) VALUES (?,?,?,?,?,?)'
    ).bind(b.name, b.phone, b.email || '', b.treatment, b.preferred || '', b.message || '').run()
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

// ============================================================
// 비포애프터
// ============================================================
app.get('/cases/gallery', async (c) => {
  const loggedIn = !!(await getUser(c))
  const cat = c.req.query('cat')
  let cases: any[] = []
  if (c.env.DB) {
    const q = cat
      ? c.env.DB.prepare('SELECT * FROM cases WHERE category = ? ORDER BY created_at DESC').bind(cat)
      : c.env.DB.prepare('SELECT * FROM cases ORDER BY created_at DESC')
    const { results } = await q.all()
    cases = results || []
  }
  return c.html(html(<CaseGalleryPage cases={cases as any} loggedIn={loggedIn} activeCat={cat} />))
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
  let stats = { users: 0, reservations: 0, cases: 0, columns: 0, notices: 0 }
  let data: any = null
  if (db) {
    const count = async (t: string) => ((await db.prepare(`SELECT COUNT(*) as n FROM ${t}`).first()) as any)?.n || 0
    stats = {
      users: await count('users'),
      reservations: await count('reservations'),
      cases: await count('cases'),
      columns: await count('columns'),
      notices: await count('notices'),
    }
    if (tab === 'reservations') data = (await db.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all()).results
    else if (tab === 'cases') data = (await db.prepare('SELECT * FROM cases ORDER BY created_at DESC').all()).results
    else if (tab === 'columns') data = (await db.prepare('SELECT * FROM columns ORDER BY published_at DESC').all()).results
    else if (tab === 'notices') data = (await db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all()).results
    else if (tab === 'users') data = (await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()).results
  }
  return c.html(html(<AdminDashboard tab={tab} stats={stats} data={data} />))
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
app.post('/admin/api/columns', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const b = await c.req.json()
  if (!b.title || !b.slug || !b.body) return c.json({ error: '필수 항목 누락' }, 400)
  try {
    await c.env.DB.prepare(
      'INSERT INTO columns (title, slug, excerpt, body, category, author, meta_description) VALUES (?,?,?,?,?,?,?)'
    ).bind(b.title, b.slug, b.excerpt || '', b.body, b.category || '', b.author || '', b.meta_description || '').run()
  } catch (e: any) {
    return c.json({ error: '슬러그가 중복되었을 수 있습니다.' }, 409)
  }
  return c.json({ ok: true })
})
app.delete('/admin/api/columns/:id', async (c) => {
  if (c.env.DB) await c.env.DB.prepare('DELETE FROM columns WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// 공지 등록
app.post('/admin/api/notices', async (c) => {
  if (!c.env.DB) return c.json({ error: 'no db' }, 503)
  const b = await c.req.json()
  if (!b.title || !b.body) return c.json({ error: '필수 항목 누락' }, 400)
  await c.env.DB.prepare('INSERT INTO notices (title, body, is_pinned) VALUES (?,?,?)').bind(b.title, b.body, b.is_pinned ? 1 : 0).run()
  return c.json({ ok: true })
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

// ============================================================
// SEO 파일
// ============================================================
app.get('/sitemap.xml', (c) => c.text(sitemapXml(), 200, { 'Content-Type': 'application/xml' }))
app.get('/robots.txt', (c) => c.text(robotsTxt(), 200, { 'Content-Type': 'text/plain' }))
app.get('/llms.txt', (c) => c.text(llmsTxt(), 200, { 'Content-Type': 'text/plain' }))

// ===== 404 =====
app.notFound((c) => c.html(html(<NotFoundPage />), 404))

export default app
