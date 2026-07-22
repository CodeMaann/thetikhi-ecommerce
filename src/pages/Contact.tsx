import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">Get in Touch</h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Have questions about your order, our ingredients, or wholesale inquiries? Drop us a line.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-bg-surface p-8 rounded-3xl border border-border space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold mb-1">Our Kitchen</h3>
                  <p className="text-text-muted text-sm">D-14, 3rd Floor, Fateh Nagar,<br/>New Delhi-110018</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold mb-1">Call Us</h3>
                  <p className="text-text-muted text-sm">+91 88267 06250<br/>CC: +91 8178823391</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold mb-1">Email</h3>
                  <p className="text-text-muted text-sm">support@thetikhi.com</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#25D366]/20 to-transparent p-6 rounded-2xl border border-[#25D366]/30 flex items-center justify-between">
               <div>
                 <h4 className="text-text-primary font-bold">Chat with us</h4>
                 <p className="text-[#25D366] text-sm">We're on WhatsApp!</p>
               </div>
               <a href="https://wa.me/918178823991?text=Hi%2C%20I%20have%20a%20question%20about%20The%20Tikhi%20products." target="_blank" rel="noreferrer" className="px-6 py-2 bg-[#25D366] text-black font-bold rounded-full hover:scale-105 transition-transform inline-block">
                 Connect
               </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-bg-surface p-8 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name"
                  required
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Your Email"
                  required
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <textarea 
                  rows={4}
                  placeholder="Your Message"
                  required
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {sent ? "Message Sent!" : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
