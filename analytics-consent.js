(function () {
  const STORAGE_KEY = 'siteConsentV1';
  const DEFAULT_MEASUREMENT_ID = 'G-XXXXXXX';
  const metaMeasurement = document.querySelector('meta[name="ga-measurement-id"]')?.getAttribute('content') || '';
  const measurementId = (window.GA_MEASUREMENT_ID || metaMeasurement || DEFAULT_MEASUREMENT_ID).trim();

  function hasValidMeasurementId() {
    return /^G-[A-Z0-9]+$/i.test(measurementId) && measurementId !== DEFAULT_MEASUREMENT_ID;
  }

  function loadAnalytics() {
    if (!hasValidMeasurementId() || window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }

  function getConsent() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  window.trackEvent = function (eventName, data) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, Object.assign({
        page_path: location.pathname
      }, data || {}));
    }
  };

  function createBanner(forceOpen = false) {
    const consent = getConsent();
    if (consent && !forceOpen) return;
    const existing = document.querySelector('.consent-banner');
    if (existing) existing.remove();

    const banner = document.createElement('aside');
    banner.className = 'consent-banner';
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <p>사이트 개선을 위해 익명 방문 통계를 수집할 수 있습니다. 동의하시겠어요?</p>
      <div class="consent-actions">
        <button type="button" id="consentAccept" class="primary">동의</button>
        <button type="button" id="consentReject">거부</button>
      </div>
    `;
    document.body.appendChild(banner);

    banner.querySelector('#consentAccept')?.addEventListener('click', function () {
      setConsent('granted');
      loadAnalytics();
      banner.remove();
    });

    banner.querySelector('#consentReject')?.addEventListener('click', function () {
      setConsent('denied');
      banner.remove();
    });
  }

  window.openConsentSettings = function () {
    createBanner(true);
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (getConsent() === 'granted') {
      loadAnalytics();
    }
    createBanner();
  });
})();
