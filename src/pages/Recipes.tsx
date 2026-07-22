import React from 'react';

export function Recipes() {
  const waysToEnjoy = [
    { title: 'With Paratha', desc: 'The classic combination. A dollop of The Tikhi Aloo Achar on a hot, ghee-roasted paratha.', img: '/recipe-1.png' },
    { title: 'Dal Chawal', desc: 'Elevate your simple comfort food. Mix it with steaming rice and yellow dal.', img: '/recipe-2.png' },
    { title: 'Poha', desc: 'A tangy twist to your morning breakfast. Just a spoonful does the magic.', img: '/recipe-3.png' },
    { title: 'Straight from Jar', desc: 'We won\'t judge! It\'s that good.', img: '/recipe-4.png' },
  ];

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">How to Enjoy</h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Our Aloo Ka Achar is incredibly versatile. Here are some of our favorite ways to spice up every meal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {waysToEnjoy.map((way, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden bg-bg-elevated border border-border">
              <div className="h-48 overflow-hidden">
                <img
                  src={way.img}
                  alt={way.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">{way.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{way.desc}</p>
              </div>
            </div>
          ))}
        </div>
  );
}
