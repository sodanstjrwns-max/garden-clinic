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

  // 케이스 등록 (multipart)
  var caseForm = document.getElementById('case-form');
  if (caseForm) caseForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('case-msg');
    var fd = new FormData(caseForm);
    var res = await fetch('/admin/api/cases', { method: 'POST', body: fd });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = '등록되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { var d = await res.json().catch(function(){return {};}); msg.className = 'form-msg err'; msg.textContent = '등록 실패: ' + (d.error || ''); }
  });

  // 칼럼 등록/수정 (multipart: 썸네일 포함)
  var colForm = document.getElementById('column-form');
  if (colForm) colForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('column-msg');
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
  if (colCancel) colCancel.addEventListener('click', function () { colForm.reset(); colEditMode(false); });

  // —— SEO 에디터: H태그 툴바 + 이미지 삽입(파일 선택/드래그&드롭) ——
  var colBody = document.getElementById('col-body');
  function insertAtCursor(textarea, text) {
    var s = textarea.selectionStart, epos = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, s) + text + textarea.value.slice(epos);
    textarea.selectionStart = textarea.selectionEnd = s + text.length;
    textarea.focus();
  }
  function wrapSelection(textarea, before, after) {
    var s = textarea.selectionStart, epos = textarea.selectionEnd;
    var sel = textarea.value.slice(s, epos) || '내용';
    textarea.value = textarea.value.slice(0, s) + before + sel + after + textarea.value.slice(epos);
    textarea.selectionStart = s + before.length;
    textarea.selectionEnd = s + before.length + sel.length;
    textarea.focus();
  }
  var toolbar = document.getElementById('col-toolbar');
  if (toolbar && colBody) {
    toolbar.querySelectorAll('[data-md]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.dataset.md;
        if (t === 'h2') wrapSelection(colBody, '\n<h2>', '</h2>\n');
        else if (t === 'h3') wrapSelection(colBody, '\n<h3>', '</h3>\n');
        else if (t === 'p') wrapSelection(colBody, '\n<p>', '</p>\n');
        else if (t === 'strong') wrapSelection(colBody, '<strong>', '</strong>');
        else if (t === 'ul') insertAtCursor(colBody, '\n<ul>\n  <li>항목 1</li>\n  <li>항목 2</li>\n</ul>\n');
        else if (t === 'quote') wrapSelection(colBody, '\n<blockquote>', '</blockquote>\n');
      });
    });
  }
  async function uploadAndInsert(files) {
    if (!colBody) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f.type || f.type.indexOf('image/') !== 0) continue;
      var fd = new FormData();
      fd.append('image', f);
      insertAtCursor(colBody, '\n<!-- 이미지 업로드 중… -->');
      try {
        var res = await fetch('/admin/api/upload-image', { method: 'POST', body: fd });
        var d = await res.json();
        colBody.value = colBody.value.replace('<!-- 이미지 업로드 중… -->',
          res.ok && d.url ? '<img src="' + d.url + '" alt="" loading="lazy" />' : '<!-- 업로드 실패 -->');
      } catch (e) {
        colBody.value = colBody.value.replace('<!-- 이미지 업로드 중… -->', '<!-- 업로드 실패 -->');
      }
    }
  }
  var imgBtn = document.getElementById('col-img-btn');
  var imgInput = document.getElementById('col-img-input');
  if (imgBtn && imgInput) {
    imgBtn.addEventListener('click', function () { imgInput.click(); });
    imgInput.addEventListener('change', function () { uploadAndInsert(imgInput.files); imgInput.value = ''; });
  }
  if (colBody) {
    var hint = document.getElementById('col-drop-hint');
    ['dragenter', 'dragover'].forEach(function (ev) {
      colBody.addEventListener(ev, function (e) { e.preventDefault(); if (hint) hint.classList.add('active'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      colBody.addEventListener(ev, function (e) { e.preventDefault(); if (hint) hint.classList.remove('active'); });
    });
    colBody.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) uploadAndInsert(e.dataTransfer.files);
    });
  }

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
  if (noticeCancel) noticeCancel.addEventListener('click', function () { noticeForm.reset(); noticeEditMode(false); });

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
        f.body.value = d.body || '';
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
        noticeEditMode(true);
        f.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
