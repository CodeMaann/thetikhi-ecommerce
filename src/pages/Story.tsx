import React from 'react';

export function Story() {
  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight">
          Not Just Achar... <br/>
          <span className="text-brand-primary">It's a Feeling.</span>
        </h1>
        
        <div className="w-full h-64 md:h-96 bg-bg-surface rounded-3xl border border-border flex items-center justify-center overflow-hidden">
  <img 
    src="our story.png" 
    alt="The Tikhi Founder" 
    className="w-full h-full object-cover" 
  />
</div>

        <div className="space-y-6 text-text-muted text-lg leading-relaxed text-left max-w-2xl mx-auto">
          <p>
            It all started in a small kitchen in New Delhi. The aroma of roasted mustard seeds, the vibrant red of sun-dried chillies, and the magic hands of our founder creating what we call "Maa Ke Haath Ka Swaad".
          </p>
          <p>
            The Tikhi isn't just about selling pickles; it's about preserving a legacy. Every jar of our Aloo Ka Achar is a testament to the authentic, traditional methods that have been passed down through generations.
          </p>
          <p>
            We source our potatoes locally, sun-dry our spices, and use pure mustard oil. No preservatives, no artificial colors. Just pure, unadulterated love, sealed in a glass jar.
          </p>
          <div className="pt-8 text-center border-t border-border mt-12">
             <h3 className="text-2xl font-bold text-text-primary mb-2">Taste the Tradition</h3>
             <p className="text-sm text-brand-accent">Crafted with ❤️ in New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
