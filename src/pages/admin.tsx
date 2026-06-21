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
  leads: number
  recalls: number
  todayReservations?: number
  todayLeads?: number
  pendingReservations?: number
  newLeads?: number
  dueRecalls?: number
  popupActive?: string | null
}

// 퍼널 이벤트 레이블
const FUNNEL_LABELS: Record<string, string> = {
  page_view: '페이지 조회',
  ti_start: '체질테스트 시작',
  ti_complete: '체질테스트 완료',
  ti_lead: '체질 리드 제출',
  resv_start: '예약 폼 진입',
  resv_step: '예약 스텝 이동',
  resv_submit: '예약 제출 ⭐',
  share_click: '결과 공유',
  review_click: '후기 클릭',
  cta_call: '전화 CTA',
  cta_book: '예약 CTA',
  cta_ti: '체질테스트 CTA',
  cta_map: '길찾기 CTA',
}
const FUNNEL_ORDER = ['page_view', 'cta_call', 'cta_book', 'ti_start', 'ti_complete', 'ti_lead', 'resv_start', 'resv_submit', 'share_click', 'review_click']

// 대시보드
export const AdminDashboard: FC<{ tab: string; stats: DashStats; data?: any; funnel?: any }> = ({ tab, stats, data, funnel }) => {
  const allTx = [...CORE_TREATMENTS, ...GENERAL_TREATMENTS]
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: 'fa-gauge' },
    { id: 'funnel', label: '퍼널 분석', icon: 'fa-filter' },
    { id: 'leads', label: '리드(체질테스트)', icon: 'fa-user-plus' },
    { id: 'reservations', label: '예약', icon: 'fa-calendar-check' },
    { id: 'recalls', label: '리콜(재내원)', icon: 'fa-bell' },
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

              {/* 오늘의 현황 — 미니 하이라이트 */}
              <div class="dash-today">
                <a href="/admin?tab=reservations" class="dash-mini dash-mini--hot">
                  <span class="dash-mini__label"><i class="fas fa-calendar-day"></i> 오늘 예약</span>
                  <strong class="dash-mini__num">{stats.todayReservations || 0}<em>건</em></strong>
                </a>
                <a href="/admin?tab=leads" class="dash-mini dash-mini--lead">
                  <span class="dash-mini__label"><i class="fas fa-user-plus"></i> 오늘 신규 리드</span>
                  <strong class="dash-mini__num">{stats.todayLeads || 0}<em>명</em></strong>
                </a>
                <a href="/admin?tab=reservations" class="dash-mini">
                  <span class="dash-mini__label"><i class="fas fa-hourglass-half"></i> 처리 대기 예약</span>
                  <strong class="dash-mini__num">{stats.pendingReservations || 0}<em>건</em></strong>
                </a>
                <a href="/admin?tab=recalls" class="dash-mini">
                  <span class="dash-mini__label"><i class="fas fa-bell"></i> 오늘까지 리콜</span>
                  <strong class="dash-mini__num">{stats.dueRecalls || 0}<em>건</em></strong>
                </a>
                <a href="/admin?tab=notices" class={`dash-mini ${stats.popupActive ? 'dash-mini--on' : ''}`}>
                  <span class="dash-mini__label"><i class="fas fa-bullhorn"></i> 메인 팝업</span>
                  <strong class="dash-mini__num dash-mini__status">
                    {stats.popupActive ? <span title={stats.popupActive}>● 노출중</span> : <span class="off">○ 꺼짐</span>}
                  </strong>
                  {stats.popupActive && <span class="dash-mini__sub">{stats.popupActive}</span>}
                </a>
              </div>

              <h2 class="admin-h2" style="margin-top:30px">전체 누적</h2>
              <div class="admin-stats">
                <div class="admin-stat"><i class="fas fa-user-plus"></i><div><strong>{stats.leads}</strong><span>리드</span></div></div>
                <div class="admin-stat"><i class="fas fa-calendar-check"></i><div><strong>{stats.reservations}</strong><span>예약</span></div></div>
                <div class="admin-stat"><i class="fas fa-bell"></i><div><strong>{stats.recalls}</strong><span>리콜</span></div></div>
                <div class="admin-stat"><i class="fas fa-users"></i><div><strong>{stats.users}</strong><span>회원</span></div></div>
                <div class="admin-stat"><i class="fas fa-images"></i><div><strong>{stats.cases}</strong><span>비포애프터</span></div></div>
                <div class="admin-stat"><i class="fas fa-feather-pointed"></i><div><strong>{stats.columns}</strong><span>칼럼</span></div></div>
                <div class="admin-stat"><i class="fas fa-bullhorn"></i><div><strong>{stats.notices}</strong><span>공지</span></div></div>
              </div>
              <div class="admin-form" style="margin-top:24px">
                <h3><i class="fas fa-filter"></i> 퍼널 한눈에 보기</h3>
                <p style="color:var(--ink-3);font-size:14px">방문 → 체질테스트 → 리드 → 예약 → 재내원 → 후기까지, <a href="/admin?tab=funnel" style="color:var(--vermilion);font-weight:700">퍼널 분석 탭</a>에서 단계별 전환을 확인하세요.</p>
              </div>
            </>
          )}

          {tab === 'funnel' && (
            <>
              <div class="admin-head-row">
                <h1 class="admin-h1">퍼널 분석 <span style="font-size:14px;color:var(--ink-3);font-weight:400">최근 {funnel?.days || 30}일 · 봇 제외</span></h1>
                <div style="display:flex;gap:8px">
                  <a href="/admin?tab=funnel&days=7" class="btn-sm">7일</a>
                  <a href="/admin?tab=funnel&days=30" class="btn-sm">30일</a>
                  <a href="/admin?tab=funnel&days=90" class="btn-sm">90일</a>
                </div>
              </div>
              {(() => {
                const evMap: Record<string, { n: number; sessions: number }> = {}
                ;(funnel?.events || []).forEach((e: any) => { evMap[e.event] = { n: e.n, sessions: e.sessions } })
                const maxN = Math.max(1, ...FUNNEL_ORDER.map((k) => evMap[k]?.n || 0))
                const pv = evMap['page_view']?.n || 0
                return (
                  <div class="admin-form">
                    <h3>단계별 깔때기</h3>
                    <div class="funnel-chart">
                      {FUNNEL_ORDER.map((k) => {
                        const v = evMap[k]?.n || 0
                        const pct = pv > 0 && k !== 'page_view' ? ` (방문 대비 ${((v / pv) * 100).toFixed(1)}%)` : ''
                        return (
                          <div class="funnel-row">
                            <span class="funnel-label">{FUNNEL_LABELS[k] || k}</span>
                            <div class="funnel-bar-track">
                              <div class={`funnel-bar ${k === 'resv_submit' || k === 'ti_lead' ? 'hot' : ''}`} style={`width:${Math.max(2, (v / maxN) * 100)}%`}></div>
                            </div>
                            <span class="funnel-num">{v}{pct}</span>
                          </div>
                        )
                      })}
                    </div>
                    {pv === 0 && <p class="admin-empty">아직 수집된 이벤트가 없습니다. 사이트 방문이 일어나면 자동으로 쌓입니다.</p>}
                  </div>
                )
              })()}
              <div class="admin-grid2" style="margin-top:20px;align-items:start">
                <div class="admin-form">
                  <h3>유입 채널 (이벤트 기준)</h3>
                  <table class="admin-table">
                    <thead><tr><th>채널</th><th>이벤트 수</th></tr></thead>
                    <tbody>{(funnel?.sources || []).map((s: any) => (<tr><td>{s.source}</td><td>{s.n}</td></tr>))}</tbody>
                  </table>
                </div>
                <div class="admin-form">
                  <h3>예약 유입 채널 ⭐</h3>
                  <table class="admin-table">
                    <thead><tr><th>채널</th><th>예약 수</th></tr></thead>
                    <tbody>{(funnel?.resvSources || []).map((s: any) => (<tr><td>{s.source}</td><td>{s.n}</td></tr>))}</tbody>
                  </table>
                  <p style="font-size:13px;color:var(--ink-3);margin-top:10px">광고 링크에 <code>?utm_source=채널명</code>을 붙이면 자동 집계됩니다.</p>
                </div>
              </div>
            </>
          )}

          {tab === 'leads' && (
            <>
              <h1 class="admin-h1">리드 관리 <span style="font-size:14px;color:var(--ink-3);font-weight:400">체질테스트 맞춤 진료 제안 신청</span></h1>
              <table class="admin-table">
                <thead><tr><th>신청일</th><th>성함</th><th>연락처</th><th>체질</th><th>관심 진료</th><th>유입</th><th>상태</th><th></th></tr></thead>
                <tbody>
                  {(data || []).map((l: any) => (
                    <tr>
                      <td>{l.created_at?.slice(0, 10)}</td><td>{l.name}</td><td>{l.phone}</td>
                      <td>{l.sasang_type === 'taeyang' ? '태양인' : l.sasang_type === 'taeeum' ? '태음인' : l.sasang_type === 'soyang' ? '소양인' : l.sasang_type === 'soeum' ? '소음인' : '-'}</td>
                      <td>{l.interest}</td><td>{l.utm_source || '-'}</td>
                      <td><span class={`badge ${l.status}`}>{l.status === 'new' ? '신규' : l.status === 'contacted' ? '연락됨' : l.status === 'converted' ? '전환 ⭐' : '종료'}</span></td>
                      <td>
                        <button class="btn-sm" data-action="lead-status" data-id={l.id}>상태변경</button>
                        <button class="btn-sm danger" data-action="delete-lead" data-id={l.id}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data || data.length === 0) && <p class="admin-empty">아직 리드가 없습니다. 체질 테스트 결과 화면에서 수집됩니다.</p>}
            </>
          )}

          {tab === 'recalls' && (
            <>
              <h1 class="admin-h1">리콜(재내원) 관리</h1>
              <form id="recall-form" class="admin-form">
                <h3>리콜 대상 등록</h3>
                <div class="admin-grid2">
                  <div class="field"><label>성함 *</label><input name="name" required /></div>
                  <div class="field"><label>연락처 *</label><input name="phone" required placeholder="010-0000-0000" /></div>
                  <div class="field"><label>진료</label><select name="treatment">{allTx.map((t) => <option value={t.shortName}>{t.shortName}</option>)}</select></div>
                  <div class="field"><label>마지막 내원일</label><input type="date" name="last_visit" /></div>
                  <div class="field"><label>다음 내원 추천일 *</label><input type="date" name="due_date" required /></div>
                  <div class="field"><label>메모</label><input name="note" placeholder="예: 한약 1개월 복용 완료 시점" /></div>
                </div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> 등록</button>
                <div class="form-msg" id="recall-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>추천일</th><th>성함</th><th>연락처</th><th>진료</th><th>메모</th><th>상태</th><th></th></tr></thead>
                <tbody>
                  {(data || []).map((r: any) => {
                    const overdue = r.due_date && r.due_date <= new Date().toISOString().slice(0, 10) && (r.status === 'pending')
                    return (
                      <tr style={overdue ? 'background:rgba(0,56,30,0.07)' : ''}>
                        <td>{r.due_date}{overdue ? ' ⚠️' : ''}</td><td>{r.name}</td><td>{r.phone}</td>
                        <td>{r.treatment}</td><td>{r.note}</td>
                        <td><span class={`badge ${r.status}`}>{r.status === 'pending' ? '대기' : r.status === 'notified' ? '연락됨' : r.status === 'booked' ? '예약됨' : '완료'}</span></td>
                        <td>
                          <button class="btn-sm" data-action="recall-status" data-id={r.id}>상태변경</button>
                          <button class="btn-sm danger" data-action="delete-recall" data-id={r.id}>삭제</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {(!data || data.length === 0) && <p class="admin-empty">등록된 리콜 대상이 없습니다.</p>}
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
                <h3 id="column-form-title">새 칼럼 작성</h3>
                <input type="hidden" name="edit_id" id="col-edit-id" value="" />
                <div class="admin-grid2">
                  <div class="field"><label>제목 *</label><input name="title" required /></div>
                  <div class="field"><label>슬러그(URL) *</label><input name="slug" required placeholder="diet-tips" /></div>
                  <div class="field"><label>관련 진료</label><select name="category">{allTx.map((t) => <option value={t.slug}>{t.shortName}</option>)}</select></div>
                  <div class="field"><label>작성자</label><select name="author">{DOCTORS.map((d) => <option value={d.slug}>{d.name}</option>)}</select></div>
                </div>
                <div class="field"><label>요약 (목록/검색결과에 노출)</label><input name="excerpt" id="col-excerpt" /></div>
                <div class="admin-grid2">
                  <div class="field">
                    <label>메타 설명 (SEO, 120~160자) <span class="seo-count" id="col-meta-count">0</span></label>
                    <input name="meta_description" id="col-meta" maxlength={170} placeholder="검색결과에 표시되는 설명. 핵심 키워드를 자연스럽게 포함하세요." />
                  </div>
                  <div class="field">
                    <label>SEO 키워드 (쉼표로 구분)</label>
                    <input name="keywords" id="col-keywords" placeholder="오산 한의원, 다이어트 한약, 추나요법" />
                  </div>
                </div>
                <div class="field"><label>대표 썸네일 (SNS 공유·OG 이미지로도 사용)</label><input type="file" name="thumbnail" accept="image/*" id="col-thumb" /></div>

                {/* ===== 슈퍼 WYSIWYG 에디터 ===== */}
                <div class="field">
                  <label>본문 <span class="muted">— 보이는 그대로 작성됩니다. 사진은 드래그&드롭·붙여넣기·버튼으로 본문 중간에 바로 삽입됩니다.</span></label>
                  <div class="wysiwyg" id="wysiwyg">
                    <div class="wysiwyg__toolbar" id="col-toolbar">
                      <div class="wysiwyg__group">
                        <select class="wysiwyg__block" id="col-block" title="문단 형식">
                          <option value="p">본문</option>
                          <option value="h2">제목 H2</option>
                          <option value="h3">소제목 H3</option>
                          <option value="blockquote">인용구</option>
                        </select>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-cmd="bold" title="굵게 (Ctrl+B)"><i class="fas fa-bold"></i></button>
                        <button type="button" data-cmd="italic" title="기울임 (Ctrl+I)"><i class="fas fa-italic"></i></button>
                        <button type="button" data-cmd="underline" title="밑줄 (Ctrl+U)"><i class="fas fa-underline"></i></button>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-cmd="insertUnorderedList" title="글머리 목록"><i class="fas fa-list-ul"></i></button>
                        <button type="button" data-cmd="insertOrderedList" title="번호 목록"><i class="fas fa-list-ol"></i></button>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-link="1" title="링크 삽입/해제"><i class="fas fa-link"></i></button>
                        <button type="button" data-cmd="removeFormat" title="서식 지우기"><i class="fas fa-eraser"></i></button>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" id="col-img-btn" title="이미지 삽입"><i class="fas fa-image"></i> 사진</button>
                        <input type="file" id="col-img-input" accept="image/*" multiple style="display:none" />
                      </div>
                      <div class="wysiwyg__group wysiwyg__align" id="col-img-align" style="display:none">
                        <span class="muted" style="font-size:12px">선택한 사진:</span>
                        <button type="button" data-align="left" title="왼쪽 정렬"><i class="fas fa-align-left"></i></button>
                        <button type="button" data-align="center" title="가운데"><i class="fas fa-align-center"></i></button>
                        <button type="button" data-align="right" title="오른쪽 정렬"><i class="fas fa-align-right"></i></button>
                        <button type="button" data-align="full" title="가로 꽉 채움"><i class="fas fa-arrows-alt-h"></i></button>
                        <button type="button" data-img-alt="1" title="대체텍스트(alt) 편집"><i class="fas fa-tag"></i> alt</button>
                        <button type="button" data-img-del="1" class="danger" title="사진 삭제"><i class="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <div class="wysiwyg__editor" id="col-editor" contenteditable="true" data-placeholder="여기에 칼럼 내용을 작성하세요. 사진을 끌어다 놓으면 본문 그 자리에 삽입됩니다."></div>
                    <div class="wysiwyg__statusbar">
                      <span id="col-drop-hint">📷 사진을 본문으로 드래그하거나 Ctrl+V로 붙여넣으세요</span>
                      <span class="wysiwyg__stats"><span id="col-wordcount">0자</span> · 예상 읽기 <strong id="col-readtime">0분</strong></span>
                    </div>
                  </div>
                  {/* 실제 전송되는 HTML 본문 (에디터에서 자동 동기화) */}
                  <textarea name="body" id="col-body" required style="display:none"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" id="col-submit-btn"><i class="fas fa-plus"></i> 발행</button>
                <button type="button" class="btn btn-light" id="col-cancel-edit" style="display:none;margin-left:8px">수정 취소</button>
                <div class="form-msg" id="column-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>제목</th><th>조회</th><th></th></tr></thead>
                <tbody>{(data || []).map((c: any) => (<tr><td>{c.id}</td><td>{c.title}</td><td>{c.views || 0}</td><td><button class="btn-sm" data-action="edit-column" data-id={c.id}>수정</button> <button class="btn-sm danger" data-action="delete-column" data-id={c.id}>삭제</button></td></tr>))}</tbody>
              </table>
            </>
          )}

          {tab === 'notices' && (
            <>
              <h1 class="admin-h1">공지사항 관리</h1>
              <div class="admin-grid2" style="align-items:start;gap:24px">
                <form id="notice-form" class="admin-form" enctype="multipart/form-data">
                  <h3 id="notice-form-title">새 공지 등록</h3>
                  <input type="hidden" name="edit_id" id="notice-edit-id" value="" />
                  <div class="field"><label>제목 *</label><input name="title" id="nt-title" required /></div>
                  <div class="field"><label>분류</label>
                    <select name="category" id="nt-category">
                      <option value="notice">일반 공지</option>
                      <option value="event">이벤트</option>
                      <option value="holiday">휴진 안내</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>내용 * <span class="muted">— 줄바꿈은 그대로 표시됩니다</span></label>
                    <div class="nt-body-tools">
                      <button type="button" data-nt="strong" title="굵게"><i class="fas fa-bold"></i></button>
                      <button type="button" data-nt="line" title="구분선"><i class="fas fa-minus"></i></button>
                      <button type="button" data-nt="bullet" title="• 항목"><i class="fas fa-list-ul"></i></button>
                      <span class="nt-charcount" id="nt-charcount">0자</span>
                    </div>
                    <textarea name="body" id="nt-body" required placeholder="공지 내용을 입력하세요. 예) 추석 연휴 휴진 안내&#10;- 9/16(월) ~ 9/18(수) 휴진&#10;- 9/19(목) 정상 진료"></textarea>
                  </div>
                  <div class="field"><label>사진 첨부</label><input type="file" name="image" accept="image/*" id="nt-image" /></div>
                  <div class="field check"><input type="checkbox" name="is_pinned" id="pin" /><label for="pin">대표(상단 고정) 공지로 지정</label></div>

                  <div class="notice-popup-box">
                    <div class="field check" style="margin-bottom:0">
                      <input type="checkbox" name="show_popup" id="nt-popup" />
                      <label for="nt-popup"><i class="fas fa-bullhorn" style="color:var(--vermilion)"></i> <strong>메인 화면에 팝업으로 띄우기</strong></label>
                    </div>
                    <p style="font-size:13px;color:var(--ink-3);margin:6px 0 12px">홈페이지 첫 화면 진입 시 이 공지가 팝업으로 표시됩니다. (방문자는 '오늘 하루 보지 않기' 선택 가능)</p>
                    <div class="admin-grid2" id="nt-popup-opts" style="opacity:.5;pointer-events:none">
                      <div class="field"><label>팝업 종료일 (비우면 무기한)</label><input type="date" name="popup_until" id="nt-until" /></div>
                      <div class="field"><label>'자세히 보기' 링크 (비우면 공지 상세)</label><input name="link_url" id="nt-link" placeholder="/reservation 또는 https://..." /></div>
                    </div>
                  </div>

                  <button type="submit" class="btn btn-primary" id="notice-submit-btn"><i class="fas fa-plus"></i> 등록</button>
                  <button type="button" class="btn btn-light" id="notice-cancel-edit" style="display:none;margin-left:8px">수정 취소</button>
                  <div class="form-msg" id="notice-msg"></div>
                </form>

                {/* 실시간 팝업 미리보기 */}
                <div class="admin-form" style="position:sticky;top:20px">
                  <h3><i class="fas fa-eye"></i> 팝업 미리보기</h3>
                  <div class="nt-preview" id="nt-preview">
                    <div class="nt-preview__card">
                      <span class="nt-preview__tag" id="ntp-tag" style="display:none"></span>
                      <div class="nt-preview__media" id="ntp-media" style="display:none"><img id="ntp-img" alt="" /></div>
                      <div class="nt-preview__body">
                        <strong id="ntp-title">제목을 입력하세요</strong>
                        <p id="ntp-text">내용 미리보기가 여기에 표시됩니다.</p>
                        <span class="nt-preview__btn">자세히 보기 →</span>
                      </div>
                      <div class="nt-preview__foot">☐ 오늘 하루 보지 않기 &nbsp;·&nbsp; 닫기</div>
                    </div>
                  </div>
                  <p style="font-size:12.5px;color:var(--ink-3);margin-top:10px">※ '팝업으로 띄우기'를 켜야 실제 홈에 노출됩니다.</p>
                </div>
              </div>

              <table class="admin-table" style="margin-top:24px">
                <thead><tr><th>ID</th><th>제목</th><th>분류</th><th>고정</th><th>팝업</th><th></th></tr></thead>
                <tbody>{(data || []).map((n: any) => (<tr><td>{n.id}</td><td>{n.title}</td><td>{n.category === 'event' ? '이벤트' : n.category === 'holiday' ? '휴진' : '공지'}</td><td>{n.is_pinned ? '★' : ''}</td><td>{n.show_popup ? '🔔' : ''}</td><td><button class="btn-sm" data-action="edit-notice" data-id={n.id}>수정</button> <button class="btn-sm danger" data-action="delete-notice" data-id={n.id}>삭제</button></td></tr>))}</tbody>
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
