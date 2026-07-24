import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { safeFetch } from '../lib/api';

interface PromoData {
  enabled: boolean;
  imageUrl: string;
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

export function PromoPopup() {
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if already seen this session
    if (sessionStorage.getItem('promo-popup-seen')) {
      return;
    }

    safeFetch('/api/settings/promo_popup')
      .then(data => {
        if (data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (parsed.enabled) {
              setPromo(parsed);
              setShow(true);
            }
          } catch (e) {
            console.error('Failed to parse promo popup data:', e);
          }
        }
      })
      .catch(err => console.error('Failed to load promo popup setting:', err));
  }, []);

  const closePopup = () => {
    sessionStorage.setItem('promo-popup-seen', 'true');
    setShow(false);
  };

  if (!show || !promo) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-bg-elevated border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        {promo.imageUrl && (
          <div className="w-full aspect-square bg-bg-surface">
            <img 
              src={promo.imageUrl} 
              alt={promo.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8 text-center space-y-4">
          {promo.title && (
            <h3 className="text-2xl font-bold text-text-primary leading-tight">
              {promo.title}
            </h3>
          )}
          {promo.text && (
            <p className="text-text-muted text-sm md:text-base">
              {promo.text}
            </p>
          )}
          
          {promo.buttonText && promo.buttonLink && (
            <a 
              href={promo.buttonLink}
              onClick={closePopup}
              className="inline-block w-full py-4 px-6 mt-2 bg-brand-primary hover:bg-[#A01830] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {promo.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
