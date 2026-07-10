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
import { MessageCircle } from 'lucide-react';
import { trackPageView } from './lib/analytics';
import { CookieConsent } from './components/CookieConsent';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './lib/useTheme';
import { safeFetch } from './lib/api';

import { ScrollToTop } from './components/ScrollToTop';

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

export default function App() {
  const { token, login, logout } = useStore();

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
        <div className="flex flex-col min-h-screen bg-bg-base text-white text-text-primary font-sans selection:bg-brand-primary selection:text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
        
        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/918178823991" 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50"
        >
          <MessageCircle className="w-8 h-8" />
        </a>
      </div>
    </Router>
    </ThemeProvider>
  );
}
