import React, { useState, useEffect } from 'react';
import { X, Settings, Check } from 'lucide-react';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const existing = localStorage.getItem('cookie-consent');
    if (!existing) {
      setShow(true);
    }
    
    // Listen for custom event to reopen preferences
    const handleReopen = () => {
      setShow(true);
      setShowPreferences(true);
      const current = localStorage.getItem('cookie-consent');
      if (current) {
        try {
          const parsed = JSON.parse(current);
          setAnalytics(parsed.analytics);
        } catch (e) {}
      }
    };
    
    window.addEventListener('open-cookie-preferences', handleReopen);
    return () => window.removeEventListener('open-cookie-preferences', handleReopen);
  }, []);

  const saveConsent = (acceptAnalytics: boolean) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: acceptAnalytics,
      decidedAt: new Date().toISOString()
    }));
    setShow(false);
    setShowPreferences(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-bg-elevated border border-border rounded-xl shadow-2xl p-4 pointer-events-auto">
        
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">We value your privacy</h3>
              <p className="text-xs text-text-muted">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 min-w-max">
              <button 
                onClick={() => setShowPreferences(true)}
                className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border rounded-lg"
              >
                Preferences
              </button>
              <button 
                onClick={() => saveConsent(false)}
                className="px-3 py-1.5 text-xs font-bold bg-bg-hover text-text-primary hover:bg-border rounded-lg transition-colors"
              >
                Reject Non-Essential
              </button>
              <button 
                onClick={() => saveConsent(true)}
                className="px-3 py-1.5 text-xs font-bold bg-brand-primary hover:bg-[#A01830] text-white rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Cookie Preferences</h3>
              <button onClick={() => setShowPreferences(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border">
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Essential Cookies</h4>
                  <p className="text-xs text-text-muted">These cookies are necessary for the website to function and cannot be switched off.</p>
                </div>
                <div className="flex items-center justify-center w-12 h-6 bg-brand-primary rounded-full opacity-50 cursor-not-allowed">
                  <div className="w-5 h-5 bg-white rounded-full transform translate-x-3 flex items-center justify-center">
                    <Check className="w-3 h-3 text-brand-primary" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border">
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Analytics & Performance</h4>
                  <p className="text-xs text-text-muted">These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
                </div>
                <button 
                  onClick={() => setAnalytics(!analytics)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${analytics ? 'bg-brand-primary' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center ${analytics ? 'transform translate-x-6' : ''}`}>
                    {analytics && <Check className="w-3 h-3 text-brand-primary" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-border pt-6">
              <button 
                onClick={() => saveConsent(analytics)}
                className="px-6 py-2 bg-brand-primary hover:bg-[#A01830] text-white font-bold rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
