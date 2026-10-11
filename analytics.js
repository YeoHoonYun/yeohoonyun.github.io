(() => {
  const measurementId = 'G-5SVSXQSKB9';
  const storageKey = 'yunicro-analytics-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  if (document.getElementById('support-form') || /^\/(admin|payment)(\/|$)/.test(location.pathname)) return;

  let choice;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && ['granted', 'denied'].includes(saved.choice) && Number.isFinite(saved.at) && Date.now() - saved.at >= 0 && Date.now() - saved.at < lifetime) choice = saved.choice;
  } catch {}
  let loaded = false;
  const region = document.createElement('section');
  region.className = 'analytics-consent';
  region.setAttribute('aria-labelledby', 'analytics-consent-title');
  const privacyUrl = document.querySelector('.business-footer a[href="/privacy/"]') ? '/privacy/' : '/privacy';
  region.innerHTML = `<div><h2 id="analytics-consent-title">방문 분석 동의</h2><p>허용하면 Google Analytics가 쿠키로 방문 현황을 분석합니다. 거부해도 사이트를 이용할 수 있습니다. <a href="${privacyUrl}">개인정보처리방침</a></p></div><div class="analytics-actions"><button type="button" data-analytics-choice="denied">거부</button><button type="button" data-analytics-choice="granted">허용</button></div>`;
  region.hidden = Boolean(choice);
  const header = document.querySelector('header');
  if (header) header.after(region); else document.body.prepend(region);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = '방문 분석 설정';
  settings.addEventListener('click', () => {
    region.hidden = false;
    region.scrollIntoView({ block: 'center' });
    region.querySelector('button').focus({ preventScroll: true });
  });
  document.querySelector('.business-footer nav')?.append(settings);

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch {}
    const page = { page_location: location.origin + location.pathname, page_referrer: referrer, page_title: document.title };
    window.gtag('config', measurementId, { ...page, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_expires: lifetime / 1000 });
    window.gtag('event', 'page_view', { ...page, send_to: measurementId });
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }
  region.addEventListener('click', event => {
    const button = event.target.closest('[data-analytics-choice]');
    if (!button) return;
    choice = button.dataset.analyticsChoice;
    try { localStorage.setItem(storageKey, JSON.stringify({ choice, at: Date.now() })); } catch {}
    region.hidden = true;
    if (choice === 'granted') return loadAnalytics();
    window[`ga-disable-${measurementId}`] = true;
    for (const name of ['_ga', `_ga_${measurementId.slice(2)}`]) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    // Reload removes an already loaded tag and its automatic event listeners.
    if (loaded) location.reload();
  });
  if (choice === 'granted') loadAnalytics();
})();
