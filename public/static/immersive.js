/* 정원한의원 메인 스크롤 몰입 연출 (GSAP ScrollTrigger + Lenis)
   톤: 庭園 — 종이 위 먹·초록 잉크. 자라고(덩굴), 펼쳐지고(족자), 찍히는(낙관) 느리고 유기적인 리듬
   - 글자는 모두 HTML 에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음)
   - 동작 줄이기 사용자는 아무것도 하지 않는다 / JS 가 꺼져도 전부 보인다
   - 히어로(기존 진입·한자 시차·떠다니는 잎)는 그대로 두고 가볍게만 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  function boot() { setTimeout(start, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  function start() {
  var root = document.documentElement;
  root.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var SOFT = 'sine.out', GROW = 'power2.out';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  var main = $('#main-content') || document.body;
  var hero = $('#hero', main);
  if (hero) hero.classList.add('mx-hero');

  // 기존 [data-reveal] 등장은 히어로 밖에서 넘겨받는다. 줄그림(.svg-draw)은 .in 이 있어야 그려지므로 직접 그린다
  $$('[data-reveal]', main).forEach(function (el) {
    if (hero && hero.contains(el)) return;
    el.removeAttribute('data-reveal');
    el.removeAttribute('data-reveal-delay');
    el.classList.remove('in');
  });

  // 표준 모드(<!DOCTYPE html>)에서만 — 호환(quirks) 모드는 스크롤 주체가 body 라 Lenis 가 움직이지 못한다
  if (fine && window.Lenis && document.compatMode === 'CSS1Compat') {
    var lenis = new Lenis({ duration: 1.4, smoothWheel: true, wheelMultiplier: 0.85,
      prevent: function (node) { return !!(node.closest && node.closest('.mobile-menu, .search-overlay, .hero-popup, [data-lenis-prevent]')); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target; try { target = document.querySelector(id); } catch (err) { return; }
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -90 });
      });
    });
  }

  // ── 엔진
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el) || el.contains(c); }); }
  function enter(targets, vars, trigger, start) {
    targets = gsap.utils.toArray(targets);
    if (!targets.length) return null;
    claim(targets);
    var from = {}, to = { opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, filter: 'blur(0px)', paused: true,
      onStart: function () { gsap.set(targets, { transition: 'none' }); },
      onComplete: function () { gsap.set(targets, { clearProps: 'opacity,transform,transition,clipPath,filter' }); } };
    Object.keys(vars).forEach(function (k) { (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    if (!from.filter) delete to.filter;
    if (from.clipPath) to.clipPath = 'inset(0% 0% 0% 0%)';
    var tw = gsap.fromTo(targets, from, to);
    ScrollTrigger.create({ trigger: trigger || targets[0], start: start || 'top 88%', once: true, onEnter: function () {
      tw.play();
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
    return tw;
  }
  function scrubOnce(target, from, to, st, onDone) {
    claim(target);
    var tw = gsap.fromTo(target, from, Object.assign({ ease: 'none' }, to));
    tw.pause();
    var done = false;
    var trig = ScrollTrigger.create(Object.assign({}, st, {
      onUpdate: function (self) { if (!done) tw.progress(self.progress); },
      onLeave: finish
    }));
    function finish() {
      if (done) return; done = true;
      tw.progress(1);
      var keys = Object.keys(from).filter(function (k) { return k.indexOf('--') !== 0 && k !== 'strokeDashoffset'; });
      if (keys.length) gsap.set(target, { clearProps: keys.join(',') });
      trig.kill();
      if (onDone) onDone();
    }
    if (trig.progress >= 1) finish(); else tw.progress(trig.progress);
    return tw;
  }
  function par(img, y0, y1, s0, s1, trigger, st) {
    if (!img) return;
    img.classList.add('mx-pimg');
    claim(img);
    gsap.fromTo(img, { '--mx-y': y0 + '%', '--mx-s': s0 }, { '--mx-y': y1 + '%', '--mx-s': s1, ease: 'none',
      scrollTrigger: Object.assign({ trigger: trigger || img, start: 'top bottom', end: 'bottom top', scrub: true }, st || {}) });
  }
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      if (parts.join('').trim() === '') return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var i = document.createElement('span'); i.className = 'mx-ink'; i.textContent = p;
        frag.appendChild(i);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.mx-ink');
  }

  // ── 히어로: 기존 진입은 그대로. 내려갈 때 사인월 사진만 한 걸음 물러나고 질문 세 줄은 서로 다른 속도로 떠남
  if (hero) {
    var frame = $('.hero__visual-frame', hero);
    if (frame) gsap.fromTo(frame, { y: 0, rotate: 0 }, { y: mobile ? 30 : 90, rotate: mobile ? 0 : -1.5, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    $$('.hero__title .line', hero).forEach(function (ln, i) {
      gsap.fromTo(ln, { x: 0 }, { x: -(i + 1) * (mobile ? 8 : 28), ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  // ── 덩굴 디바이더: 스크롤만큼 줄기가 자라고, 끝까지 자라면 잎·꽃봉오리가 물듦 (다 자라면 그대로)
  $$('.garden-divider', main).forEach(function (d) {
    var paths = $$('.svg-draw path', d);
    if (!paths.length) return;
    claim(d);
    scrubOnce(paths, { strokeDashoffset: 1200 }, { strokeDashoffset: 0, stagger: 0.05 },
      { trigger: d, start: 'top 92%', end: 'top 45%' }, function () { d.classList.add('in'); });
  });

  // ── 섹션 머리: 먹이 번지듯 — 흐릿하던 낱말이 또렷해지며 내려앉음
  $$('.sec-head, .split__col, .worry__head, .cta-banner, .interior-banner__cap', main).forEach(function (head) {
    $$('h2', head).forEach(function (h) {
      if (isClaimed(h) || h.closest('.hero-popup')) return;
      enter(splitWords(h), { opacity: 0, y: 14, filter: 'blur(8px)', duration: 1.3, ease: SOFT, stagger: 0.06 }, h, 'top 88%');
    });
    $$('.eyebrow', head).forEach(function (e) { enter(e, { opacity: 0, x: -12, duration: 1.2, ease: SOFT }, e, 'top 92%'); });
  });

  // ── 숫자 색인: 줄기처럼 아래에서 하나씩 솟음
  var stats = $$('.stats > .stat', main);
  if (stats.length) enter(stats, { y: 50, opacity: 0, duration: 1.1, ease: 'back.out(1.3)', stagger: 0.1 }, stats[0].parentElement, 'top 88%');
  var rv = $$('.review-check-card', main);
  if (rv.length) enter(rv, { y: 24, opacity: 0, duration: 0.9, ease: GROW, stagger: 0.1 }, rv[0], 'top 92%');

  // ── 진료 공간 사진: 족자가 위에서 아래로 풀리듯 펼쳐짐
  var sf = $('.split__media-frame', main);
  if (sf) {
    scrubOnce(sf, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, { trigger: sf, start: 'top 90%', end: 'top 35%' });
    par($('img', sf), -6, 6, 1.14, 1.14, sf);
  }
  var lis = $$('.split__col ul > li', main);
  if (lis.length) enter(lis, { x: -24, opacity: 0, duration: 0.9, ease: GROW, stagger: 0.1 }, lis[0], 'top 90%');

  // ── 걱정 일곱 가지: 왼쪽 질문이 먼저 놓이고, 오른쪽 답이 뒤따라 닿음
  $$('.worry__row', main).forEach(function (row) {
    var q = $('.worry__q', row), a = $('.worry__a', row);
    if (q) enter(q, { x: -30, opacity: 0, duration: 1, ease: GROW }, row, 'top 88%');
    if (a) enter(a, { x: 30, opacity: 0, duration: 1, ease: GROW, delay: 0.15 }, row, 'top 88%');
  });

  // ── 원장 인터뷰 영상: 액자에서 넓게 펼쳐짐
  var pv = $('.promo-video', main);
  if (pv) scrubOnce(pv, { clipPath: mobile ? 'inset(0% 4% 0% 4% round 18px)' : 'inset(4% 10% 4% 10% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
    { trigger: pv, start: 'top 95%', end: 'top 30%' });

  // ── 주치 세 가지(第一·二·三 方): 처방전 카드가 살짝 기운 채 꽂히듯 내려앉음
  var tx = $$('.tx-grid > .tx-card', main);
  if (tx.length) enter(tx, { y: 80, rotate: function (i) { return mobile ? 0 : (i - 1) * 4; }, opacity: 0, transformOrigin: '50% 100%',
    duration: 1.3, ease: 'power3.out', stagger: 0.12 }, tx[0].parentElement, 'top 85%');

  // ── 오산 진료별 사진 카드: 사진이 위에서 아래로 풀리고, 사진은 안에서 천천히 흐름
  $$('.osan-card-grid > li', main).forEach(function (li, i) {
    var img = $('.osan-card__img', li);
    enter(li, { y: 40, opacity: 0, duration: 1.1, ease: GROW, delay: (i % 3) * 0.1 }, li, 'top 92%');
    if (img) { enter(img, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.4, ease: 'power3.inOut', delay: 0.1 + (i % 3) * 0.1 }, li, 'top 92%'); par($('img', img), -5, 5, 1.12, 1.12, li); }
  });

  // ── 세 가지 약속·진료법: 낙관(도장)이 찍히듯 — 크게 떠 있다 탁 내려앉음
  $$('.value-grid', main).forEach(function (g, gi) {
    var cards = $$('.value-card', g);
    if (!cards.length) return;
    if (gi === 0) enter(cards, { scale: 1.18, opacity: 0, duration: 0.7, ease: 'power4.in', stagger: 0.18 }, g, 'top 80%');
    else enter(cards, { x: function (i) { return (i - (cards.length - 1) / 2) * (mobile ? 0 : -60); }, y: 30, opacity: 0, duration: 1.2, ease: GROW, stagger: 0.1 }, g, 'top 85%');
  });

  // ── 대표원장 사진: 족자처럼 펼쳐지고, 붉은 인장이 마지막에 찍힘
  var dp = $('.doc-portrait', main);
  if (dp) {
    scrubOnce(dp, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, { trigger: dp, start: 'top 92%', end: 'top 40%' });
    par($('img', dp), -5, 5, 1.1, 1.1, dp);
    var seal = $('.doc-portrait__seal', dp);
    if (seal) {
      claim(seal);
      var stw = gsap.fromTo(seal, { scale: 2.2, rotate: -18, opacity: 0 }, { scale: 1, rotate: -4, opacity: 1, duration: 0.6, ease: 'power4.in', paused: true,
        onComplete: function () { gsap.set(seal, { clearProps: 'opacity,transform' }); } });
      ScrollTrigger.create({ trigger: dp, start: 'top 40%', once: true, onEnter: function () {
        stw.play(); setTimeout(function () { if (stw.progress() < 1) stw.progress(1); }, 1300);
      } });
    }
  }
  var chips = $$('.split__col .chip', main);
  if (chips.length) enter(chips, { y: 16, scale: 0.9, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.06 }, chips[0], 'top 94%');

  // ── 진료 여정: 금빛 연결선이 그어지며 지금 지나는 단계에 불이 켜짐
  var jr = $('.journey', main);
  if (jr) {
    jr.classList.add('mx-journey');
    var steps = $$('.journey__step', jr);
    enter(steps, { y: 40, opacity: 0, duration: 1, ease: GROW, stagger: 0.1 }, jr, 'top 85%');
    gsap.fromTo(jr, { '--mx-p': 0 }, { '--mx-p': 1, ease: 'none', scrollTrigger: { trigger: jr, start: 'top 75%', end: 'bottom 50%', scrub: true } });
    ScrollTrigger.create({ trigger: jr, start: 'top 65%', end: 'bottom 40%',
      onUpdate: function (self) {
        var idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        steps.forEach(function (s, i) { s.classList.toggle('mx-on', i === idx); });
      },
      onLeave: function () { steps.forEach(function (s) { s.classList.remove('mx-on'); }); },
      onLeaveBack: function () { steps.forEach(function (s) { s.classList.remove('mx-on'); }); } });
  }

  // ── 와이드 배너: 사인월이 천천히 다가오고(줌아웃), 글은 아래에서
  var ib = $('.interior-banner', main);
  if (ib) {
    par($('img', ib), -4, 4, 1.22, 1.02, ib);
    scrubOnce(ib, { scale: mobile ? 0.96 : 0.9 }, { scale: 1 }, { trigger: ib, start: 'top bottom', end: 'top 30%' });
  }

  // ── 실제 공간 갤러리: 서로 다른 속도의 사진 시차 + 엇갈린 등장
  $$('.facility-card', main).forEach(function (f, i) {
    enter(f, { y: 60 + (i % 2) * 30, opacity: 0, duration: 1.2, ease: GROW }, f, 'top 92%');
    par($('img', f), -(5 + (i % 3) * 3), 5 + (i % 3) * 3, 1.15, 1.15, f);
  });

  // ── 전체 진료 칩: 가운데에서 바깥으로 싹이 돋듯
  var minis = $$('.tx-mini', main);
  if (minis.length) enter(minis, { scale: 0.6, y: 20, opacity: 0, duration: 0.9, ease: 'back.out(1.7)',
    stagger: { grid: 'auto', from: 'center', amount: 0.5 } }, minis[0].parentElement, 'top 88%');

  // ── 체질·내원 배너: 화면 쪽으로 다가옴
  $$('.cta-banner', main).forEach(function (b) {
    scrubOnce(b, { scale: mobile ? 0.95 : 0.88 }, { scale: 1 }, { trigger: b, start: 'top bottom', end: 'top 40%' });
  });

  // ── FAQ
  var faqs = $$('.faq-list > .faq-item', main);
  if (faqs.length) enter(faqs, { y: 24, opacity: 0, duration: 0.9, ease: GROW, stagger: 0.07 }, faqs[0], 'top 92%');

  // ── 나머지: 넘겨받은 블록 중 연출 없는 것은 부드럽게
  $$('section', main).forEach(function (s) {
    if (s === hero || s.closest('.hero-popup')) return;
    $$(':scope > .wrap > *, :scope > .wrap-narrow > *, :scope > .wrap > * > *, :scope > .wrap-narrow > * > *', s).forEach(function (el) {
      if (/STYLE|SCRIPT|BR/.test(el.tagName) || isClaimed(el)) return;
      var r = el.getBoundingClientRect();
      if (r.height < 8 || r.height > innerHeight * 1.4) return;
      enter(el, { y: 30, opacity: 0, duration: 1.1, ease: GROW }, el, 'top 90%');
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
