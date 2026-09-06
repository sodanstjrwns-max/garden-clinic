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

// 대시보드
export const AdminDashboard: FC<{ tab: string; stats: DashStats; data?: any }> = ({ tab, stats, data }) => {
  const allTx = [...CORE_TREATMENTS, ...GENERAL_TREATMENTS]
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: 'fa-gauge' },
    { id: 'leads', label: '리드(체질테스트)', icon: 'fa-user-plus' },
    { id: 'reservations', label: '예약', icon: 'fa-calendar-check' },
    { id: 'cases', label: '치료 사례', icon: 'fa-images' },
    { id: 'columns', label: '원장 칼럼', icon: 'fa-feather-pointed' },
    { id: 'herbs', label: '오늘 달인 한약', icon: 'fa-seedling' },
    { id: 'videos', label: '영상', icon: 'fa-video' },
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
            <a href="/admin/fees" class="admin-nav"><i class="fas fa-won-sign"></i> 비급여 진료비</a>
            <a href="/admin/stats" class="admin-nav"><i class="fas fa-chart-line"></i> 검색·방문 통계</a>
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
                <div class="admin-stat"><i class="fas fa-users"></i><div><strong>{stats.users}</strong><span>회원</span></div></div>
                <div class="admin-stat"><i class="fas fa-images"></i><div><strong>{stats.cases}</strong><span>치료 사례</span></div></div>
                <div class="admin-stat"><i class="fas fa-feather-pointed"></i><div><strong>{stats.columns}</strong><span>칼럼</span></div></div>
                <div class="admin-stat"><i class="fas fa-bullhorn"></i><div><strong>{stats.notices}</strong><span>공지</span></div></div>
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
              <div class="admin-head-row"><h1 class="admin-h1">치료 사례 관리</h1></div>
              <form id="case-form" class="admin-form" enctype="multipart/form-data">
                <h3 id="case-form-title">새 사례 등록</h3>
                <input type="hidden" name="edit_id" id="case-edit-id" value="" />
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
                  <div class="field"><label>치료 전</label><input type="file" name="pano_before" accept="image/*" /></div>
                  <div class="field"><label>치료 후</label><input type="file" name="pano_after" accept="image/*" /></div>
                  <div class="field"><label>부위 상세 전</label><input type="file" name="intra_before" accept="image/*" /></div>
                  <div class="field"><label>부위 상세 후</label><input type="file" name="intra_after" accept="image/*" /></div>
                </div>
                <p class="muted" id="case-img-hint" style="display:none;font-size:12px;margin:-4px 0 10px">※ 수정 시 새로 선택한 사진만 교체되고, 비워두면 기존 사진이 유지됩니다.</p>
                <button type="submit" class="btn btn-primary" id="case-submit-btn"><i class="fas fa-plus"></i> 등록</button>
                <button type="button" class="btn btn-light" id="case-cancel-edit" style="display:none;margin-left:8px"><i class="fas fa-times"></i> 수정 취소</button>
                <div class="form-msg" id="case-msg"></div>
              </form>
              <table class="admin-table">
                <thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>조회</th><th></th></tr></thead>
                <tbody>{(data || []).map((c: any) => (<tr><td>{c.id}</td><td>{c.title}</td><td>{c.category}</td><td>{c.views || 0}</td><td><button class="btn-sm" data-action="edit-case" data-id={c.id} style="margin-right:6px">수정</button><button class="btn-sm danger" data-action="delete-case" data-id={c.id}>삭제</button></td></tr>))}</tbody>
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
                  <div class="field"><label>관련 진료</label><select name="category"><option value="clinic">한의원 (일반 글)</option>{allTx.map((t) => <option value={t.slug}>{t.shortName}</option>)}</select></div>
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
                      <div class="wysiwyg__group wysiwyg__colors">
                        <div class="wysiwyg__color" title="글자색">
                          <button type="button" class="wysiwyg__color-btn" data-color-toggle="fore"><i class="fas fa-a"></i><span class="wysiwyg__color-bar" id="col-fore-bar" style="background:#c0392b"></span><i class="fas fa-caret-down"></i></button>
                          <div class="wysiwyg__palette" id="col-fore-palette" hidden>
                            <button type="button" class="wysiwyg__swatch" data-fore="#1a1a1a" style="background:#1a1a1a" title="검정"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#c0392b" style="background:#c0392b" title="빨강"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#c77d2e" style="background:#c77d2e" title="주황"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#2e7d5b" style="background:#2e7d5b" title="초록"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#2563a8" style="background:#2563a8" title="파랑"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#7b4bb0" style="background:#7b4bb0" title="보라"></button>
                            <button type="button" class="wysiwyg__swatch" data-fore="#6b7280" style="background:#6b7280" title="회색"></button>
                            <button type="button" class="wysiwyg__swatch wysiwyg__swatch--none" data-fore="reset" title="색 지우기"><i class="fas fa-ban"></i></button>
                          </div>
                        </div>
                        <div class="wysiwyg__color" title="형광펜(배경색)">
                          <button type="button" class="wysiwyg__color-btn" data-color-toggle="back"><i class="fas fa-highlighter"></i><span class="wysiwyg__color-bar" id="col-back-bar" style="background:#fff3a3"></span><i class="fas fa-caret-down"></i></button>
                          <div class="wysiwyg__palette" id="col-back-palette" hidden>
                            <button type="button" class="wysiwyg__swatch" data-back="#fff3a3" style="background:#fff3a3" title="노랑"></button>
                            <button type="button" class="wysiwyg__swatch" data-back="#ffd6d6" style="background:#ffd6d6" title="분홍"></button>
                            <button type="button" class="wysiwyg__swatch" data-back="#d6f0dd" style="background:#d6f0dd" title="연두"></button>
                            <button type="button" class="wysiwyg__swatch" data-back="#d6e6f7" style="background:#d6e6f7" title="하늘"></button>
                            <button type="button" class="wysiwyg__swatch" data-back="#ece0f7" style="background:#ece0f7" title="연보라"></button>
                            <button type="button" class="wysiwyg__swatch wysiwyg__swatch--none" data-back="reset" title="형광 지우기"><i class="fas fa-ban"></i></button>
                          </div>
                        </div>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-cmd="insertUnorderedList" title="글머리 기호 목록"><i class="fas fa-list-ul"></i></button>
                        <button type="button" data-cmd="insertOrderedList" title="번호 목록"><i class="fas fa-list-ol"></i></button>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-link="1" title="링크 삽입/해제"><i class="fas fa-link"></i></button>
                        <button type="button" data-cmd="removeFormat" title="서식 지우기"><i class="fas fa-eraser"></i></button>
                      </div>
                      <div class="wysiwyg__group">
                        <button type="button" data-table="1" title="표 삽입"><i class="fas fa-table"></i> 표</button>
                      </div>
                      <div class="wysiwyg__group wysiwyg__table-tools" id="col-table-tools" style="display:none">
                        <span class="muted" style="font-size:12px">표 편집:</span>
                        <button type="button" data-table-op="row-below" title="아래에 행 추가"><i class="fas fa-plus"></i> 행</button>
                        <button type="button" data-table-op="col-right" title="오른쪽에 열 추가"><i class="fas fa-plus"></i> 열</button>
                        <button type="button" data-table-op="row-del" title="현재 행 삭제"><i class="fas fa-minus"></i> 행</button>
                        <button type="button" data-table-op="col-del" title="현재 열 삭제"><i class="fas fa-minus"></i> 열</button>
                        <button type="button" data-table-op="del" class="danger" title="표 삭제"><i class="fas fa-trash"></i> 표</button>
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

          {tab === 'herbs' && (
            <>
              <h1 class="admin-h1">오늘 달인 한약 관리</h1>
              <p class="muted" style="margin:-6px 0 20px">매일 촬영한 탕전 사진을 등록하면 공개 페이지(<a href="/herbs" target="_blank">/herbs</a>)에 노출됩니다.</p>
              <form id="herb-form" class="admin-form" style="margin-bottom:26px">
                <h3>새 탕전 사진 등록</h3>
                <div class="form-row">
                  <div>
                    <label>탕전 일자 <span class="muted">(예: 2026-08-15)</span></label>
                    <input type="text" name="herb_name" placeholder="탕전 일자" />
                  </div>
                  <div>
                    <label>한 줄 설명 <span class="muted">(선택)</span></label>
                    <input type="text" name="caption" placeholder="예: 오늘 달인 한약입니다" />
                  </div>
                </div>
                <label>사진 <span class="muted">(8MB 이하, JPG/PNG)</span></label>
                <input type="file" name="image" accept="image/*" required id="herb-file" />
                <div id="herb-preview" style="margin-top:10px"></div>
                <div style="margin-top:16px"><button type="submit" class="btn btn-primary"><i class="fas fa-upload"></i> 사진 등록</button></div>
                <p id="herb-msg" class="muted" style="margin-top:10px"></p>
              </form>
              <h3 style="margin-bottom:12px">등록된 탕전 사진</h3>
              <div id="herb-list" class="herb-admin-grid"><p class="muted">불러오는 중…</p></div>
            </>
          )}

          {tab === 'videos' && (
            <>
              <h1 class="admin-h1">영상 관리</h1>
              <p class="muted" style="margin:-6px 0 20px">유튜브 영상 URL을 붙여넣으면 공개 영상 페이지(<a href="/videos" target="_blank">/videos</a>)에 썸네일로 노출됩니다.</p>
              <form id="video-form" class="admin-form" style="margin-bottom:26px">
                <label>영상 제목 *</label>
                <input type="text" name="title" placeholder="영상 제목" required />
                <label>유튜브 URL *</label>
                <input type="text" name="youtube_url" placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..." required />
                <div class="form-row">
                  <div>
                    <label>채널</label>
                    <select name="channel">
                      <option value="garden">가고싶은 한의원 이야기 (@garden_365clinic)</option>
                      <option value="diet">다이어트 멘토 김은아 (@diet_mentor_kim)</option>
                    </select>
                  </div>
                  <div>
                    <label>정렬 순서 <span class="muted">(작을수록 앞)</span></label>
                    <input type="number" name="sort_order" value="0" />
                  </div>
                </div>
                <label>짧은 설명 <span class="muted">(선택)</span></label>
                <input type="text" name="description" placeholder="한 줄 설명" />
                <div style="margin-top:16px"><button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> 영상 등록</button></div>
                <p id="video-msg" class="muted" style="margin-top:10px"></p>
              </form>
              <h3 style="margin-bottom:12px">등록된 영상</h3>
              <div id="video-list" class="herb-admin-grid"><p class="muted">불러오는 중…</p></div>
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

// ============================================================
// 비급여 진료비(수가) 관리 — 자체 완결형 편집기
// 항목별 공개/비공개 토글 · 인라인 편집 · 행/그룹 추가·삭제 · 단일 저장(POST)
// ============================================================
export type FeeEditItem = { name: string; price: string; note?: string; is_published?: number }
export type FeeEditGroup = { title: string; icon: string; desc?: string; items: FeeEditItem[] }

const FEES_ADMIN_CSS = `
.fadm{max-width:1100px;margin:0 auto;padding:24px 20px 80px}
.fadm .bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:8px 0 20px}
.fadm h1{font-size:24px;margin:0 0 6px}
.fadm .lead{color:#6b6b6b;font-size:14px;margin:0 0 18px}
.fadm .abtn{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:8px 14px;border-radius:8px;border:1px solid #d8d2c8;background:#fff;color:#3a3a3a;text-decoration:none;cursor:pointer}
.fadm .abtn.gold{background:#8a6d3b;border-color:#8a6d3b;color:#fff}
.fadm .grp{border:1px solid #e6e2da;border-radius:12px;margin-bottom:18px;overflow:hidden;background:#fff}
.fadm .grp-head{display:flex;gap:8px;align-items:center;background:#faf7f2;padding:12px 14px;flex-wrap:wrap}
.fadm .grp-head input{padding:7px 9px;border:1px solid #ddd;border-radius:7px;font-size:14px}
.fadm .grp-head .cat{font-weight:700;min-width:200px;flex:1}
.fadm .grp-head .icon{width:150px}
.fadm .grp-head .desc{flex:1 1 100%;min-width:200px}
.fadm table{width:100%;border-collapse:collapse;font-size:13.5px}
.fadm th{background:#fff;text-align:left;padding:8px;border-bottom:2px solid #eee;font-size:12px;color:#999}
.fadm td{padding:6px 8px;border-bottom:1px solid #f2f0ec;vertical-align:middle}
.fadm td input[type=text]{width:100%;padding:6px 8px;border:1px solid #e2e2e2;border-radius:6px;font-size:13.5px;font-family:inherit}
.fadm .col-name{width:30%}.fadm .col-price{width:20%}.fadm .col-note{width:34%}.fadm .col-pub{width:64px;text-align:center}.fadm .col-x{width:40px;text-align:center}
.fadm .rowdel{background:none;border:none;color:#c0392b;cursor:pointer;font-size:15px}
.fadm .grp-foot{padding:10px 14px;background:#fcfbf9}
.fadm .lil{font-size:12.5px;padding:6px 10px;border:1px dashed #c8bda8;border-radius:7px;background:#fff;cursor:pointer;color:#8a6d3b}
.fadm .savebar{position:sticky;bottom:0;background:#fff;border-top:1px solid #eee;padding:14px;display:flex;gap:12px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:10px;box-shadow:0 -4px 12px rgba(0,0,0,.04)}
.fadm .hint{color:#999;font-size:12.5px}
.fadm .hidden-row{opacity:.45}
`

export const AdminFeesPage: FC<{ groups: FeeEditGroup[] }> = ({ groups }) => (
  <AdminShell title="비급여 진료비 관리">
    <style dangerouslySetInnerHTML={{ __html: FEES_ADMIN_CSS }} />
    <div class="fadm">
      <div class="bar">
        <a href="/admin" class="abtn"><i class="fas fa-arrow-left"></i> 대시보드</a>
        <a href="/pricing" target="_blank" class="abtn"><i class="fas fa-arrow-up-right-from-square"></i> 공개 페이지 미리보기</a>
      </div>
      <h1><i class="fas fa-won-sign"></i> 비급여 진료비 관리</h1>
      <p class="lead">진료비를 직접 수정하고, 항목별로 <strong>공개/비공개</strong>를 정할 수 있습니다. 비공개 항목은 공개 페이지(/pricing)에서 숨겨지고 이 화면에서는 계속 편집됩니다.</p>
      <div id="f-groups"></div>
      <button type="button" id="f-addgroup" class="lil" style="margin:6px 0 20px"><i class="fas fa-plus"></i> 분류(그룹) 추가</button>
      <div class="savebar">
        <span id="f-status" class="hint"></span>
        <button type="button" id="f-save" class="abtn gold"><i class="fas fa-floppy-disk"></i> 저장</button>
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
      var GROUPS = ${JSON.stringify(groups)};
      var wrap = document.getElementById('f-groups');
      function q(s){ return (s==null?'':String(s)).replace(/"/g,'&quot;'); }
      function itemRow(it){
        var tr = document.createElement('tr');
        if(it.is_published===0) tr.className='hidden-row';
        tr.innerHTML =
          '<td class="col-name"><input type="text" data-k="name" value="'+q(it.name)+'"></td>'+
          '<td class="col-price"><input type="text" data-k="price" value="'+q(it.price)+'"></td>'+
          '<td class="col-note"><input type="text" data-k="note" value="'+q(it.note)+'"></td>'+
          '<td class="col-pub"><input type="checkbox" data-k="pub" '+(it.is_published===0?'':'checked')+' title="공개"></td>'+
          '<td class="col-x"><button type="button" class="rowdel" title="행 삭제"><i class="fas fa-trash"></i></button></td>';
        tr.querySelector('[data-k=pub]').addEventListener('change', function(e){ tr.className = e.target.checked ? '' : 'hidden-row'; });
        tr.querySelector('.rowdel').addEventListener('click', function(){ tr.remove(); });
        return tr;
      }
      function groupBlock(g){
        var box = document.createElement('div'); box.className='grp';
        box.innerHTML =
          '<div class="grp-head">'+
            '<input class="cat" data-k="title" type="text" placeholder="분류명" value="'+q(g.title)+'">'+
            '<input class="icon" data-k="icon" type="text" placeholder="아이콘(fa-circle-dot)" value="'+q(g.icon||'fa-circle-dot')+'">'+
            '<button type="button" class="rowdel grpdel" title="그룹 삭제"><i class="fas fa-trash"></i></button>'+
            '<input class="desc" data-k="desc" type="text" placeholder="분류 설명(선택)" value="'+q(g.desc)+'">'+
          '</div>'+
          '<table><thead><tr><th>항목</th><th>금액</th><th>비고</th><th style="text-align:center">공개</th><th></th></tr></thead><tbody></tbody></table>'+
          '<div class="grp-foot"><button type="button" class="lil addrow"><i class="fas fa-plus"></i> 항목 추가</button></div>';
        var tb = box.querySelector('tbody');
        (g.items||[]).forEach(function(it){ tb.appendChild(itemRow(it)); });
        box.querySelector('.addrow').addEventListener('click', function(){ tb.appendChild(itemRow({name:'',price:'',is_published:1})); });
        box.querySelector('.grpdel').addEventListener('click', function(){ if(confirm('이 분류 전체를 삭제할까요?')) box.remove(); });
        return box;
      }
      (GROUPS||[]).forEach(function(g){ wrap.appendChild(groupBlock(g)); });
      document.getElementById('f-addgroup').addEventListener('click', function(){ wrap.appendChild(groupBlock({title:'새 분류',icon:'fa-circle-dot',items:[]})); });
      function collect(){
        var groups=[];
        wrap.querySelectorAll('.grp').forEach(function(box){
          var title = box.querySelector('[data-k=title]').value.trim();
          var icon = box.querySelector('[data-k=icon]').value.trim()||'fa-circle-dot';
          var desc = box.querySelector('[data-k=desc]').value.trim();
          var items=[];
          box.querySelectorAll('tbody tr').forEach(function(tr){
            var name = tr.querySelector('[data-k=name]').value.trim();
            if(!name) return;
            items.push({
              name: name,
              price: tr.querySelector('[data-k=price]').value.trim(),
              note: tr.querySelector('[data-k=note]').value.trim(),
              is_published: tr.querySelector('[data-k=pub]').checked ? 1 : 0
            });
          });
          if(title && items.length) groups.push({title:title, icon:icon, desc:desc, items:items});
        });
        return { groups: groups };
      }
      document.getElementById('f-save').addEventListener('click', async function(){
        var btn=this, st=document.getElementById('f-status');
        btn.disabled=true; st.textContent='저장 중...';
        try{
          var r = await fetch('/admin/api/fees',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collect())});
          var j = await r.json();
          st.textContent = j.ok ? ('✓ 저장됨 ('+j.count+'개 항목)') : ('✗ '+(j.error||'실패'));
        }catch(e){ st.textContent='✗ 네트워크 오류'; }
        btn.disabled=false;
      });
    ` }} />
  </AdminShell>
)
