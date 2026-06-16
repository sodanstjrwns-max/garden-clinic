import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { SASANG_QUESTIONS, SASANG_RESULTS, SASANG_DISCLAIMER } from '../data/sasang'
import type { SasangType } from '../data/sasang'
import { getTreatment } from '../data/treatments'
import { breadcrumbSchema } from '../lib/schema'

export const SasangTestPage: FC = () => {
  // 데이터를 클라이언트 JS로 전달 (추천 진료명 포함)
  const enriched = Object.fromEntries(
    Object.entries(SASANG_RESULTS).map(([k, v]) => [k, { ...v, recommendName: getTreatment(v.recommend)?.shortName || '' }])
  )
  const dataJson = JSON.stringify({ questions: SASANG_QUESTIONS, results: enriched, disclaimer: SASANG_DISCLAIMER })
  return (
    <Page
      title="사상체질 TI 테스트 — 내 체질 알아보기 | 오산 정원한의원"
      description="8개의 질문으로 알아보는 나의 사상체질. 태양인·태음인·소양인·소음인, 당신의 체질은 무엇일까요? 오산 정원한의원의 무료 체질 자가진단 테스트."
      path="/sasang-test"
      jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '체질 TI 테스트', url: '/sasang-test' }])}
    >
      <PageHero
        title="사상체질 TI 테스트"
        desc="체질은 내 몸의 사용설명서입니다. 8개의 질문으로 나의 체질 경향을 알아보세요."
        breadcrumb={[{ label: '안내' }, { label: '체질 TI 테스트' }]}
      />
      <section class="section ti-stage">
        <div class="wrap">
          <div class="ti-card" id="ti-card">
            {/* 시작 화면 */}
            <div id="ti-intro">
              <div class="text-center">
                <div class="ti-emoji-badge">🌿</div>
                <h2 style="font-size:clamp(24px,4vw,34px);margin-bottom:16px;letter-spacing:-0.03em">나의 사상체질은?</h2>
                <p style="color:var(--ink-2);margin-bottom:14px;line-height:1.7">
                  검사는 정상인데 왜 계속 불편할까요? 병이 아니라, 내 몸의 <strong>작동 방식</strong> — 체질적 경향 때문일 수 있습니다.<br />
                  체질을 알면 체질별로 잘 생기는 불편함과 관리 방향, 평소 생활에서 함께 챙겨야 할 것들이 보입니다.
                </p>
                <p style="color:var(--ink-3);margin-bottom:30px;font-size:14.5px">
                  사상체질은 태양인·태음인·소양인·소음인 네 가지. 8개의 간단한 질문으로 나의 경향을 확인해 보세요.
                </p>
                <button class="btn btn-primary" id="ti-start"><i class="fas fa-play"></i> 테스트 시작하기</button>
                <p class="ti-disclaimer" style="margin-top:30px">{SASANG_DISCLAIMER}</p>
              </div>
            </div>

            {/* 질문 화면 */}
            <div id="ti-quiz" style="display:none">
              <div class="ti-progress"><div class="ti-progress__bar" id="ti-bar"></div></div>
              <div class="ti-qnum" id="ti-qnum"></div>
              <div class="ti-question" id="ti-question"></div>
              <div class="ti-options" id="ti-options"></div>
            </div>

            {/* 결과 화면 */}
            <div id="ti-result" style="display:none"></div>
          </div>

          {/* 4가지 체질 미리보기 — 결과 페이지 인링크(내부링크 커버리지) */}
          <div class="ti-preview" id="ti-preview">
            <h2 class="ti-preview__title">사상체질 4가지 미리보기</h2>
            <p class="ti-preview__desc">테스트 전에 각 체질의 특징을 먼저 살펴보셔도 좋습니다.</p>
            <div class="ti-preview__grid">
              {(['taeyang', 'taeeum', 'soyang', 'soeum'] as SasangType[]).map((k) => {
                const r = SASANG_RESULTS[k]
                return (
                  <a class="ti-preview__card" href={`/sasang-test/result/${k}`}>
                    <span class="ti-preview__emoji">{r.emoji}</span>
                    <span class="ti-preview__name">{r.name}</span>
                    <span class="ti-preview__hanja">{r.nameHanja}</span>
                    <span class="ti-preview__summary">{r.summary}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <script type="application/json" id="ti-data" dangerouslySetInnerHTML={{ __html: dataJson }}></script>
      <script dangerouslySetInnerHTML={{ __html: TI_SCRIPT }}></script>
    </Page>
  )
}

const TI_SCRIPT = `
(function(){
  var data = JSON.parse(document.getElementById('ti-data').textContent);
  var Q = data.questions, R = data.results;
  var answers = [], idx = 0;
  var intro = document.getElementById('ti-intro');
  var quiz = document.getElementById('ti-quiz');
  var resultEl = document.getElementById('ti-result');

  document.getElementById('ti-start').addEventListener('click', function(){
    intro.style.display='none'; quiz.style.display=''; render();
  });

  function render(){
    var q = Q[idx];
    document.getElementById('ti-bar').style.width = ((idx)/Q.length*100)+'%';
    document.getElementById('ti-qnum').textContent = 'Q'+(idx+1)+' / '+Q.length;
    document.getElementById('ti-question').textContent = q.question;
    var opts = document.getElementById('ti-options');
    opts.innerHTML='';
    q.options.forEach(function(o){
      var b=document.createElement('button');
      b.className='ti-option'; b.textContent=o.text;
      b.addEventListener('click', function(){ answers.push(o.type); next(); });
      opts.appendChild(b);
    });
  }
  function next(){
    idx++;
    if(idx<Q.length){ render(); }
    else { showResult(); }
  }
  function showResult(){
    document.getElementById('ti-bar').style.width='100%';
    var counts={};
    answers.forEach(function(t){ counts[t]=(counts[t]||0)+1; });
    var top=null, max=-1;
    Object.keys(counts).forEach(function(k){ if(counts[k]>max){max=counts[k];top=k;} });
    var r=R[top];
    quiz.style.display='none';
    var traits = r.traits.map(function(t){return '<li>'+t+'</li>';}).join('');
    var body = r.bodyTraits.map(function(t){return '<li>'+t+'</li>';}).join('');
    var care = r.careAdvice.map(function(t){return '<li>'+t+'</li>';}).join('');
    resultEl.innerHTML =
      '<div class="ti-result">'+
        '<div class="ti-result__emoji">'+r.emoji+'</div>'+
        '<div class="ti-result__type">'+r.name+'</div>'+
        '<div class="ti-result__hanja">'+r.nameHanja+'</div>'+
        '<p class="ti-result__summary">'+r.summary+'</p>'+
        '<div class="ti-traits">'+
          '<div class="ti-trait-box"><h4><i class="fas fa-star"></i> 성향</h4><ul>'+traits+'</ul></div>'+
          '<div class="ti-trait-box"><h4><i class="fas fa-person"></i> 신체 특징</h4><ul>'+body+'</ul></div>'+
          '<div class="ti-trait-box" style="grid-column:1/-1"><h4><i class="fas fa-heart-pulse"></i> 건강 관리 팁</h4><ul>'+care+'</ul></div>'+
        '</div>'+
        '<div class="ti-lead-card" id="ti-lead-card">'+
          '<div class="ti-lead-card__head"><i class="fas fa-user-doctor"></i> <strong>'+r.name+' 맞춤 진료 제안받기</strong></div>'+
          '<p class="ti-lead-card__desc">결과를 바탕으로 나에게 맞는 진료 방향을 한의원에서 직접 안내받아 보세요. 연락처를 남기시면 확인 후 연락드립니다.</p>'+
          '<div class="form-msg" id="ti-lead-msg"></div>'+
          '<form id="ti-lead-form" class="ti-lead-form">'+
            '<input type="text" name="name" placeholder="성함" required />'+
            '<input type="tel" name="phone" placeholder="연락처 (010-0000-0000)" required />'+
            '<label class="ti-lead-agree"><input type="checkbox" name="agree" required /> 개인정보 수집·이용 동의 (상담 안내 목적)</label>'+
            '<button type="submit" class="btn btn-ink btn-block"><i class="fas fa-paper-plane"></i> 맞춤 진료 제안받기</button>'+
          '</form>'+
        '</div>'+
        '<div class="hero__actions" style="justify-content:center;margin:24px 0 20px">'+
          '<a href="/treatments/'+r.recommend+'" class="btn btn-primary"><i class="fas fa-leaf"></i> 맞춤 진료 알아보기</a>'+
          '<a href="/reservation?t='+encodeURIComponent(r.recommendName||'')+'" class="btn btn-outline"><i class="fas fa-calendar-check"></i> 바로 예약하기</a>'+
        '</div>'+
        '<div class="ti-share">'+
          '<span>결과 공유하기</span>'+
          '<button class="ti-share-btn" id="ti-share" data-type="'+r.type+'"><i class="fas fa-share-nodes"></i> 공유</button>'+
          '<button class="ti-share-btn" id="ti-copy"><i class="fas fa-link"></i> 링크 복사</button>'+
          '<button class="ti-share-btn" id="ti-retry"><i class="fas fa-rotate-right"></i> 다시 하기</button>'+
        '</div>'+
        '<p class="ti-disclaimer">'+data.disclaimer+'</p>'+
      '</div>';
    resultEl.style.display='';
    track('ti_complete', { type: top });

    var shareUrl = location.origin + '/sasang-test/result/' + top;
    document.getElementById('ti-share').addEventListener('click', function(){
      track('share_click', { type: top });
      if (navigator.share) {
        navigator.share({ title: '나의 사상체질은 '+r.name+'!', text: r.summary, url: shareUrl }).catch(function(){});
      } else { copyLink(); }
    });
    document.getElementById('ti-copy').addEventListener('click', copyLink);
    function copyLink(){
      navigator.clipboard.writeText(shareUrl).then(function(){
        var btn = document.getElementById('ti-copy');
        btn.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
        setTimeout(function(){ btn.innerHTML = '<i class="fas fa-link"></i> 링크 복사'; }, 2000);
      });
    }
    document.getElementById('ti-retry').addEventListener('click', function(){
      answers=[]; idx=0; resultEl.style.display='none'; intro.style.display='';
    });

    // 리드 폼 제출
    document.getElementById('ti-lead-form').addEventListener('submit', async function(e){
      e.preventDefault();
      var msg = document.getElementById('ti-lead-msg');
      var fd = new FormData(this);
      try {
        var res = await fetch('/api/lead', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name: fd.get('name'), phone: fd.get('phone'), agree: !!fd.get('agree'),
            sasang_type: top, interest: r.recommend,
            utm: (window.__getUtm ? window.__getUtm() : {}) }) });
        if (res.ok) {
          track('ti_lead', { type: top });
          document.getElementById('ti-lead-card').innerHTML =
            '<div class="ti-lead-done"><i class="fas fa-circle-check"></i><strong>신청이 접수되었습니다!</strong><p>확인 후 빠르게 연락드리겠습니다. 급하신 경우 031-831-8620으로 전화 주세요.</p></div>';
        } else { throw new Error(); }
      } catch(err) {
        msg.className='form-msg err'; msg.textContent='접수 중 문제가 발생했습니다. 전화로 문의해 주세요.';
      }
    });
  }

  function track(event, meta){
    try {
      var payload = { event: event, path: location.pathname, meta: meta || {},
        utm: (window.__getUtm ? window.__getUtm() : {}), sid: (window.__getSid ? window.__getSid() : '') };
      navigator.sendBeacon && navigator.sendBeacon('/api/track', JSON.stringify(payload));
    } catch(e){}
  }
  // 시작 추적
  document.getElementById('ti-start').addEventListener('click', function(){ track('ti_start'); });
})();
`

// ============================================================
// 공유용 체질 결과 페이지 (/sasang-test/result/:type)
// — OG 카드로 지인 유입(⑩ 소개 단계의 디지털 버전)
// ============================================================
import { SASANG_RESULTS as RESULTS } from '../data/sasang'
import type { SasangType } from '../data/sasang'

export const SasangResultPage: FC<{ type: SasangType }> = ({ type }) => {
  const r = RESULTS[type]
  const rec = getTreatment(r.recommend)
  return (
    <Page
      title={`나의 사상체질은 ${r.name}(${r.nameHanja}) — 체질 TI 테스트 | 오산 정원한의원`}
      description={`${r.name} — ${r.summary} 오산 정원한의원의 사상체질 자가진단 테스트 결과입니다. 나도 테스트해 보세요!`}
      path={`/sasang-test/result/${type}`}
      jsonLd={breadcrumbSchema([
        { name: '홈', url: '/' },
        { name: '체질 TI 테스트', url: '/sasang-test' },
        { name: r.name, url: `/sasang-test/result/${type}` },
      ])}
    >
      <PageHero
        title={`${r.name} ${r.emoji}`}
        desc={r.summary}
        breadcrumb={[{ label: '체질 TI 테스트', href: '/sasang-test' }, { label: r.name }]}
      />
      <section class="section ti-stage">
        <div class="wrap">
          <div class="ti-card">
            <div class="ti-result">
              <div class="ti-result__emoji">{r.emoji}</div>
              <div class="ti-result__type">{r.name}</div>
              <div class="ti-result__hanja">{r.nameHanja}</div>
              <p class="ti-result__summary">{r.summary}</p>
              <div class="ti-traits">
                <div class="ti-trait-box"><h4><i class="fas fa-star"></i> 성향</h4><ul>{r.traits.map((t) => <li>{t}</li>)}</ul></div>
                <div class="ti-trait-box"><h4><i class="fas fa-person"></i> 신체 특징</h4><ul>{r.bodyTraits.map((t) => <li>{t}</li>)}</ul></div>
                <div class="ti-trait-box" style="grid-column:1/-1"><h4><i class="fas fa-heart-pulse"></i> 건강 관리 팁</h4><ul>{r.careAdvice.map((t) => <li>{t}</li>)}</ul></div>
              </div>
              <div class="hero__actions" style="justify-content:center;margin-bottom:20px">
                <a href="/sasang-test" class="btn btn-ink btn-lg"><i class="fas fa-feather-pointed"></i> 나도 테스트하기</a>
                {rec && <a href={`/treatments/${rec.slug}`} class="btn btn-outline"><i class="fas fa-leaf"></i> {rec.shortName} 알아보기</a>}
              </div>
              <p class="ti-disclaimer">{SASANG_DISCLAIMER}</p>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}
