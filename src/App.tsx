import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Story } from './pages/Story';
import { Recipes } from './pages/Recipes';
import { Contact } from './pages/Contact';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { OrderTracking } from './pages/OrderTracking';
import { Receipt } from './pages/Receipt';
import { MyOrders } from './pages/MyOrders';
import { TermsOfService } from './pages/TermsOfService';
import { RefundPolicy } from './pages/RefundPolicy';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { trackPageView } from './lib/analytics';
import { CookieConsent } from './components/CookieConsent';
import { PromoPopup } from './components/PromoPopup';
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './lib/useTheme';
import { safeFetch } from './lib/api';

import { ScrollToTop } from './components/ScrollToTop';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

function AnimatedRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - framer-motion requires key on Routes, but RRv6 types don't include it */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/story" element={<PageTransition><Story /></PageTransition>} />
        <Route path="/recipes" element={<PageTransition><Recipes /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/admin/*" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/track-order/:orderId?" element={<PageTransition><OrderTracking /></PageTransition>} />
        <Route path="/receipt/:orderId" element={<PageTransition><Receipt /></PageTransition>} />
        <Route path="/my-orders" element={<PageTransition><MyOrders /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/refund-policy" element={<PageTransition><RefundPolicy /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/shipping-policy" element={<PageTransition><ShippingPolicy /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function FloatingWhatsApp() {
  return (
    <a 
      href="https://wa.me/918178823991?text=Hi%2C%20I%20have%20a%20question%20about%20The%20Tikhi%20products." 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50"
    >
      <FaWhatsapp size={32} />
    </a>
  );
}

export default function App() {
  const { token, login, logout } = useStore();

  useEffect(() => {
    safeFetch('/api/settings/meta-pixel')
      .then(data => {
        if (data.value) {
          // Note: When a cookie consent state is available, wrap this logic to require consent first.
          const value = data.value.trim();
          
          if (/^\d+$/.test(value)) {
            // It's a raw numeric ID, inject standard fbq init
            (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            // @ts-ignore
            fbq('init', value);
            // @ts-ignore
            fbq('track', 'PageView');
          } else if (value.includes('<script')) {
            // It's a full script snippet, inject as-is
            // We create a temporary element to parse the script tag(s)
            const wrapper = document.createElement('div');
            wrapper.innerHTML = value;
            const scripts = wrapper.querySelectorAll('script');
            scripts.forEach(script => {
              const newScript = document.createElement('script');
              if (script.src) {
                newScript.src = script.src;
                newScript.async = true;
              } else {
                newScript.textContent = script.textContent;
              }
              document.head.appendChild(newScript);
            });
            // Also inject any noscript tags
            const noscripts = wrapper.querySelectorAll('noscript');
            noscripts.forEach(noscript => {
              document.head.appendChild(noscript.cloneNode(true));
            });
          }
        }
      })
      .catch(err => console.error('Failed to load Meta Pixel setting:', err));
  }, []);

  useEffect(() => {
    if (token) {
      safeFetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(data => {
        login(data.user, token);
      })
      .catch(() => {
        logout();
      });
    }
  }, [token, login, logout]);

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" />
        <CookieConsent />
        <PromoPopup />
        <div className="flex flex-col min-h-screen bg-bg-base text-white text-text-primary font-sans selection:bg-brand-primary selection:text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
        
        <FloatingWhatsApp />
      </div>
    </Router>
    </ThemeProvider>
  );
}
