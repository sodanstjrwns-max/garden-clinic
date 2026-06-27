(function () {
  'use strict';
  // 로그아웃
  var logout = document.getElementById('admin-logout');
  if (logout) logout.addEventListener('click', async function () {
    await fetch('/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  });

  // 지역 자동완성
  var areaInput = document.getElementById('case-area');
  var areaList = document.getElementById('case-area-list');
  if (areaInput && areaList && window.__ADDR_SUGGEST) {
    areaInput.addEventListener('input', function () {
      var v = areaInput.value.trim();
      areaList.innerHTML = '';
      if (!v) { areaList.classList.remove('show'); return; }
      var matched = window.__ADDR_SUGGEST.filter(function (s) { return s.indexOf(v) !== -1; }).slice(0, 6);
      if (!matched.length) { areaList.classList.remove('show'); return; }
      matched.forEach(function (s) {
        var item = document.createElement('div');
        item.className = 'autocomplete__item';
        item.textContent = s;
        item.addEventListener('click', function () { areaInput.value = s; areaList.classList.remove('show'); });
        areaList.appendChild(item);
      });
      areaList.classList.add('show');
    });
  }

  // 케이스 등록/수정 (multipart)
  var caseForm = document.getElementById('case-form');
  if (caseForm) caseForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('case-msg');
    var fd = new FormData(caseForm);
    var caseEditId = (document.getElementById('case-edit-id') || {}).value;
    var url = caseEditId ? '/admin/api/cases/' + caseEditId : '/admin/api/cases';
    var method = caseEditId ? 'PUT' : 'POST';
    var res = await fetch(url, { method: method, body: fd });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = caseEditId ? '수정되었습니다.' : '등록되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { var d = await res.json().catch(function(){return {};}); msg.className = 'form-msg err'; msg.textContent = (caseEditId ? '수정' : '등록') + ' 실패: ' + (d.error || ''); }
  });

  // 케이스 수정 모드 진입/취소
  function caseEditMode(on) {
    var title = document.getElementById('case-form-title');
    var btn = document.getElementById('case-submit-btn');
    var cancel = document.getElementById('case-cancel-edit');
    var hint = document.getElementById('case-img-hint');
    if (title) title.textContent = on ? '사례 수정' : '새 사례 등록';
    if (btn) btn.innerHTML = on ? '<i class="fas fa-save"></i> 수정 저장' : '<i class="fas fa-plus"></i> 등록';
    if (cancel) cancel.style.display = on ? 'inline-block' : 'none';
    if (hint) hint.style.display = on ? 'block' : 'none';
    if (!on && document.getElementById('case-edit-id')) document.getElementById('case-edit-id').value = '';
  }
  var caseCancel = document.getElementById('case-cancel-edit');
  if (caseCancel) caseCancel.addEventListener('click', function () { if (caseForm) caseForm.reset(); caseEditMode(false); });

  // 칼럼 등록/수정 (multipart: 썸네일 포함)
  var colForm = document.getElementById('column-form');
  if (colForm) colForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('column-msg');
    // 발행 전 에디터 → hidden textarea 최종 동기화
    if (typeof syncBody === 'function') syncBody();
    var bodyEl = document.getElementById('col-body');
    if (bodyEl && !bodyEl.value.trim()) {
      if (msg) { msg.className = 'form-msg err'; msg.textContent = '본문을 입력하세요.'; }
      return;
    }
    var fd = new FormData(colForm);
    var editId = (document.getElementById('col-edit-id') || {}).value;
    var url = editId ? '/admin/api/columns/' + editId : '/admin/api/columns';
    var method = editId ? 'PUT' : 'POST';
    var res = await fetch(url, { method: method, body: fd });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = editId ? '수정되었습니다.' : '발행되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { var d = await res.json().catch(function(){return {};}); msg.className = 'form-msg err'; msg.textContent = (editId ? '수정' : '발행') + ' 실패: ' + (d.error || ''); }
  });

  // 칼럼 수정 모드 진입/취소
  function colEditMode(on) {
    var title = document.getElementById('column-form-title');
    var btn = document.getElementById('col-submit-btn');
    var cancel = document.getElementById('col-cancel-edit');
    if (title) title.textContent = on ? '칼럼 수정' : '새 칼럼 작성';
    if (btn) btn.innerHTML = on ? '<i class="fas fa-save"></i> 수정 저장' : '<i class="fas fa-plus"></i> 발행';
    if (cancel) cancel.style.display = on ? 'inline-block' : 'none';
    if (!on && document.getElementById('col-edit-id')) document.getElementById('col-edit-id').value = '';
  }
  var colCancel = document.getElementById('col-cancel-edit');
  if (colCancel) colCancel.addEventListener('click', function () {
    colForm.reset(); colEditMode(false);
    var ed = document.getElementById('col-editor');
    if (ed) ed.innerHTML = '';
    slugTouched = false;
    if (typeof syncBody === 'function') syncBody();
    if (typeof metaCount === 'function') metaCount();
  });

  // ============================================================
  //  슈퍼 WYSIWYG 칼럼 에디터
  //   - contenteditable 기반 비주얼 편집 (보이는 그대로)
  //   - 이미지 드래그&드롭 / 붙여넣기 / 버튼 → 본문 커서 위치 삽입
  //   - 이미지 정렬(좌/중/우/꽉채움) + alt 편집 + 삭제
  //   - 슬러그 자동생성, 읽기시간 계산, 메타 글자수, body HTML 동기화
  // ============================================================
  var colBody = document.getElementById('col-body');        // hidden textarea (실제 전송)
  var editor = document.getElementById('col-editor');       // contenteditable 본문
  var savedRange = null;                                     // 에디터 포커스 잃을 때 selection 보존

  function saveRange() {
    var sel = window.getSelection();
    if (sel && sel.rangeCount && editor && editor.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0);
  }
  function restoreRange() {
    if (!editor) return;
    editor.focus();
    if (savedRange) { var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }
  }
  if (editor) editor.addEventListener('keyup', saveRange), editor.addEventListener('mouseup', saveRange);

  // 본문 → hidden textarea 동기화 + 통계 갱신
  function syncBody() {
    if (!editor || !colBody) return;
    // placeholder만 있는 빈 상태면 빈 값
    var html = editor.innerHTML.trim();
    if (html === '<br>' || html === '<p><br></p>') html = '';
    colBody.value = html;
    updateStats();
  }
  function updateStats() {
    var text = editor ? (editor.innerText || '').replace(/\s+/g, '') : '';
    var n = text.length;
    var wc = document.getElementById('col-wordcount');
    var rt = document.getElementById('col-readtime');
    if (wc) wc.textContent = n.toLocaleString() + '자';
    // 한국어 분당 약 500자 기준
    var min = Math.max(1, Math.round(n / 500));
    if (rt) rt.textContent = min + '분';
  }
  if (editor) editor.addEventListener('input', syncBody);

  // 블록 형식 선택 (본문/H2/H3/인용)
  var blockSel = document.getElementById('col-block');
  if (blockSel) blockSel.addEventListener('change', function () {
    restoreRange();
    var v = blockSel.value;
    document.execCommand('formatBlock', false, v === 'p' ? 'P' : v.toUpperCase());
    syncBody();
  });

  // 인라인 서식 버튼
  var toolbar = document.getElementById('col-toolbar');
  if (toolbar && editor) {
    toolbar.querySelectorAll('[data-cmd]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      btn.addEventListener('click', function () {
        restoreRange();
        document.execCommand(btn.dataset.cmd, false, null);
        syncBody();
      });
    });
    // 링크
    var linkBtn = toolbar.querySelector('[data-link]');
    if (linkBtn) linkBtn.addEventListener('click', function () {
      restoreRange();
      var url = prompt('링크 주소를 입력하세요 (빈칸이면 링크 해제):', 'https://');
      if (url === null) return;
      if (url.trim() === '') document.execCommand('unlink', false, null);
      else document.execCommand('createLink', false, url.trim());
      syncBody();
    });
  }

  // 키보드 단축키 (Ctrl+B/I/U) — contenteditable 기본 동작이지만 동기화 보장
  if (editor) editor.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].indexOf(e.key.toLowerCase()) !== -1) {
      setTimeout(syncBody, 0);
    }
  });

  // —— 이미지 삽입 (업로드 → figure 삽입) ——
  function insertNodeAtCursor(node) {
    restoreRange();
    var sel = window.getSelection();
    if (sel && sel.rangeCount) {
      var range = sel.getRangeAt(0);
      range.collapse(false);
      range.insertNode(node);
      // 캐럿을 삽입 노드 뒤로
      range.setStartAfter(node); range.collapse(true);
      sel.removeAllRanges(); sel.addRange(range);
    } else if (editor) {
      editor.appendChild(node);
    }
  }
  function makeFigure(url, alt) {
    var fig = document.createElement('figure');
    fig.className = 'col-fig col-fig--center';
    fig.setAttribute('contenteditable', 'false');
    var img = document.createElement('img');
    img.src = url; img.alt = alt || ''; img.setAttribute('loading', 'lazy');
    fig.appendChild(img);
    // 클릭 시 정렬 툴바 활성
    fig.addEventListener('click', function (e) { e.stopPropagation(); selectFigure(fig); });
    return fig;
  }
  async function uploadAndInsert(files) {
    if (!editor) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f.type || f.type.indexOf('image/') !== 0) continue;
      if (f.size > 5 * 1024 * 1024) { alert('5MB 이하 이미지만 업로드할 수 있습니다: ' + f.name); continue; }
      // 임시 로딩 figure
      var loading = document.createElement('figure');
      loading.className = 'col-fig col-fig--center col-fig--loading';
      loading.setAttribute('contenteditable', 'false');
      loading.innerHTML = '<div class="col-fig__spin"><i class="fas fa-spinner fa-spin"></i> 업로드 중…</div>';
      insertNodeAtCursor(loading);
      syncBody();
      var fd = new FormData();
      fd.append('image', f);
      try {
        var res = await fetch('/admin/api/upload-image', { method: 'POST', body: fd });
        var d = await res.json();
        if (res.ok && d.url) {
          var fig = makeFigure(d.url, '');
          loading.parentNode.replaceChild(fig, loading);
          // 업로드 직후 alt 요청 (SEO)
          var alt = prompt('🔎 SEO/접근성을 위해 이 사진을 설명하는 문구(alt)를 입력하세요:', '');
          if (alt) fig.querySelector('img').alt = alt;
        } else {
          loading.parentNode.removeChild(loading);
          alert('업로드 실패: ' + (d.error || ''));
        }
      } catch (e) {
        if (loading.parentNode) loading.parentNode.removeChild(loading);
        alert('업로드 중 오류가 발생했습니다.');
      }
      syncBody();
    }
  }
  var imgBtn = document.getElementById('col-img-btn');
  var imgInput = document.getElementById('col-img-input');
  if (imgBtn && imgInput) {
    imgBtn.addEventListener('mousedown', function () { saveRange(); });
    imgBtn.addEventListener('click', function () { imgInput.click(); });
    imgInput.addEventListener('change', function () { uploadAndInsert(imgInput.files); imgInput.value = ''; });
  }

  // 드래그&드롭 + 붙여넣기
  if (editor) {
    var hint = document.getElementById('col-drop-hint');
    ['dragenter', 'dragover'].forEach(function (ev) {
      editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.add('drop-active'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.remove('drop-active'); });
    });
    editor.addEventListener('drop', function (e) {
      // 드롭 위치로 캐럿 이동
      var range = null;
      if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(e.clientX, e.clientY);
      else if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); range.collapse(true); }
      }
      if (range) { var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); savedRange = range; }
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) uploadAndInsert(e.dataTransfer.files);
    });
    editor.addEventListener('paste', function (e) {
      var items = (e.clipboardData || {}).items || [];
      var imgs = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image/') === 0) {
          var blob = items[i].getAsFile(); if (blob) imgs.push(blob);
        }
      }
      if (imgs.length) { e.preventDefault(); saveRange(); uploadAndInsert(imgs); }
      else setTimeout(syncBody, 0);
    });
  }

  // —— 이미지 정렬/alt/삭제 툴바 ——
  var selFig = null;
  var alignBar = document.getElementById('col-img-align');
  function selectFigure(fig) {
    if (selFig) selFig.classList.remove('col-fig--selected');
    selFig = fig;
    if (fig) { fig.classList.add('col-fig--selected'); if (alignBar) alignBar.style.display = 'flex'; }
    else if (alignBar) alignBar.style.display = 'none';
  }
  if (editor) editor.addEventListener('click', function (e) {
    if (e.target === editor || e.target.tagName !== 'IMG') {
      // 빈 곳 클릭 → 선택 해제 (figure 자체 클릭은 위 핸들러가 처리)
      if (!e.target.closest || !e.target.closest('.col-fig')) selectFigure(null);
    }
  });
  if (alignBar) {
    alignBar.querySelectorAll('[data-align]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!selFig) return;
        selFig.className = selFig.className.replace(/col-fig--(left|center|right|full)/g, '').trim();
        selFig.classList.add('col-fig', 'col-fig--' + btn.dataset.align, 'col-fig--selected');
        syncBody();
      });
    });
    var altBtn = alignBar.querySelector('[data-img-alt]');
    if (altBtn) altBtn.addEventListener('click', function () {
      if (!selFig) return;
      var img = selFig.querySelector('img');
      var alt = prompt('대체텍스트(alt) — 검색엔진/스크린리더용 사진 설명:', img.alt || '');
      if (alt !== null) { img.alt = alt; syncBody(); }
    });
    var delBtn = alignBar.querySelector('[data-img-del]');
    if (delBtn) delBtn.addEventListener('click', function () {
      if (!selFig) return;
      selFig.parentNode.removeChild(selFig); selectFigure(null); syncBody();
    });
  }

  // —— 슬러그 자동생성 ——
  function slugify(s) {
    return (s || '').toString().trim().toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }
  var colTitle = colForm ? colForm.querySelector('[name="title"]') : null;
  var colSlug = colForm ? colForm.querySelector('[name="slug"]') : null;
  var slugTouched = false;
  if (colSlug) colSlug.addEventListener('input', function () { slugTouched = true; });
  if (colTitle && colSlug) colTitle.addEventListener('input', function () {
    if (!slugTouched && !document.getElementById('col-edit-id').value) colSlug.value = slugify(colTitle.value);
  });

  // —— 메타 글자수 표시 ——
  var colMeta = document.getElementById('col-meta');
  var colMetaCount = document.getElementById('col-meta-count');
  function metaCount() {
    if (!colMeta || !colMetaCount) return;
    var n = colMeta.value.length;
    colMetaCount.textContent = n;
    colMetaCount.className = 'seo-count' + (n >= 120 && n <= 160 ? ' ok' : (n > 160 ? ' over' : ''));
  }
  if (colMeta) { colMeta.addEventListener('input', metaCount); metaCount(); }

  // 공지 등록/수정 (multipart: 사진 포함)
  var noticeForm = document.getElementById('notice-form');
  if (noticeForm) noticeForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('notice-msg');
    var fd = new FormData(noticeForm);
    var editId = (document.getElementById('notice-edit-id') || {}).value;
    var url = editId ? '/admin/api/notices/' + editId : '/admin/api/notices';
    var method = editId ? 'PUT' : 'POST';
    var res = await fetch(url, { method: method, body: fd });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = editId ? '수정되었습니다.' : '등록되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { msg.className = 'form-msg err'; msg.textContent = (editId ? '수정' : '등록') + ' 실패'; }
  });

  // 공지 수정 모드
  function noticeEditMode(on) {
    var title = document.getElementById('notice-form-title');
    var btn = document.getElementById('notice-submit-btn');
    var cancel = document.getElementById('notice-cancel-edit');
    if (title) title.textContent = on ? '공지 수정' : '새 공지 등록';
    if (btn) btn.innerHTML = on ? '<i class="fas fa-save"></i> 수정 저장' : '<i class="fas fa-plus"></i> 등록';
    if (cancel) cancel.style.display = on ? 'inline-block' : 'none';
    if (!on && document.getElementById('notice-edit-id')) document.getElementById('notice-edit-id').value = '';
  }
  var noticeCancel = document.getElementById('notice-cancel-edit');
  if (noticeCancel) noticeCancel.addEventListener('click', function () { noticeForm.reset(); noticeEditMode(false); ntSync(); });

  // —— 공지 팝업 옵션 토글 + 실시간 미리보기 ——
  var ntPopup = document.getElementById('nt-popup');
  var ntOpts = document.getElementById('nt-popup-opts');
  if (ntPopup && ntOpts) {
    ntPopup.addEventListener('change', function () {
      ntOpts.style.opacity = ntPopup.checked ? '1' : '.5';
      ntOpts.style.pointerEvents = ntPopup.checked ? 'auto' : 'none';
    });
  }
  function ntSync() {
    var t = (document.getElementById('nt-title') || {}).value || '';
    var b = (document.getElementById('nt-body') || {}).value || '';
    var cat = (document.getElementById('nt-category') || {}).value || 'notice';
    var ttlEl = document.getElementById('ntp-title'), txtEl = document.getElementById('ntp-text');
    var tagEl = document.getElementById('ntp-tag');
    if (ttlEl) ttlEl.textContent = t || '제목을 입력하세요';
    if (txtEl) txtEl.textContent = (b.replace(/<[^>]+>/g, '').slice(0, 140)) || '내용 미리보기가 여기에 표시됩니다.';
    if (tagEl) {
      if (cat === 'event') { tagEl.textContent = '이벤트'; tagEl.style.display = ''; tagEl.style.background = 'var(--gold,#c9a24b)'; }
      else if (cat === 'holiday') { tagEl.textContent = '휴진 안내'; tagEl.style.display = ''; tagEl.style.background = 'var(--vermilion,#c0392b)'; }
      else { tagEl.style.display = 'none'; }
    }
  }
  ['nt-title', 'nt-body', 'nt-category'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', ntSync), el.addEventListener('change', ntSync);
  });
  var ntImage = document.getElementById('nt-image');
  if (ntImage) ntImage.addEventListener('change', function () {
    var media = document.getElementById('ntp-media'), img = document.getElementById('ntp-img');
    if (ntImage.files && ntImage.files[0] && media && img) {
      img.src = URL.createObjectURL(ntImage.files[0]); media.style.display = '';
    } else if (media) { media.style.display = 'none'; }
  });
  // 공지 본문 서식 도움 + 글자수
  var ntBody = document.getElementById('nt-body');
  var ntCharCount = document.getElementById('nt-charcount');
  function ntInsertAtCursor(text) {
    if (!ntBody) return;
    var s = ntBody.selectionStart, epos = ntBody.selectionEnd;
    var sel = ntBody.value.slice(s, epos);
    ntBody.value = ntBody.value.slice(0, s) + text.replace('$SEL$', sel || '내용') + ntBody.value.slice(epos);
    ntBody.focus(); ntCount(); ntSync();
  }
  function ntCount() { if (ntCharCount && ntBody) ntCharCount.textContent = ntBody.value.length + '자'; }
  document.querySelectorAll('[data-nt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.nt;
      if (t === 'strong') ntInsertAtCursor('**$SEL$**');
      else if (t === 'line') ntInsertAtCursor('\n────────────\n');
      else if (t === 'bullet') ntInsertAtCursor('\n• ');
    });
  });
  if (ntBody) { ntBody.addEventListener('input', ntCount); ntCount(); }

  if (document.getElementById('nt-title')) ntSync();

  // 리콜 등록
  var recallForm = document.getElementById('recall-form');
  if (recallForm) recallForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('recall-msg');
    var body = Object.fromEntries(new FormData(recallForm).entries());
    var res = await fetch('/admin/api/recalls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = '등록되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { var d = await res.json().catch(function(){return {};}); msg.className = 'form-msg err'; msg.textContent = '등록 실패: ' + (d.error || ''); }
  });

  // 삭제 / 상태변경 액션
  document.querySelectorAll('[data-action]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var action = btn.dataset.action;
      var id = btn.dataset.id;
      if (action.startsWith('delete')) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        var type = action.replace('delete-', '') + 's';
        var res = await fetch('/admin/api/' + type + '/' + id, { method: 'DELETE' });
        if (res.ok) location.reload();
      } else if (action === 'reservation-status') {
        var res = await fetch('/admin/api/reservations/' + id + '/status', { method: 'POST' });
        if (res.ok) location.reload();
      } else if (action === 'lead-status') {
        var res = await fetch('/admin/api/leads/' + id + '/status', { method: 'POST' });
        if (res.ok) location.reload();
      } else if (action === 'recall-status') {
        var res = await fetch('/admin/api/recalls/' + id + '/status', { method: 'POST' });
        if (res.ok) location.reload();
      } else if (action === 'edit-column') {
        var res = await fetch('/admin/api/columns/' + id);
        if (!res.ok) return alert('불러오기 실패');
        var d = await res.json();
        var f = document.getElementById('column-form');
        document.getElementById('col-edit-id').value = d.id;
        f.title.value = d.title || '';
        f.slug.value = d.slug || '';
        if (f.category) f.category.value = d.category || '';
        if (f.author) f.author.value = d.author || '';
        f.excerpt.value = d.excerpt || '';
        f.meta_description.value = d.meta_description || '';
        if (f.keywords) f.keywords.value = d.keywords || '';
        f.body.value = d.body || '';
        // contenteditable 에디터에 본문 로드 + figure 클릭 핸들러 재바인딩
        var ed = document.getElementById('col-editor');
        if (ed) {
          ed.innerHTML = d.body || '';
          ed.querySelectorAll('figure.col-fig').forEach(function (fig) {
            fig.setAttribute('contenteditable', 'false');
            fig.addEventListener('click', function (e) { e.stopPropagation(); if (typeof selectFigure === 'function') selectFigure(fig); });
          });
        }
        slugTouched = true;
        if (typeof metaCount === 'function') metaCount();
        if (typeof updateStats === 'function') updateStats();
        colEditMode(true);
        f.scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'edit-notice') {
        var res = await fetch('/admin/api/notices/' + id);
        if (!res.ok) return alert('불러오기 실패');
        var d = await res.json();
        var f = document.getElementById('notice-form');
        document.getElementById('notice-edit-id').value = d.id;
        f.title.value = d.title || '';
        f.body.value = d.body || '';
        f.is_pinned.checked = !!d.is_pinned;
        if (f.category) f.category.value = d.category || 'notice';
        if (f.show_popup) f.show_popup.checked = !!d.show_popup;
        if (f.popup_until) f.popup_until.value = d.popup_until || '';
        if (f.link_url) f.link_url.value = d.link_url || '';
        if (ntPopup && ntOpts) { ntOpts.style.opacity = ntPopup.checked ? '1' : '.5'; ntOpts.style.pointerEvents = ntPopup.checked ? 'auto' : 'none'; }
        ntSync();
        noticeEditMode(true);
        f.scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'edit-case') {
        var res = await fetch('/admin/api/cases/' + id);
        if (!res.ok) return alert('불러오기 실패');
        var d = await res.json();
        var f = document.getElementById('case-form');
        document.getElementById('case-edit-id').value = d.id;
        f.title.value = d.title || '';
        if (f.duration) f.duration.value = d.duration || '';
        if (f.category) f.category.value = d.category || '';
        if (f.doctor) f.doctor.value = d.doctor || '';
        if (f.age_group) f.age_group.value = d.age_group || '';
        if (f.gender) f.gender.value = d.gender || '여성';
        if (f.area) f.area.value = d.area || '';
        if (f.description) f.description.value = d.description || '';
        // 파일 input은 보안상 프리필 불가 → 비워두면 기존 이미지 유지(서버 처리)
        caseEditMode(true);
        f.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
