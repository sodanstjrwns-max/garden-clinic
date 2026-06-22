import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC } from '../data/clinic'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'
import { breadcrumbSchema } from '../lib/schema'

// ===== 예약 (3스텝 퍼널 폼) =====
export const ReservationPage: FC<{ preselect?: string }> = ({ preselect }) => (
  <Page
    title="진료 예약 — 오산 정원한의원"
    description="오산 정원한의원 온라인 진료 예약. 원하시는 진료과목과 일정을 남겨 주시면 확인 후 연락드립니다."
    path="/reservation"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '진료 예약', url: '/reservation' }])}
  >
    <PageHero title="진료 예약" desc="3단계, 1분이면 충분합니다. 확인 후 빠르게 연락드립니다." breadcrumb={[{ label: '진료 예약' }]} />
    <section class="section">
      <div class="wrap resv-layout">
        {/* 신뢰 사이드 — 왜 정원한의원인가 */}
        <aside class="resv-trust" data-reveal>
          <span class="eyebrow">예약 전 안내</span>
          <h2 class="resv-trust__h">전화 없이도<br /><span class="accent serif">1분이면 예약 신청</span></h2>
          <p class="resv-trust__lead">남겨 주신 내용은 진료진이 직접 확인 후 연락드립니다. 강요나 무리한 권유는 없습니다.</p>
          <ul class="resv-trust__list">
            <li><i class="fas fa-user-doctor"></i><div><strong>한방내과 전문의 진료</strong><span>주력 분야별 한의사 8인이 진료합니다</span></div></li>
            <li><i class="fas fa-clipboard-list"></i><div><strong>예측 가능한 치료 계획</strong><span>초진 당일 기간·비용을 미리 안내합니다</span></div></li>
            <li><i class="fas fa-clock"></i><div><strong>평일 야간·주말 진료</strong><span>평일 {CLINIC.hours.weekday.time}</span></div></li>
            <li><i class="fas fa-square-parking"></i><div><strong>전용주차장 운영</strong><span>만차 시 인근 공영주차장 2시간 지원</span></div></li>
          </ul>
          <div class="resv-trust__call">
            <span>전화 상담이 편하시면</span>
            <a href={`tel:${CLINIC.phoneRaw}`} class="resv-trust__phone"><i class="fas fa-phone"></i> {CLINIC.phone}</a>
          </div>
          {(CLINIC.social.naverBooking || CLINIC.social.kakao) && (
            <div class="resv-trust__channels">
              <span class="resv-trust__channels-label">다른 방법으로 예약하기</span>
              <div class="resv-trust__channels-btns">
                {CLINIC.social.naverBooking && (
                  <a href={CLINIC.social.naverBooking} target="_blank" rel="noopener" class="resv-channel resv-channel--naver">
                    <i class="fas fa-calendar-check"></i> 네이버 예약
                  </a>
                )}
                {CLINIC.social.kakao && (
                  <a href={CLINIC.social.kakao} target="_blank" rel="noopener" class="resv-channel resv-channel--kakao">
                    <i class="fas fa-comment"></i> 카카오톡 상담
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>

        <div class="form-card" data-reveal data-reveal-delay="1">
          {/* 스텝 인디케이터 */}
          <div class="resv-steps" id="resv-steps">
            <div class="resv-step active" data-step="1"><span>1</span>진료 선택</div>
            <div class="resv-step" data-step="2"><span>2</span>일정·증상</div>
            <div class="resv-step" data-step="3"><span>3</span>연락처</div>
          </div>
          <div class="form-msg" id="form-msg"></div>

          <form id="reservation-form">
            {/* STEP 1: 진료 선택 */}
            <div class="resv-pane" data-pane="1">
              <div class="field">
                <label>어떤 진료가 필요하신가요? *</label>
                <div class="resv-tx-grid" id="resv-tx-grid">
                  {CORE_TREATMENTS.map((t) => (
                    <button type="button" class="resv-tx" data-tx={t.shortName}>
                      <i class={`fas ${t.icon}`}></i>
                      <strong>{t.shortName}</strong>
                      <span>{t.tagline}</span>
                    </button>
                  ))}
                </div>
                <select name="treatment" id="resv-tx-select" required style="margin-top:14px">
                  <option value="">기타 진료 선택…</option>
                  <optgroup label="핵심 진료">
                    {CORE_TREATMENTS.map((t) => <option value={t.shortName}>{t.shortName}</option>)}
                  </optgroup>
                  <optgroup label="전체 진료">
                    {GENERAL_TREATMENTS.map((t) => <option value={t.shortName}>{t.shortName}</option>)}
                  </optgroup>
                </select>
              </div>
              <button type="button" class="btn btn-primary btn-block resv-next" data-next="2">다음 <i class="fas fa-arrow-right"></i></button>
            </div>

            {/* STEP 2: 일정·증상 */}
            <div class="resv-pane" data-pane="2" style="display:none">
              <div class="field">
                <label>희망 날짜 <span class="field-opt">(선택)</span></label>
                <input type="date" name="preferred_date" id="resv-date" />
              </div>
              <div class="field">
                <label>희망 시간대 <span class="field-opt">(선택)</span></label>
                <div class="resv-times" id="resv-times" role="group" aria-label="희망 시간대 선택">
                  {[
                    { v: '오전 (09~12시)', icon: 'fa-sun' },
                    { v: '점심 (12~14시)', icon: 'fa-utensils' },
                    { v: '오후 (14~17시)', icon: 'fa-cloud-sun' },
                    { v: '저녁 (17~20시)', icon: 'fa-moon' },
                    { v: '주말', icon: 'fa-calendar-week' },
                    { v: '아무때나 가능', icon: 'fa-check' },
                  ].map((t) => (
                    <button type="button" class="resv-time" data-time={t.v}>
                      <i class={`fas ${t.icon}`}></i> {t.v}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="preferred_time" id="resv-time-input" />
              </div>
              <div class="field">
                <label>증상·문의 내용</label>
                <textarea name="message" placeholder="불편한 증상이나 궁금한 점을 자유롭게 적어 주세요."></textarea>
              </div>
              <div class="resv-nav">
                <button type="button" class="btn btn-ghost resv-prev" data-prev="1"><i class="fas fa-arrow-left"></i> 이전</button>
                <button type="button" class="btn btn-primary resv-next" data-next="3">다음 <i class="fas fa-arrow-right"></i></button>
              </div>
            </div>

            {/* STEP 3: 연락처 */}
            <div class="resv-pane" data-pane="3" style="display:none">
              <div class="field">
                <label>성함 *</label>
                <input type="text" name="name" placeholder="홍길동" />
              </div>
              <div class="field">
                <label>연락처 *</label>
                <input type="tel" name="phone" placeholder="010-0000-0000" />
              </div>
              <div class="field">
                <label>이메일</label>
                <input type="email" name="email" placeholder="example@email.com" />
              </div>
              <div class="field check">
                <input type="checkbox" name="agree" id="agree" required />
                <label for="agree">개인정보 수집·이용에 동의합니다. (예약 접수 및 진료 안내 목적, 필수)</label>
              </div>
              <div class="field check">
                <input type="checkbox" name="marketing" id="marketing" />
                <label for="marketing">마케팅 정보 수신에 동의합니다. (건강 정보·이벤트 안내, 선택)</label>
              </div>
              <div class="resv-nav">
                <button type="button" class="btn btn-ghost resv-prev" data-prev="2"><i class="fas fa-arrow-left"></i> 이전</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 예약 신청하기</button>
              </div>
            </div>
          </form>

          {/* 완료 화면: 방문 전 안내 */}
          <div id="resv-done" style="display:none">
            <div class="resv-done-head">
              <i class="fas fa-circle-check"></i>
              <h3>예약 신청이 접수되었습니다!</h3>
              <p>확인 후 <strong id="resv-done-phone"></strong>로 연락드리겠습니다.</p>
            </div>
            <div class="resv-guide">
              <h4><i class="fas fa-map-location-dot"></i> 방문 전 안내</h4>
              <ul>
                <li><strong>주차</strong> — 전용주차장이 뒷문과 연결됩니다. 내비게이션 "정원한의원 주차장"(오산동 876-12). 만차 시 인근 공영주차장 이용 시 2시간 주차 지원.</li>
                <li><strong>대중교통</strong> — [오산 농협중앙회] 정류장 바로 앞 건물 1층 / 오산역 1번 출구 도보 약 5분.</li>
                <li><strong>진료시간</strong> — 평일 8:30~20:00 · 주말/공휴일 8:30~15:00</li>
                <li><strong>준비물</strong> — 신분증, (교통사고의 경우) 보험 접수번호를 알고 오시면 빠릅니다.</li>
              </ul>
              <div class="hero__actions" style="margin-top:18px">
                <a href="/directions" class="btn btn-ink"><i class="fas fa-location-dot"></i> 오시는 길 자세히</a>
                <a href="/" class="btn btn-outline">홈으로</a>
              </div>
            </div>
          </div>

          <p style="text-align:center;margin-top:20px;color:var(--ink-3);font-size:14px">
            급하신 경우 <a href={`tel:${CLINIC.phoneRaw}`} style="color:var(--brand);font-weight:700">{CLINIC.phone}</a>로 전화 주세요.
          </p>
        </div>
      </div>
    </section>
    <script dangerouslySetInnerHTML={{ __html: `window.__RESV_PRESELECT=${JSON.stringify(preselect || '')};` }}></script>
    <script dangerouslySetInnerHTML={{ __html: RESERVATION_SCRIPT }}></script>
  </Page>
)

const RESERVATION_SCRIPT = `
(function(){
  var form = document.getElementById('reservation-form');
  var msg = document.getElementById('form-msg');
  var current = 1;

  function track(event, meta){
    try {
      navigator.sendBeacon && navigator.sendBeacon('/api/track', JSON.stringify({
        event: event, path: location.pathname, meta: meta||{},
        utm: (window.__getUtm ? window.__getUtm() : {}), sid: (window.__getSid ? window.__getSid() : '') }));
    } catch(e){}
  }
  track('resv_start');

  function goStep(n){
    current = n;
    document.querySelectorAll('.resv-pane').forEach(function(p){ p.style.display = (p.dataset.pane == n) ? '' : 'none'; });
    document.querySelectorAll('.resv-step').forEach(function(s){
      s.classList.toggle('active', +s.dataset.step <= n);
    });
    track('resv_step', { step: n });
    window.scrollTo({ top: document.getElementById('resv-steps').getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
  }

  // 진료 카드 선택
  var select = document.getElementById('resv-tx-select');
  document.querySelectorAll('.resv-tx').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.resv-tx').forEach(function(b){ b.classList.remove('selected'); });
      btn.classList.add('selected');
      select.value = btn.dataset.tx;
      setTimeout(function(){ goStep(2); }, 250);
    });
  });
  select.addEventListener('change', function(){
    document.querySelectorAll('.resv-tx').forEach(function(b){ b.classList.toggle('selected', b.dataset.tx === select.value); });
  });

  // 희망 시간대 칩 선택 (복수 선택 가능)
  var timeInput = document.getElementById('resv-time-input');
  function syncTimes(){
    var picked = [];
    document.querySelectorAll('.resv-time.selected').forEach(function(b){ picked.push(b.dataset.time); });
    if (timeInput) timeInput.value = picked.join(', ');
  }
  document.querySelectorAll('.resv-time').forEach(function(btn){
    btn.addEventListener('click', function(){ btn.classList.toggle('selected'); syncTimes(); });
  });
  // 희망 날짜 최소값 = 오늘
  var dateEl = document.getElementById('resv-date');
  if (dateEl) { var td = new Date(); dateEl.min = td.toISOString().split('T')[0]; }

  // URL ?t= 사전선택 (체질 테스트 / 진료 페이지에서 원클릭 연결)
  var pre = window.__RESV_PRESELECT || new URLSearchParams(location.search).get('t') || '';
  if (pre) {
    var matched = false;
    document.querySelectorAll('.resv-tx').forEach(function(b){ if(b.dataset.tx === pre){ b.classList.add('selected'); matched = true; } });
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === pre) { select.value = pre; matched = true; break; }
    }
    if (matched) goStep(2);
  }

  // 스텝 이동
  document.querySelectorAll('.resv-next').forEach(function(b){
    b.addEventListener('click', function(){
      if (b.dataset.next === '2' && !select.value) {
        msg.className='form-msg err'; msg.textContent='진료 과목을 선택해 주세요.'; return;
      }
      msg.className='form-msg'; msg.textContent='';
      goStep(+b.dataset.next);
    });
  });
  document.querySelectorAll('.resv-prev').forEach(function(b){
    b.addEventListener('click', function(){ goStep(+b.dataset.prev); });
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var fd = new FormData(form);
    if (!fd.get('name') || !fd.get('phone')) {
      msg.className='form-msg err'; msg.textContent='성함과 연락처를 입력해 주세요.'; return;
    }
    var body = Object.fromEntries(fd.entries());
    body.agree = !!fd.get('agree');
    body.marketing = !!fd.get('marketing');
    body.utm = (window.__getUtm ? window.__getUtm() : {});
    try {
      var res = await fetch('/api/reservation', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      var data = await res.json();
      if(res.ok){
        track('resv_submit', { treatment: body.treatment });
        document.getElementById('resv-done-phone').textContent = body.phone;
        form.style.display = 'none';
        document.getElementById('resv-steps').style.display = 'none';
        document.getElementById('resv-done').style.display = '';
        window.scrollTo({top:0,behavior:'smooth'});
      } else { throw new Error(data.error||'오류'); }
    } catch(err){
      msg.className='form-msg err';
      msg.textContent='접수 중 문제가 발생했습니다. 전화로 문의해 주세요. ('+(err.message||'')+')';
    }
  });
})();
`

// ===== 로그인 =====
export const LoginPage: FC = () => (
  <Page title="로그인 — 오산 정원한의원" description="오산 정원한의원 회원 로그인" path="/auth/login">
    <PageHero title="로그인" breadcrumb={[{ label: '로그인' }]} />
    <section class="section">
      <div class="wrap">
        <div class="form-card" data-reveal>
          <div class="form-msg" id="form-msg"></div>
          <form id="login-form">
            <div class="field"><label>이메일</label><input type="email" name="email" required /></div>
            <div class="field"><label>비밀번호</label><input type="password" name="password" required /></div>
            <button type="submit" class="btn btn-primary btn-block">로그인</button>
          </form>
          <p style="text-align:center;margin-top:18px;color:var(--ink-3);font-size:14px">
            아직 회원이 아니신가요? <a href="/auth/register" style="color:var(--brand);font-weight:700">회원가입</a>
          </p>
          <p style="text-align:center;margin-top:8px;color:var(--ink-3);font-size:13px">
            치료 사례의 치료 후 이미지는 회원 로그인 후 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </section>
    <script dangerouslySetInnerHTML={{ __html: `
      document.getElementById('login-form').addEventListener('submit', async function(e){
        e.preventDefault(); var msg=document.getElementById('form-msg');
        var fd=new FormData(this); var body=Object.fromEntries(fd.entries());
        var res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        var data=await res.json();
        if(res.ok){ window.location.href='/auth/mypage'; }
        else { msg.className='form-msg err'; msg.textContent=data.error||'로그인 실패'; }
      });
    ` }}></script>
  </Page>
)

// ===== 회원가입 =====
export const RegisterPage: FC = () => (
  <Page title="회원가입 — 오산 정원한의원" description="오산 정원한의원 회원가입" path="/auth/register">
    <PageHero title="회원가입" breadcrumb={[{ label: '회원가입' }]} />
    <section class="section">
      <div class="wrap">
        <div class="form-card" data-reveal>
          <div class="form-msg" id="form-msg"></div>
          <form id="register-form">
            <div class="field"><label>성함 *</label><input type="text" name="name" required /></div>
            <div class="field"><label>이메일 *</label><input type="email" name="email" required /></div>
            <div class="field"><label>전화번호 *</label><input type="tel" name="phone" required placeholder="010-0000-0000" /></div>
            <div class="field"><label>비밀번호 *</label><input type="password" name="password" required minlength="6" /></div>
            <div class="field check"><input type="checkbox" name="agree" id="r-agree" required /><label for="r-agree">개인정보 수집·이용에 동의합니다. (필수)</label></div>
            <div class="field check"><input type="checkbox" name="marketing" id="r-mkt" /><label for="r-mkt">마케팅 정보 수신에 동의합니다. (선택)</label></div>
            <button type="submit" class="btn btn-primary btn-block">회원가입</button>
          </form>
          <p style="text-align:center;margin-top:18px;color:var(--ink-3);font-size:14px">
            이미 회원이신가요? <a href="/auth/login" style="color:var(--brand);font-weight:700">로그인</a>
          </p>
        </div>
      </div>
    </section>
    <script dangerouslySetInnerHTML={{ __html: `
      document.getElementById('register-form').addEventListener('submit', async function(e){
        e.preventDefault(); var msg=document.getElementById('form-msg');
        var fd=new FormData(this); var body=Object.fromEntries(fd.entries());
        body.agree=!!fd.get('agree'); body.marketing=!!fd.get('marketing');
        var res=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        var data=await res.json();
        if(res.ok){ msg.className='form-msg ok'; msg.textContent='가입이 완료되었습니다. 잠시 후 이동합니다.'; setTimeout(function(){window.location.href='/auth/mypage';},1200); }
        else { msg.className='form-msg err'; msg.textContent=data.error||'가입 실패'; }
      });
    ` }}></script>
  </Page>
)

// ===== 마이페이지 =====
export const MyPage: FC<{ user?: { name: string; email: string }; reservations?: any[] }> = ({ user, reservations }) => (
  <Page title="마이페이지 — 오산 정원한의원" description="오산 정원한의원 마이페이지" path="/auth/mypage">
    <PageHero title={user ? `${user.name}님, 반갑습니다` : '마이페이지'} breadcrumb={[{ label: '마이페이지' }]} />
    <section class="section">
      <div class="wrap-narrow">
        {user ? (
          <div class="form-card" data-reveal>
            <div class="cred-block">
              <h3>회원 정보</h3>
              <ul><li>성함: {user.name}</li><li>이메일: {user.email}</li></ul>
            </div>
            {reservations && reservations.length > 0 && (
              <div class="cred-block" style="margin-top:18px">
                <h3>나의 예약·진료 이력</h3>
                <table class="mypage-table">
                  <thead><tr><th>접수일</th><th>진료</th><th>상태</th></tr></thead>
                  <tbody>
                    {reservations.map((r: any) => (
                      <tr>
                        <td>{r.created_at?.slice(0, 10)}</td>
                        <td>{r.treatment}</td>
                        <td><span class={`badge ${r.status}`}>{r.status === 'pending' ? '확인 중' : r.status === 'done' ? '진료 완료' : r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reservations.some((r: any) => r.status === 'done') && (
                  <div class="mypage-review-cta">
                    <p><i class="fas fa-heart"></i> 진료는 만족스러우셨나요? 후기는 같은 고민을 가진 분들께 큰 도움이 됩니다.</p>
                    <a href="/review" class="btn btn-ink" data-track="review_click"><i class="fas fa-pen-nib"></i> 후기 남기러 가기</a>
                  </div>
                )}
              </div>
            )}
            <p style="color:var(--ink-2);margin:20px 0">이제 치료 사례의 치료 후 사진을 포함한 모든 콘텐츠를 보실 수 있습니다.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a href="/cases/gallery" class="btn btn-primary"><i class="fas fa-images"></i> 치료 사례 보기</a>
              <a href="/sasang-test" class="btn btn-outline"><i class="fas fa-feather-pointed"></i> 체질 테스트</a>
              <button class="btn btn-ghost" id="logout-btn">로그아웃</button>
            </div>
          </div>
        ) : (
          <div class="form-card text-center" data-reveal>
            <p style="margin-bottom:20px">로그인이 필요합니다.</p>
            <a href="/auth/login" class="btn btn-primary">로그인하기</a>
          </div>
        )}
      </div>
    </section>
    <script dangerouslySetInnerHTML={{ __html: `
      var lb=document.getElementById('logout-btn');
      if(lb) lb.addEventListener('click', async function(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/'; });
    ` }}></script>
  </Page>
)

// ===== 후기 안내 페이지 (⑨ 팬화 — 리뷰 요청 동선) =====
export const ReviewPage: FC = () => (
  <Page
    title="후기 남기기 — 오산 정원한의원"
    description="오산 정원한의원에서 진료받으신 경험과 후기를 남겨 주세요. 같은 고민을 가진 분들께 솔직한 후기가 큰 도움이 됩니다. 치료 효과와 반응에는 개인차가 있습니다."
    path="/review"
  >
    <PageHero
      title="후기 남기기"
      desc="원장님과 직원들에게 가장 큰 힘이 되는 한 마디. 같은 고민을 가진 이웃에게는 길잡이가 됩니다."
      breadcrumb={[{ label: '후기 남기기' }]}
    />
    <section class="section">
      <div class="wrap-narrow">
        <div class="review-grid" data-reveal>
          <a
            href={`https://map.naver.com/p/search/${encodeURIComponent('정원한의원 오산')}`}
            target="_blank"
            rel="noopener"
            class="review-card"
            data-track="review_click"
          >
            <span class="review-card__badge naver">N</span>
            <strong>네이버 영수증 리뷰</strong>
            <p>네이버 지도에서 "정원한의원 오산"을 검색하고 영수증 리뷰를 남겨 주세요. 지역 이웃들이 가장 많이 참고하는 후기입니다.</p>
            <span class="btn-text">네이버 지도 열기 <i class="fas fa-arrow-up-right-from-square"></i></span>
          </a>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent('정원한의원 오산')}`}
            target="_blank"
            rel="noopener"
            class="review-card"
            data-track="review_click"
          >
            <span class="review-card__badge google">G</span>
            <strong>구글 리뷰</strong>
            <p>구글 지도 리뷰는 검색 결과 노출에도 도움이 됩니다. 별점과 함께 한 줄 후기를 부탁드립니다.</p>
            <span class="btn-text">구글 지도 열기 <i class="fas fa-arrow-up-right-from-square"></i></span>
          </a>
        </div>
        <div class="review-tip" data-reveal>
          <h2><i class="fas fa-lightbulb"></i> 이런 내용이 담기면 더 도움이 됩니다</h2>
          <ul>
            <li>어떤 증상/고민으로 내원하셨는지</li>
            <li>설명·치료 과정에서 좋았던 점 (예측 가능했는지, 이해가 잘 됐는지)</li>
            <li>주차·시설·직원 응대 등 방문 경험</li>
          </ul>
          <p class="ti-disclaimer" style="margin-top:14px">
            후기 작성은 자발적 참여이며, 후기 내용은 개인의 경험으로 치료 효과는 개인에 따라 다를 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  </Page>
)
