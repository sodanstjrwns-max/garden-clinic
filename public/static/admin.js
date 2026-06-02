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

  // 칼럼 등록
  var colForm = document.getElementById('column-form');
  if (colForm) colForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('column-msg');
    var body = Object.fromEntries(new FormData(colForm).entries());
    var res = await fetch('/admin/api/columns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = '발행되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { var d = await res.json().catch(function(){return {};}); msg.className = 'form-msg err'; msg.textContent = '발행 실패: ' + (d.error || ''); }
  });

  // 공지 등록
  var noticeForm = document.getElementById('notice-form');
  if (noticeForm) noticeForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('notice-msg');
    var fd = new FormData(noticeForm);
    var body = { title: fd.get('title'), body: fd.get('body'), is_pinned: fd.get('is_pinned') ? 1 : 0 };
    var res = await fetch('/admin/api/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = '등록되었습니다.'; setTimeout(function () { location.reload(); }, 800); }
    else { msg.className = 'form-msg err'; msg.textContent = '등록 실패'; }
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
      }
    });
  });
})();
