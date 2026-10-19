/* Estate engine client — the site stays hand-built; the facts come from the engine.
   Every unconfirmed fact carries data-fill="<path>". When the engine has a value it replaces
   the marker. When it does not:
     · guests (public mode) never see a bracketed gap — the element is hidden, a published
       fallback is used where one exists (data-fb-en / data-fb-pt), and on the legal pages
       the gap reads "to be confirmed" so a sentence never silently loses its subject;
     · the team (preview mode: ?preview=1, or this browser has opened the admin panel)
       still sees every gap in amber, because an unfilled fact must never look finished. */
(function () {
  var API = 'https://malhao-pay.edenrise.workers.dev';

  function get(obj, path) {
    return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, obj);
  }
  /* Values may be plain, or {pt:…, en:…} for anything a guest reads. */
  function pick(v, lang) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] || v.pt || v.en || '';
    return v;
  }

  var PREVIEW = /[?&]preview=1\b/.test(location.search) ||
    (function () { try { return !!localStorage.getItem('mp-admin-key'); } catch (_) { return false; } })();
  var LEGAL = /(termos|terms|privacidade)(\.html)?$/.test(location.pathname);
  if (!PREVIEW) document.documentElement.classList.add('public');
  if (LEGAL) document.documentElement.classList.add('legal');
  (function () {
    var css = 'html.public [data-fill]:not([data-filled]){display:none!important}' +
      'html.public.legal [data-fill]:not([data-filled]){display:inline!important;background:none!important;' +
      'border:0!important;color:inherit!important;font:inherit!important;letter-spacing:inherit!important;' +
      'text-transform:none!important;padding:0!important;font-style:italic!important}' +
      'html.public [data-pubhide]{display:none!important}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();

  function lang() { return document.documentElement.lang || 'en'; }

  /* Public mode: give unfilled facts their quiet form, and hide containers left empty. */
  function settle() {
    if (PREVIEW) {   /* the shipped HTML carries no placeholder text; label each open gap for the team */
      document.querySelectorAll('[data-fill]:not([data-filled])').forEach(function (el) {
        if (!el.textContent.trim() || /^(a confirmar|to be confirmed)$/.test(el.textContent.trim())) el.textContent = '[' + el.getAttribute('data-fill') + ']';
        el.classList.add('ph');
      });
      return;
    }
    var pt = lang() === 'pt';
    document.querySelectorAll('[data-fill]:not([data-filled])').forEach(function (el) {
      var fb = el.getAttribute(pt ? 'data-fb-pt' : 'data-fb-en');
      if (fb) { el.textContent = fb; el.classList.remove('ph'); el.setAttribute('data-filled', 'fb'); return; }
      if (LEGAL) { el.textContent = pt ? 'a confirmar' : 'to be confirmed'; return; }
      var host = el.parentElement;   // a list item or line that held only this fact goes too
      if (host && /^(LI|DD)$/.test(host.tagName) && host.textContent.trim() === el.textContent.trim())
        host.setAttribute('data-pubhide', '');
    });
  }

  function fill(content) {
    var l = lang(), n = 0;
    if (content) document.querySelectorAll('[data-fill]').forEach(function (el) {
      var v = pick(get(content, el.getAttribute('data-fill')), l);
      if (v === undefined || v === null || v === '') return;   // leave the gap for settle()
      el.textContent = String(v);
      el.classList.remove('ph');
      el.setAttribute('data-filled', '1');
      var host = el.parentElement; if (host) host.removeAttribute('data-pubhide');
      n++;
    });
    /* the "write to us" line only stands in while no direct contact is published */
    var hasContact = content && content.contact && (content.contact.email || content.contact.phone);
    document.querySelectorAll('[data-nocontact]').forEach(function (li) { li.hidden = !!hasContact; });
    settle();
    return n;
  }

  /* language switches re-run the quiet forms in the new language */
  new MutationObserver(function () {
    document.querySelectorAll('[data-filled="fb"]').forEach(function (el) { el.removeAttribute('data-filled'); });
    fill(window.__content);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.__fill = fill;
  fetch(API + '/content')
    .then(function (r) { return r.json(); })
    .then(function (c) { window.__content = c; fill(c); try { document.dispatchEvent(new CustomEvent('estate:content')); } catch (_) {} })
    .catch(function () { settle(); /* engine unreachable → the site still renders cleanly */ });

  /* Cookieless beat: a path, a language, a referrer host. No identifier, nothing stored
     in the browser, nothing to consent to. */
  try {
    var body = JSON.stringify({
      path: location.pathname.replace(/\/+$/, '') || '/',
      lang: document.documentElement.lang || '',
      ref: document.referrer || '', event: 'view'
    });
    addEventListener('load', function () {
      if (navigator.sendBeacon) navigator.sendBeacon(API + '/beat', new Blob([body], { type: 'text/plain' }));
      else fetch(API + '/beat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    });
  } catch (_) {}
})();
