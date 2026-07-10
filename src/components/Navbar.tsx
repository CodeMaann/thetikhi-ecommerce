import { Placeholder } from "../components/Placeholder";
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Moon, Sun, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import { useStore } from '../store/useStore';
import { CartDrawer } from './CartDrawer';
import { cn } from '../lib/utils';
import { AnnouncementBar } from './AnnouncementBar';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [forgotPasswordStep, setForgotPasswordStep] = useState<0 | 1 | 2>(0);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout, cart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Our Story', path: '/story' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'Contact', path: '/contact' },
    { name: 'Track Order', path: '/track-order' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignUp ? { name, email, password } : { email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      login(data.user, data.token);
      toast.success(isSignUp ? 'Account created!' : 'Logged in successfully');
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setIsOpen(false);
    navigate('/');
    toast.success('Logged out');
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
      
      toast.success(data.message);
      setForgotPasswordStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      toast.success('Password updated! Please log in.');
      setForgotPasswordStep(0);
      setIsSignUp(false);
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="sticky top-0 z-40 w-full bg-bg-base/95 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
           <div className="flex-shrink-0 flex items-center">
  <Link to="/" className="flex items-center">
    <img
      src="logoo.png"
      alt="The Tikhi"
      className="h-16 w-auto object-contain"
    />
  </Link>
</div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8 items-center">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-bold transition-colors hover:text-brand-primary relative whitespace-nowrap py-2",
                    location.pathname === link.path ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.span 
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" 
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="text-text-muted hover:text-brand-primary transition-colors w-11 h-11 flex items-center justify-center"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button 
                  onClick={() => user ? setShowUserDropdown(!showUserDropdown) : setShowLoginModal(true)}
                  className="text-text-secondary hover:text-brand-primary transition-colors w-11 h-11 flex items-center justify-center gap-2"
                  title="Account"
                >
                  <UserIcon className="w-5 h-5" />
                  {user && <span className="text-sm font-medium hidden md:block">{user.name}</span>}
                </button>

                {showUserDropdown && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm text-text-muted">Signed in as</p>
                      <p className="font-bold text-text-primary truncate">{user.name}</p>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    )}
                    
                    <Link to="/my-orders" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-bg-hover transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-text-secondary hover:text-brand-accent transition-colors w-11 h-11 flex items-center justify-center"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-primary rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <Link to="/shop" className="hidden sm:inline-flex bg-gradient-to-r from-brand-primary to-brand-accent text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:scale-105 transition-transform whitespace-nowrap">
                Order Now
              </Link>

              <button
                className="lg:hidden text-text-secondary hover:text-text-primary w-11 h-11 flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Menu (Slide-in drawer style) */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden border-l border-border flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-bold text-text-primary">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary w-11 h-11 flex items-center justify-center -mr-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col space-y-1 px-3 mb-4">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                  location.pathname === link.path ? "text-brand-primary bg-bg-elevated border border-border" : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="px-3 border-t border-border pt-4">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Account</p>
            {!user ? (
              <>
                <button onClick={() => { setIsOpen(false); setShowLoginModal(true); }} className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Login
                </button>
                <Link to="/my-orders" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  My Orders
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm text-text-muted">Signed in as</p>
                  <p className="font-bold text-text-primary truncate">{user.name}</p>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                    Dashboard
                  </Link>
                )}
                <Link to="/my-orders" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  My Orders
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-bg-elevated transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <Link to="/shop" onClick={() => setIsOpen(false)} className="w-full flex justify-center bg-gradient-to-r from-brand-primary to-brand-accent text-white px-5 py-3 rounded-xl font-bold text-sm">
            Order Now
          </Link>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-elevated border border-border rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setShowLoginModal(false); setForgotPasswordStep(0); }} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {forgotPasswordStep === 1 ? 'Reset Password' : forgotPasswordStep === 2 ? 'Enter Code' : (isSignUp ? 'Create Account' : 'Login')}
            </h2>
            
            {forgotPasswordStep === 0 ? (
              <>
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                        placeholder="Your Name"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1 flex justify-between">
                      <span>Password</span>
                      {!isSignUp && (
                        <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-brand-primary hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors mt-2 disabled:opacity-50">
                    {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </>
            ) : forgotPasswordStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-text-muted mb-4">Enter your email address and we'll send you a 6-digit reset code.</p>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                    placeholder="you@email.com"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors mt-2 disabled:opacity-50">
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <div className="mt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordStep(0)}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-text-muted mb-4">We've sent a 6-digit code to <strong>{email}</strong>.</p>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Reset Code</label>
                  <input 
                    type="text" 
                    required
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary tracking-widest" 
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary" 
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors mt-2 disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </button>
                <div className="mt-4 text-center space-y-2 flex flex-col">
                  <button 
                    type="button"
                    onClick={() => handleForgotPassword()}
                    disabled={isLoading}
                    className="text-sm text-brand-primary hover:underline transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordStep(0)}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
