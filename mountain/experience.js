(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const root = document.documentElement;
  const shell = $('#site-shell');
  const gate = $('#age-gate');
  const header = $('#nav');
  const menu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Browsing still works without storage. */ } }
  };
  let admitted = storage.get('spirits-age-confirmed') === 'yes';
  let userPaused = storage.get('mountain-motion-paused') === 'yes';
  let returnFocus = null;
  let frame = 0;
  let lastScroll = -1;
  const stage = $('#hero-stage');
  const experience = $('#experience');
  const can = $('#can-stage');
  const canImage = $('.hero-can');
  const fruit = $('.hero-fruit');
  const tingle = $('.hero-tingle');
  const intro = $('.hero-intro');
  const second = $('.hero-second');
  const blueLight = $('.light-blue');
  const motionButton = $('#motion-toggle');
  const sceneProgress = $('#scene-progress');
  const readingProgress = $('#reading-progress');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = v => v * v * (3 - 2 * v);
  const motionOff = () => reduced.matches || userPaused;

  function setMenu(open, restore = false) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    header.classList.toggle('menu-open', open);
    if (open) $('a', menu).focus();
    else if (restore) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
  document.addEventListener('click', e => { if (!menu.hidden && !header.contains(e.target) && !menu.contains(e.target)) setMenu(false); });
  document.addEventListener('focusin', e => { if (!menu.hidden && !header.contains(e.target) && !menu.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth > 760) setMenu(false); requestFrame(); }, { passive: true });

  function openDialog(dialog) {
    if (!admitted && dialog !== gate) return;
    setMenu(false);
    returnFocus = document.activeElement;
    shell.inert = true;
    document.body.classList.add('modal-open');
    dialog.showModal();
  }
  function afterClose(dialog) {
    if (dialog === $('#enquiry-dialog')) {
      $('#enquiry-form').reset();
      $('#enquiry-status').textContent = '';
      $('#enquiry-text').value = '';
      $('#copy-fallback').hidden = true;
    }
    shell.inert = !admitted;
    if (admitted) document.body.classList.remove('modal-open');
    if (returnFocus && returnFocus.isConnected && admitted) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }
  $$('dialog').forEach(dialog => dialog.addEventListener('close', () => afterClose(dialog)));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('[data-enquire]').forEach(button => button.addEventListener('click', () => openDialog($('#enquiry-dialog'))));
  $$('[data-privacy]').forEach(button => button.addEventListener('click', () => openDialog($('#privacy-dialog'))));
  gate.addEventListener('cancel', e => { if (!admitted) e.preventDefault(); });
  $('#gate-yes').addEventListener('click', () => {
    admitted = true;
    storage.set('spirits-age-confirmed', 'yes');
    gate.close();
    shell.inert = false;
    document.body.classList.remove('modal-open');
    $('#main').focus({ preventScroll: true });
    updateMotion();
    requestFrame();
  });
  $('#gate-no').addEventListener('click', () => {
    $('#age-actions').hidden = true;
    $('#age-denied').hidden = false;
    $('#age-denied').focus();
  });
  if (!admitted) openDialog(gate);

  function render() {
    frame = 0;
    if (document.hidden) return;
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 35);
    const pageRange = Math.max(1, root.scrollHeight - innerHeight);
    readingProgress.style.transform = `scaleX(${clamp(y / pageRange)})`;
    const travel = Math.max(1, experience.offsetHeight - stage.offsetHeight);
    const progress = clamp((y - experience.offsetTop) / travel);
    sceneProgress.style.transform = `scaleX(${Math.max(.05, progress)})`;
    if (motionOff() || !admitted) {
      can.style.transform = 'translateX(-50%)';
      canImage.style.transform = innerWidth <= 760 ? 'rotate(-12deg)' : 'rotate(-11deg)';
      fruit.style.transform = '';
      tingle.style.transform = '';
      fruit.style.opacity = '1';
      tingle.style.opacity = '1';
      intro.style.opacity = '1';
      intro.style.visibility = 'visible';
      second.style.opacity = '0';
      blueLight.style.opacity = '.6';
      lastScroll = y;
      return;
    }
    const p = smooth(progress);
    const mobile = innerWidth <= 760;
    const fade = 1 - clamp((progress - .12) / .42);
    fruit.style.transform = `translate3d(${-p * (mobile ? 30 : 95)}px,${-p * 25}px,0)`;
    tingle.style.transform = `translate3d(${p * (mobile ? 28 : 85)}px,${p * 20}px,0)`;
    fruit.style.opacity = String(fade);
    tingle.style.opacity = String(fade);
    intro.style.opacity = String(1 - clamp(progress / .45));
    intro.style.visibility = progress > .5 ? 'hidden' : 'visible';
    can.style.transform = `translateX(calc(-50% + ${p * (mobile ? 38 : innerWidth * .2)}px)) translateY(${-p * (mobile ? 4 : 16)}px) scale(${1 + p * .06})`;
    canImage.style.transform = `rotate(${-11 + p * 21}deg)`;
    second.style.opacity = String(clamp((progress - .32) / .33));
    second.style.transform = `translate3d(0,${(1 - p) * 22}px,0)`;
    blueLight.style.opacity = String(.6 + p * .4);
    lastScroll = y;
  }
  function requestFrame() { if (!frame) frame = requestAnimationFrame(render); }
  function updateMotion() {
    const off = motionOff();
    root.classList.toggle('motion-paused', off);
    root.classList.toggle('js-motion', !off);
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.innerHTML = off ? 'Motion off <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    motionButton.setAttribute('aria-label', off ? (reduced.matches ? 'Motion disabled by your system preference' : 'Enable motion') : 'Pause motion');
    motionButton.disabled = reduced.matches;
    requestFrame();
  }
  motionButton.addEventListener('click', () => { userPaused = !userPaused; storage.set('mountain-motion-paused', userPaused ? 'yes' : 'no'); updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  window.addEventListener('scroll', () => { if (lastScroll !== scrollY) requestFrame(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestFrame(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
    $$('.reveal').forEach(element => observer.observe(element));
  } else $$('.reveal').forEach(element => element.classList.add('visible'));
  $$('[data-view]').forEach(button => button.addEventListener('click', () => {
    $$('[data-view]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    $('#product-art').classList.toggle('detail-view', button.dataset.view === 'detail');
  }));
  $('#enquiry-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const text = `Mountain Fruit Tingle enquiry\n\nName: ${String(data.get('name')).trim()}\nEmail: ${String(data.get('email')).trim()}\nEnquiry type: ${data.get('type')}\n\n${String(data.get('message')).trim()}`;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $('#enquiry-status').textContent = 'Enquiry copied. Paste it into your message to the team. Nothing has been sent.';
      $('#copy-fallback').hidden = true;
    } catch {
      $('#enquiry-status').textContent = 'Copy the text below to share your enquiry. Nothing has been sent.';
      $('#copy-fallback').hidden = false;
      $('#enquiry-text').value = text;
      $('#enquiry-text').focus();
      $('#enquiry-text').select();
    }
  });
  $('#year').textContent = String(new Date().getFullYear());
  updateMotion();
  requestFrame();
})();
