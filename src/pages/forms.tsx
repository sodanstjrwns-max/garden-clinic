import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { CLINIC } from '../data/clinic'
import { CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/treatments'
import { breadcrumbSchema } from '../lib/schema'

// ===== 예약 =====
export const ReservationPage: FC = () => (
  <Page
    title="진료 예약 — 오산 정원한의원"
    description="오산 정원한의원 온라인 진료 예약. 원하시는 진료과목과 일정을 남겨 주시면 확인 후 연락드립니다."
    path="/reservation"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '진료 예약', url: '/reservation' }])}
  >
    <PageHero title="진료 예약" desc="원하시는 일정을 남겨 주시면 확인 후 연락드립니다." breadcrumb={[{ label: '진료 예약' }]} />
    <section class="section">
      <div class="wrap">
        <div class="form-card" data-reveal>
          <div class="form-msg" id="form-msg"></div>
          <form id="reservation-form">
            <div class="field">
              <label>성함 *</label>
              <input type="text" name="name" required placeholder="홍길동" />
            </div>
            <div class="field">
              <label>연락처 *</label>
              <input type="tel" name="phone" required placeholder="010-0000-0000" />
            </div>
            <div class="field">
              <label>이메일</label>
              <input type="email" name="email" placeholder="example@email.com" />
            </div>
            <div class="field">
              <label>진료 과목 *</label>
              <select name="treatment" required>
                <option value="">선택해 주세요</option>
                <optgroup label="핵심 진료">
                  {CORE_TREATMENTS.map((t) => <option value={t.shortName}>{t.shortName}</option>)}
                </optgroup>
                <optgroup label="전체 진료">
                  {GENERAL_TREATMENTS.map((t) => <option value={t.shortName}>{t.shortName}</option>)}
                </optgroup>
              </select>
            </div>
            <div class="field">
              <label>희망 날짜·시간</label>
              <input type="text" name="preferred" placeholder="예: 6월 둘째 주 평일 오후" />
            </div>
            <div class="field">
              <label>증상·문의 내용</label>
              <textarea name="message" placeholder="불편한 증상이나 궁금한 점을 자유롭게 적어 주세요."></textarea>
            </div>
            <div class="field check">
              <input type="checkbox" name="agree" id="agree" required />
              <label for="agree">개인정보 수집·이용에 동의합니다. (예약 접수 및 진료 안내 목적, 필수)</label>
            </div>
            <div class="field check">
              <input type="checkbox" name="marketing" id="marketing" />
              <label for="marketing">마케팅 정보 수신에 동의합니다. (건강 정보·이벤트 안내, 선택)</label>
            </div>
            <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-calendar-check"></i> 예약 신청하기</button>
          </form>
          <p style="text-align:center;margin-top:20px;color:var(--ink-3);font-size:14px">
            급하신 경우 <a href={`tel:${CLINIC.phoneRaw}`} style="color:var(--brand);font-weight:700">{CLINIC.phone}</a>로 전화 주세요.
          </p>
        </div>
      </div>
    </section>
    <script dangerouslySetInnerHTML={{ __html: RESERVATION_SCRIPT }}></script>
  </Page>
)

const RESERVATION_SCRIPT = `
document.getElementById('reservation-form').addEventListener('submit', async function(e){
  e.preventDefault();
  var msg = document.getElementById('form-msg');
  var fd = new FormData(this);
  var body = Object.fromEntries(fd.entries());
  body.agree = !!fd.get('agree');
  body.marketing = !!fd.get('marketing');
  try {
    var res = await fetch('/api/reservation', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    var data = await res.json();
    if(res.ok){
      msg.className='form-msg ok';
      msg.textContent='예약 신청이 접수되었습니다. 확인 후 연락드리겠습니다. 감사합니다.';
      this.reset();
      window.scrollTo({top:0,behavior:'smooth'});
    } else { throw new Error(data.error||'오류'); }
  } catch(err){
    msg.className='form-msg err';
    msg.textContent='접수 중 문제가 발생했습니다. 전화로 문의해 주세요. ('+(err.message||'')+')';
  }
});
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
            비포/애프터 사진의 치료 후 이미지는 회원 로그인 후 확인하실 수 있습니다.
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
export const MyPage: FC<{ user?: { name: string; email: string } }> = ({ user }) => (
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
            <p style="color:var(--ink-2);margin:20px 0">이제 비포/애프터의 치료 후 사진을 포함한 모든 콘텐츠를 보실 수 있습니다.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a href="/cases/gallery" class="btn btn-primary"><i class="fas fa-images"></i> 비포/애프터 보기</a>
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
