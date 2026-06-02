import type { FC } from 'hono/jsx'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'
import { DOCTORS } from '../data/doctors'
import { ADDRESS_SUGGESTIONS } from '../data/areas'

// 간단한 관리자 셸 (외부 헤더/푸터 없이 독립 레이아웃)
const AdminShell: FC<{ title: string; children: any }> = ({ title, children }) => (
  <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="noindex, nofollow" />
      <title>{title} — 정원한의원 관리자</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" />
      <link rel="stylesheet" href="/static/style.css" />
      <link rel="stylesheet" href="/static/admin.css" />
    </head>
    <body style="background:var(--paper-2)">{children}<script src="/static/admin.js"></script></body>
  </html>
)

// 로그인
export const AdminLoginPage: FC = () => (
  <AdminShell title="로그인">
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px">
      <div class="form-card" style="width:100%;max-width:400px">
        <div style="text-align:center;margin-bottom:24px">
          <span class="logo__mark" style="margin:0 auto 12px"><i class="fas fa-leaf"></i></span>
          <h1 style="font-size:22px">관리자 로그인</h1>
        </div>
        <div class="form-msg" id="form-msg"></div>
        <form id="admin-login">
          <div class="field"><label>관리자 비밀번호</label><input type="password" name="password" required /></div>
          <button type="submit" class="btn btn-primary btn-block">로그인</button>
        </form>
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
      document.getElementById('admin-login').addEventListener('submit', async function(e){
        e.preventDefault(); var msg=document.getElementById('form-msg');
        var fd=new FormData(this);
        var res=await fetch('/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:fd.get('password')})});
        if(res.ok){ window.location.href='/admin'; } else { msg.className='form-msg err'; msg.textContent='비밀번호가 올바르지 않습니다.'; }
      });
    ` }}></script>
  </AdminShell>
)

interface DashStats {
  users: number
  reservations: number
  cases: number
  columns: number
  notices: number
}

// 대시보드
export const AdminDashboard: FC<{ tab: string; stats: DashStats; data?: any }> = ({ tab, stats, data }) => {
  const allTx = [...CORE_TREATMENTS, ...GENERAL_TREATMENTS]
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: 'fa-gauge' },
    { id: 'reservations', label: '예약', icon: 'fa-calendar-check' },
    { id: 'cases', label: '비포애프터', icon: 'fa-images' },
    { id: 'columns', label: '원장 칼럼', icon: 'fa-feather-pointed' },
    { id: 'notices', label: '공지사항', icon: 'fa-bullhorn' },
    { id: 'users', label: '회원', icon: 'fa-users' },
  ]
  return (
    <AdminShell title="관리자">
      <div class="admin-layout">
        <aside class="admin-side">
          <div class="admin-logo"><span class="logo__mark"><i class="fas fa-leaf"></i></span><strong>정원한의원<br />관리자</strong></div>
          <nav>
            {navItems.map((n) => (
              <a href={`/admin?tab=${n.id}`} class={`admin-nav ${tab === n.id ? 'active' : ''}`}><i class={`fas ${n.icon}`}></i> {n.label}</a>
            ))}
          </nav>
          <button id="admin-logout" class="admin-nav" style="border:0;background:none;width:100%;text-align:left;cursor:pointer"><i class="fas fa-right-from-bracket"></i> 로그아웃</button>
        </aside>
        <main class="admin-main">
          {tab === 'dashboard' && (
            <>
              <h1 class="admin-h1">대시보드</h1>
              <div class="admin-stats">
                <div class="admin-stat"><i class="fas fa-users"></i><div><strong>{stats.users}</strong><span>회원</span></div></div>
                <div class="admin-stat"><i class="fas fa-calendar-check"></i><div><strong>{stats.reservations}</strong><span>예약</span></div></div>
                <div class="admin-stat"><i class="fas fa-images"></i><div><strong>{stats.cases}</strong><span>비포애프터</span></div></div>
                <div class="admin-stat"><i class="fas fa-feather-pointed"></i><div><strong>{stats.columns}</strong><span>칼럼</span></div></div>
                <div class="admin-stat"><i class="fas fa-bullhorn"></i><div><strong>{stats.notices}</strong><span>공지</span></div></div>
              </div>
            </>
          )}

          {tab === 'reservations' && (
            <>
              <h1 class="admin-h1">예약 관리</h1>
              <table class="admin-table">
                <thead><tr><th>접수일</th><th>성함</th><th>연락처</th><th>진료</th><th>희망</th><th>상태</th><th></th></tr></thead>
                <tbody>
                  {(data || []).map((r: any) => (
                    <tr>
                      <td>{r.created_at?.slice(0, 10)}</td><td>{r.name}</td><td>{r.phone}</td>
                      <td>{r.treatment}</td><td>{r.preferred}</td>
                      <td><span class={`badge ${r.status}`}>{r.status === 'pending' ? '대기' : r.status === 'done' ? '완료' : r.status}</span></td>
                      <td><button class="btn-sm" data-action="reservation-status" data-id={r.id}>상태변경</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data || data.length === 0) && <p class="admin-empty">예약이 없습니다.</p>}
            </>
          )}

          {tab === 'cases' && (
            <>
              <div class="admin-head-row"><h1 class="admin-h1">비포애프터 관리</h1></div>
              <form id="case-form" class="admin-form" enctype="multipart/form-data">
                <h3>새 사례 등록</h3>
                <div class="admin-grid2">
                  <div class="field"><label>제목 *</label><input name="title" required /></div>
                  <div class="field"><label>치료 기간</label><input name="duration" placeholder="예: 3개월" /></div>
                  <div class="field"><label>진료 카테고리</label><select name="category">{allTx.map((t) => <option value={t.slug}>{t.shortName}</option>)}</select></div>
                  <div class="field"><label>담당 원장</label><select name="doctor">{DOCTORS.map((d) => <option value={d.slug}>{d.name}</option>)}</select></div>
                  <div class="field"><label>연령대</label><input name="age_group" placeholder="예: 40대" /></div>
                  <div class="field"><label>성별</label><select name="gender"><option>여성</option><option>남성</option></select></div>
                  <div class="field autocomplete"><label>지역</label><input name="area" id="case-area" placeholder="예: 오산" autocomplete="off" /><div class="autocomplete__list" id="case-area-list"></div></div>
                </div>
                <div class="field"><label>설명</label><textarea name="description"></textarea></div>
                <div class="admin-grid2">
                  <div class="field"><label>파노라마/전신 전</label><input type="file" name="pano_before" accept="image/*" /></div>
                  <div class="field"><label>파노라마/전신 후</label><input type="file" name="pano_after" accept="image/*" /></div>
                  <div class="field"><label>부위 전</label><input type="file" name="intra_before" accept="image/*" /></div>
                  <div class="field"><label>부위 후</label><input type="file" name="intra_after" accept="image/*" /></div>
                </div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> 등록</button>
                <div class="form-msg" id="case-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>조회</th><th></th></tr></thead>
                <tbody>{(data || []).map((c: any) => (<tr><td>{c.id}</td><td>{c.title}</td><td>{c.category}</td><td>{c.views || 0}</td><td><button class="btn-sm danger" data-action="delete-case" data-id={c.id}>삭제</button></td></tr>))}</tbody>
              </table>
            </>
          )}

          {tab === 'columns' && (
            <>
              <h1 class="admin-h1">원장 칼럼 관리</h1>
              <form id="column-form" class="admin-form">
                <h3>새 칼럼 작성</h3>
                <div class="admin-grid2">
                  <div class="field"><label>제목 *</label><input name="title" required /></div>
                  <div class="field"><label>슬러그(URL) *</label><input name="slug" required placeholder="diet-tips" /></div>
                  <div class="field"><label>관련 진료</label><select name="category">{allTx.map((t) => <option value={t.slug}>{t.shortName}</option>)}</select></div>
                  <div class="field"><label>작성자</label><select name="author">{DOCTORS.map((d) => <option value={d.slug}>{d.name}</option>)}</select></div>
                </div>
                <div class="field"><label>요약</label><input name="excerpt" /></div>
                <div class="field"><label>메타 설명 (SEO)</label><input name="meta_description" /></div>
                <div class="field"><label>본문 (HTML 가능: &lt;h2&gt;, &lt;p&gt;, &lt;img&gt; 등)</label><textarea name="body" style="min-height:240px" required></textarea></div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> 발행</button>
                <div class="form-msg" id="column-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>제목</th><th>조회</th><th></th></tr></thead>
                <tbody>{(data || []).map((c: any) => (<tr><td>{c.id}</td><td>{c.title}</td><td>{c.views || 0}</td><td><button class="btn-sm danger" data-action="delete-column" data-id={c.id}>삭제</button></td></tr>))}</tbody>
              </table>
            </>
          )}

          {tab === 'notices' && (
            <>
              <h1 class="admin-h1">공지사항 관리</h1>
              <form id="notice-form" class="admin-form">
                <div class="field"><label>제목 *</label><input name="title" required /></div>
                <div class="field"><label>내용 *</label><textarea name="body" required></textarea></div>
                <div class="field check"><input type="checkbox" name="is_pinned" id="pin" /><label for="pin">대표(상단 고정) 공지로 지정</label></div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> 등록</button>
                <div class="form-msg" id="notice-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>제목</th><th>고정</th><th></th></tr></thead>
                <tbody>{(data || []).map((n: any) => (<tr><td>{n.id}</td><td>{n.title}</td><td>{n.is_pinned ? '★' : ''}</td><td><button class="btn-sm danger" data-action="delete-notice" data-id={n.id}>삭제</button></td></tr>))}</tbody>
              </table>
            </>
          )}

          {tab === 'users' && (
            <>
              <h1 class="admin-h1">회원 관리</h1>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>성함</th><th>이메일</th><th>전화</th><th>마케팅</th><th>가입일</th></tr></thead>
                <tbody>{(data || []).map((u: any) => (<tr><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.agree_marketing ? '동의' : '-'}</td><td>{u.created_at?.slice(0, 10)}</td></tr>))}</tbody>
              </table>
              {(!data || data.length === 0) && <p class="admin-empty">회원이 없습니다.</p>}
            </>
          )}
        </main>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `window.__ADDR_SUGGEST=${JSON.stringify(ADDRESS_SUGGESTIONS)};` }}></script>
    </AdminShell>
  )
}
