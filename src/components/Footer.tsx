import { Placeholder } from "../components/Placeholder";
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-bg-base border-t border-border pt-16 pb-8 text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
             <img
  src="/logoo.png"
  alt="The Tikhi Logo"
  className="h-20 w-auto"
/>
            </div>
            <p className="text-sm">
              It's All About Indian Spices. Bringing you the authentic "Maa Ke Haath Ka Swaad" right to your table.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-text-primary transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-text-primary transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-text-primary transition"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-brand-accent transition">Shop Now</Link></li>
              <li><Link to="/story" className="hover:text-brand-accent transition">Our Story</Link></li>
              <li><Link to="/recipes" className="hover:text-brand-accent transition">Recipes</Link></li>
              <li><Link to="/track-order" className="hover:text-brand-accent transition">Track Order</Link></li>
              <li><Link to="/my-orders" className="hover:text-brand-accent transition">My Orders</Link></li>
              <li><Link to="/contact" className="hover:text-brand-accent transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-accent transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-accent transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-accent transition">Refund Policy</a></li>
              <li><a href="#" className="hover:text-brand-accent transition">Shipping Policy</a></li>
              <li><button onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))} className="hover:text-brand-accent transition text-left">Cookie Preferences</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-sm">
            <h4 className="text-text-primary font-bold mb-4">Contact Us</h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
              <span>D-14, 3rd Floor, Fateh Nagar, New Delhi-110018</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-primary shrink-0" />
              <span>+91 88267 06250 <br/> CC: +91 8178823391</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-primary shrink-0" />
              <span>support@thetikhi.com</span>
            </div>
            <div className="pt-2">
               <span className="inline-block px-3 py-1 bg-bg-hover border border-border rounded-full text-xs font-mono text-[#D4A017]">
                 FSSAI: 133259988000037
               </span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <p className="text-center md:text-left mb-4 md:mb-0">&copy; {new Date().getFullYear()} The Tikhi. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 md:mt-0">
             <span>100% Natural</span>
             <span className="hidden sm:inline">•</span>
             <span>No Preservatives</span>
             <span className="hidden sm:inline">•</span>
             <span>Pan India Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
