import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const announcements = [
  "Free Delivery on Orders Above ₹999",
  "Buy 2 Get 1 Free — Limited Time!",
  "Cash on Delivery Available"
];

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bg-brand-primary text-white min-h-[40px] py-2 flex items-center justify-center relative px-12 z-50">
      <div className="text-sm font-medium animate-fade-in text-center w-full max-w-lg" key={currentIndex}>
        {announcements[currentIndex]}
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
