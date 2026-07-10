import { useState } from 'react';
import { X } from 'lucide-react';

const announcements = [
  "Free Delivery on Orders Above ₹999",
  "Buy 2 Get 1 Free — Limited Time!",
  "Cash on Delivery Available"
];

const messageString = announcements.join('\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0');

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-brand-primary text-white min-h-[40px] py-2 flex items-center relative overflow-hidden z-50">
      <div className="flex w-full overflow-hidden group">
        <div className="animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
          <span className="mx-4 text-sm font-medium pr-4">{messageString}</span>
          <span className="mx-4 text-sm font-medium pr-4">{messageString}</span>
        </div>
      </div>
      
      <div className="absolute right-0 top-0 bottom-0 px-2 bg-gradient-to-l from-brand-primary via-brand-primary to-transparent flex items-center justify-end w-16">
        <button 
          onClick={() => setIsVisible(false)}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors z-10 text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
