/* ============================================================
   정원한의원 오산 - 프론트엔드 인터랙션
   스크롤 리빌, 헤더, 카운트업, FAQ, 모바일메뉴, 전후슬라이더
   모든 모션은 GPU 가속(transform/opacity) 위주
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 헤더 스크롤 ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 모바일 메뉴 ---------- */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu__close');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    const close = () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    };
    if (mobileClose) mobileClose.addEventListener('click', close);
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }
  // 모바일 아코디언
  document.querySelectorAll('.m-acc-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      if (sub) sub.classList.toggle('open');
      const ic = btn.querySelector('i');
      if (ic) ic.style.transform = sub && sub.classList.contains('open') ? 'rotate(180deg)' : '';
    });
  });

  /* ---------- 스크롤 리빌 (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 숫자 카운트업 ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const dur = 1500;
          const start = performance.now();
          const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = Number.isInteger(target) ? Math.round(val).toLocaleString() : val.toFixed(1);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = Number.isInteger(target) ? target.toLocaleString() : target.toFixed(1);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- FAQ 아코디언 ---------- */
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const a = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- FAQ 카테고리 탭 ---------- */
  document.querySelectorAll('.faq-cat-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      document.querySelectorAll('.faq-cat-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[data-faq-group]').forEach((g) => {
        g.style.display = cat === 'all' || g.dataset.faqGroup === cat ? '' : 'none';
      });
    });
  });

  /* ---------- 패럴랙스 (히어로 배경) ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          parallaxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            el.style.transform = 'translate3d(0,' + y * speed + 'px,0)';
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- 전후 비교 슬라이더 ---------- */
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const after = slider.querySelector('.ba-slider__after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;
    let active = false;
    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
    };
    slider.addEventListener('mousedown', (e) => { active = true; setPos(e.clientX); });
    window.addEventListener('mousemove', (e) => { if (active) setPos(e.clientX); });
    window.addEventListener('mouseup', () => { active = false; });
    slider.addEventListener('touchstart', (e) => { setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', (e) => { setPos(e.touches[0].clientX); }, { passive: true });
  });

  /* ---------- 백과사전 검색/필터 ---------- */
  const encSearch = document.querySelector('#enc-search-input');
  if (encSearch) {
    const filter = () => {
      const term = encSearch.value.trim().toLowerCase();
      const activeCat = document.querySelector('.enc-cat.active')?.dataset.cat || 'all';
      document.querySelectorAll('.enc-card').forEach((card) => {
        const txt = card.textContent.toLowerCase();
        const cat = card.dataset.cat;
        const matchTerm = !term || txt.includes(term);
        const matchCat = activeCat === 'all' || cat === activeCat;
        card.style.display = matchTerm && matchCat ? '' : 'none';
      });
    };
    encSearch.addEventListener('input', filter);
    document.querySelectorAll('.enc-cat').forEach((c) => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.enc-cat').forEach((x) => x.classList.remove('active'));
        c.classList.add('active');
        filter();
      });
    });
  }

  /* ---------- 주소 자동완성 (비포애프터 지역) ---------- */
  window.initAddressAutocomplete = function (inputId, listId, suggestions) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;
    input.addEventListener('input', () => {
      const v = input.value.trim();
      list.innerHTML = '';
      if (!v) { list.classList.remove('show'); return; }
      const matched = suggestions.filter((s) => s.includes(v)).slice(0, 6);
      if (!matched.length) { list.classList.remove('show'); return; }
      matched.forEach((s) => {
        const item = document.createElement('div');
        item.className = 'autocomplete__item';
        item.textContent = s;
        item.addEventListener('click', () => { input.value = s; list.classList.remove('show'); });
        list.appendChild(item);
      });
      list.classList.add('show');
    });
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) list.classList.remove('show');
    });
  };

  /* ---------- Top 버튼 ---------- */
  const topBtn = document.querySelector('.fc-top');
  if (topBtn) topBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
