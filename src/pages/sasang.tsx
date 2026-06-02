import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { SASANG_QUESTIONS, SASANG_RESULTS, SASANG_DISCLAIMER } from '../data/sasang'
import { breadcrumbSchema } from '../lib/schema'

export const SasangTestPage: FC = () => {
  // 데이터를 클라이언트 JS로 전달
  const dataJson = JSON.stringify({ questions: SASANG_QUESTIONS, results: SASANG_RESULTS, disclaimer: SASANG_DISCLAIMER })
  return (
    <Page
      title="사상체질 TI 테스트 — 내 체질 알아보기 | 오산 정원한의원"
      description="8개의 질문으로 알아보는 나의 사상체질. 태양인·태음인·소양인·소음인, 당신의 체질은 무엇일까요? 오산 정원한의원의 무료 체질 자가진단 테스트."
      path="/sasang-test"
      jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '체질 TI 테스트', url: '/sasang-test' }])}
    >
      <PageHero
        title="사상체질 TI 테스트"
        desc="8개의 질문으로 알아보는 나의 체질. 건강 관리의 첫걸음을 시작하세요."
        breadcrumb={[{ label: '안내' }, { label: '체질 TI 테스트' }]}
      />
      <section class="section bg-soft">
        <div class="wrap">
          <div class="ti-card" id="ti-card">
            {/* 시작 화면 */}
            <div id="ti-intro">
              <div class="text-center">
                <div style="font-size:64px;margin-bottom:16px">🌿</div>
                <h2 style="font-size:28px;margin-bottom:16px">나의 사상체질은?</h2>
                <p style="color:var(--ink-2);margin-bottom:30px;line-height:1.7">
                  사상체질은 사람의 체질을 태양인·태음인·소양인·소음인 네 가지로 나누어 봅니다.<br />
                  8개의 간단한 질문에 답하고 나의 체질 경향을 알아보세요.
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
        '<div class="hero__actions" style="justify-content:center;margin-bottom:20px">'+
          '<a href="/treatments/'+r.recommend+'" class="btn btn-primary"><i class="fas fa-leaf"></i> 맞춤 진료 알아보기</a>'+
          '<button class="btn btn-ghost" id="ti-retry"><i class="fas fa-rotate-right"></i> 다시 하기</button>'+
        '</div>'+
        '<p class="ti-disclaimer">'+data.disclaimer+'</p>'+
      '</div>';
    resultEl.style.display='';
    document.getElementById('ti-retry').addEventListener('click', function(){
      answers=[]; idx=0; resultEl.style.display='none'; intro.style.display='';
    });
  }
})();
`
