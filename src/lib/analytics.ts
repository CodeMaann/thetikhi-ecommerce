export function trackEvent(name: string, payload?: any) {
  const consent = localStorage.getItem('cookie-consent');
  if (consent) {
    try {
      const { analytics } = JSON.parse(consent);
      if (analytics) {
        console.log(`[Analytics Event]: ${name}`, payload || '');
        // TODO: Wire up actual vendor SDK here (e.g. mixpanel.track, fbq, gtag)
      }
    } catch (e) {
      // Ignore parse error
    }
  }
}

export function trackPageView(path: string) {
  const consent = localStorage.getItem('cookie-consent');
  if (consent) {
    try {
      const { analytics } = JSON.parse(consent);
      if (analytics) {
        console.log(`[Analytics PageView]: ${path}`);
        // TODO: Wire up actual vendor SDK here
      }
    } catch (e) {
      // Ignore parse error
    }
  }
}
