(() => {
  const measurementId = 'G-5SVSXQSKB9';
  const storageKey = 'yunicro-privacy-consent-v2';
  const legacyKey = 'yunicro-analytics-consent-v1';
  const publisherId = 'ca-pub-9061090682937413';
  const adsEnabled = document.querySelector('meta[name="yunicro-ads"]')?.content === 'enabled';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  if (document.getElementById('support-form') || /^\/(admin|payment)(\/|$)/.test(location.pathname)) return;

  let choice;
  let legacyChoice;
  const fresh = saved => saved && Number.isFinite(saved.at) && Date.now() - saved.at >= 0 && Date.now() - saved.at < lifetime;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (fresh(saved) && typeof saved.analytics === 'boolean' && typeof saved.ads === 'boolean') choice = saved;
    const legacy = JSON.parse(localStorage.getItem(legacyKey));
    if (!choice && fresh(legacy) && ['granted', 'denied'].includes(legacy.choice)) legacyChoice = legacy.choice;
  } catch {}
  let loaded = false;
  let adsLoaded = false;
  const region = document.createElement('section');
  region.className = 'analytics-consent';
  region.setAttribute('aria-labelledby', 'analytics-consent-title');
  const privacyUrl = document.querySelector('.business-footer a[href="/privacy/"]') ? '/privacy/' : '/privacy';
  region.innerHTML = `<div><h2 id="analytics-consent-title">${adsEnabled ? '분석·광고 선택' : '방문 분석 동의'}</h2><p>거부해도 사이트를 이용할 수 있습니다. <a href="${privacyUrl}">개인정보처리방침</a></p><div class="privacy-options"><label><input type="checkbox" name="analytics"> 방문 분석 (Google Analytics)</label>${adsEnabled ? '<label><input type="checkbox" name="ads"> 비개인화 광고 (Google AdSense)</label><p>광고 표시·횟수 제한·성과 집계에 쿠키와 접속 정보가 사용됩니다.</p>' : ''}</div></div><div class="analytics-actions"><button type="button" data-analytics-choice="denied">모두 거부</button><button type="button" data-analytics-choice="granted">선택 저장</button></div>`;
  const analyticsInput = region.querySelector('[name="analytics"]');
  const adsInput = region.querySelector('[name="ads"]');
  function syncInputs() {
    analyticsInput.checked = choice?.analytics ?? legacyChoice === 'granted';
    if (adsInput) adsInput.checked = choice?.ads ?? false;
  }
  syncInputs();
  region.hidden = Boolean(choice);
  const header = document.querySelector('header');
  if (header) header.after(region); else document.body.prepend(region);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = adsEnabled ? '분석·광고 설정' : '방문 분석 설정';
  settings.addEventListener('click', () => {
    syncInputs();
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
  function loadAds() {
    if (!adsEnabled || adsLoaded) return;
    adsLoaded = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = 1;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.privacyTreatments = 'disablePersonalization';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    document.head.append(script);
  }
  region.addEventListener('click', event => {
    const button = event.target.closest('[data-analytics-choice]');
    if (!button) return;
    const rejected = button.dataset.analyticsChoice === 'denied';
    choice = { analytics: !rejected && analyticsInput.checked, ads: rejected ? false : adsInput ? adsInput.checked : Boolean(choice?.ads), at: Date.now() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(choice));
      localStorage.removeItem(legacyKey);
    } catch {}
    region.hidden = true;
    if (!choice.analytics) {
      window[`ga-disable-${measurementId}`] = true;
      for (const name of ['_ga', `_ga_${measurementId.slice(2)}`]) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
    if (!choice.ads && adsLoaded) window.adsbygoogle.pauseAdRequests = 1;
    // Reload removes already loaded tags, ads and their event listeners on revocation.
    if ((loaded && !choice.analytics) || (adsLoaded && !choice.ads)) return location.reload();
    if (choice.analytics) loadAnalytics();
    if (choice.ads) loadAds();
  });
  if (choice?.analytics || (!choice && legacyChoice === 'granted')) loadAnalytics();
  if (choice?.ads) loadAds();
})();
