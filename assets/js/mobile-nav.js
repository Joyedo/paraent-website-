/* =====================================================
   PARAENT — 모바일 네비게이션 (햄버거 메뉴)
   모든 페이지 공유
===================================================== */
(function () {
  'use strict';

  var nav = document.querySelector('.nav') || document.querySelector('.global-nav');
  if (!nav) return;

  var navInner = nav.querySelector('.nav-inner');
  if (!navInner) return;

  /* ── 햄버거 버튼 생성 ── */
  var hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', '메뉴 열기');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  navInner.appendChild(hamburger);

  /* ── 모바일 메뉴 생성 ── */
  var mobileMenu = document.createElement('nav');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.setAttribute('aria-label', '모바일 메뉴');
  mobileMenu.setAttribute('aria-hidden', 'true');

  /* nav-menu 아이템 읽기 (index: li / pages: .nav-item) */
  var navMenu = navInner.querySelector('.nav-menu');
  if (navMenu) {
    var items = navMenu.querySelectorAll('.nav-item, li');
    items.forEach(function (item) {
      /* 링크 요소 찾기 */
      var link = item.querySelector('.nav-link') || item.querySelector(':scope > a');
      var dropdown = item.querySelector('.nav-dropdown');
      if (!link) return;

      /* 텍스트만 추출 (SVG 제외) */
      var text = '';
      link.childNodes.forEach(function (node) {
        if (node.nodeType === 3) text += node.textContent.trim();
      });
      if (!text) text = link.textContent.replace(/[▾▴]/g, '').trim();

      var menuItem = document.createElement('div');
      menuItem.className = 'mobile-menu-item';

      if (dropdown) {
        /* 드롭다운 있는 항목 */
        var btn = document.createElement('button');
        btn.className = 'mobile-menu-link';
        btn.innerHTML =
          '<span>' + text + '</span>' +
          '<svg width="12" height="7" viewBox="0 0 12 7" fill="none">' +
          '<path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>';
        btn.setAttribute('aria-expanded', 'false');

        var subMenu = document.createElement('div');
        subMenu.className = 'mobile-sub-menu';

        dropdown.querySelectorAll('a').forEach(function (a) {
          var clone = document.createElement('a');
          clone.href = a.href;
          clone.textContent = a.textContent.trim();
          if (a.classList.contains('active')) clone.classList.add('active');
          subMenu.appendChild(clone);
        });

        btn.addEventListener('click', function () {
          var isOpen = menuItem.classList.toggle('open');
          btn.setAttribute('aria-expanded', String(isOpen));
        });

        menuItem.appendChild(btn);
        menuItem.appendChild(subMenu);
      } else {
        /* 단순 링크 항목 */
        var a = document.createElement('a');
        a.className = 'mobile-menu-link';
        a.href = link.getAttribute('href') || '#';
        a.innerHTML = '<span>' + text + '</span>';
        menuItem.appendChild(a);
      }

      mobileMenu.appendChild(menuItem);
    });
  }

  /* 문의 CTA 버튼 */
  var ctaArea = document.createElement('div');
  ctaArea.className = 'mobile-menu-cta';
  var navRight = navInner.querySelector('.nav-right');
  var inquiryAnchor = navRight ? navRight.querySelector('a') : null;
  var ctaBtn = document.createElement('a');
  ctaBtn.className = 'mobile-cta-btn';
  ctaBtn.href = inquiryAnchor ? inquiryAnchor.href : '#';
  ctaBtn.textContent = '온라인 문의';
  ctaArea.appendChild(ctaBtn);
  mobileMenu.appendChild(ctaArea);

  /* body 바로 다음에 메뉴 삽입 */
  document.body.insertAdjacentElement('afterbegin', mobileMenu);

  /* ── 열기/닫기 ── */
  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', '메뉴 닫기');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '메뉴 열기');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', function (e) {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

})();
