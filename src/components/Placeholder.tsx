import React from 'react';
import { cn } from '../lib/utils';
import { ImageIcon } from 'lucide-react';

export function Placeholder({ className }: { text?: string, className?: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-bg-surface border border-border text-text-muted text-center p-4 relative overflow-hidden",
      className
    )}>
      {/* Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}
      />
      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-xs uppercase tracking-wider font-medium">Image coming soon</span>
    </div>
  );
}
