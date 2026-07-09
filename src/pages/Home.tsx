import { Placeholder } from "../components/Placeholder";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Shield, Leaf, Truck, Home as HomeIcon, MapPin, Phone, Mail, MessageCircle, Check, Sun, Book, Heart, Play } from 'lucide-react';
import { Product } from '../types';
import { safeFetch } from '../lib/api';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    safeFetch('/api/products')
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-brand-primary selection:text-white pb-20 md:pb-0">
      
      {/* 3. HERO SECTION */}
      <section className="relative min-h-[90vh] md:h-screen flex items-center overflow-hidden bg-bg-base pt-20 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:w-[110%]"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent text-sm font-medium text-brand-accent bg-transparent">
              100% Homemade Authentic Recipe
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] uppercase">
              Ignite Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">Tastebuds.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-lg leading-relaxed">
              Experience the bold, tangy, and spicy sensation of authentic Indian Aloo Ka Achar. Not just Achar.. It's a feeling.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/shop" className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent hover:scale-102 text-white rounded-xl font-bold transition-transform shadow-lg flex items-center gap-2">
                Shop Now
              </Link>
              <Link to="/story" className="px-6 py-3 bg-transparent border border-border hover:bg-bg-elevated text-text-primary rounded-xl font-bold transition-all">
                Our Story
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-8 text-sm text-text-muted">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-brand-primary" /> FSSAI Approved</div>
              <div className="flex items-center gap-2"><Star className="w-5 h-5 text-brand-primary" /> 400+ Happy Customers</div>
              <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-brand-primary" /> Free Shipping</div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: 'spring' }}
            className="relative flex justify-center items-center h-[400px] md:h-[600px]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(196,30,58,0.2)_0%,transparent_70%)]" />
            <div className="relative">
              <img
                src="hero.jpeg"
                alt="Hero Product"
                className="w-full max-w-full h-full min-h-[400px] object-contain rounded-2xl"
              />
              <div className="absolute -top-4 -right-4 md:top-4 md:-right-8 bg-brand-primary text-white text-sm md:text-base font-bold px-4 py-2 rounded-lg rotate-12 shadow-xl whitespace-nowrap">
                BESTSELLER
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <section className="bg-bg-surface py-8 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "100% Natural", desc: "No artificial colors or preservatives" },
              { icon: Shield, title: "FSSAI Approved", desc: "Certified safe & hygienic preparation" },
              { icon: Truck, title: "Pan India Delivery", desc: "Delivered fresh to your doorstep" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <feature.icon className="w-8 h-8 text-brand-primary" />
                <h3 className="text-text-primary font-bold text-lg uppercase">{feature.title}</h3>
                <p className="text-text-muted text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OFFERS SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Hot Deals</h2>
            <Sun className="w-8 h-8 text-brand-accent" /> {/* Flame substitute */}
          </div>
          <p className="text-text-muted mb-10">Grab these limited-time offers before they expire!</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="relative h-[280px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-black/60 z-10" />
             <img
  src="deal page buy 2 get 3.png"
  alt="Offer"
  className="absolute inset-0 w-full h-full object-cover"
/>
              <div className="relative z-20 h-full flex flex-col justify-end p-6">
                <h3 className="text-3xl font-bold text-white mb-1 leading-tight">Buy 2 Get 1 Free</h3>
                <p className="text-gray-300 text-sm mb-4">On All 250g & 500g Jars</p>
                <Link to="/shop" className="inline-flex justify-center bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm w-fit hover:bg-gray-200 transition-colors">
                  Grab Deal
                </Link>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="relative h-[280px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img
  src="deal card 2.png"
  alt="Offer"
  className="absolute inset-0 w-full h-full object-cover"
/>
              <div className="relative z-20 h-full flex flex-col justify-end p-6">
                <h3 className="text-3xl font-bold text-white mb-1 leading-tight">Buy 6 @ Just ₹1499</h3>
                <p className="text-gray-300 text-sm mb-4">Massive Family Pack Savings</p>
                <Link to="/shop" className="inline-flex justify-center bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm w-fit hover:bg-gray-200 transition-colors">
                  Grab Deal
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative h-[280px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-black/60 z-10" />
             <img
  src="deal card 3.png"
  alt="Offer"
  className="absolute inset-0 w-full h-full object-cover"
/>
              <div className="relative z-20 h-full flex flex-col justify-end p-6">
                <h3 className="text-3xl font-bold text-white mb-1 leading-tight">Free Delivery</h3>
                <p className="text-gray-300 text-sm mb-4">On all orders above ₹999</p>
                <Link to="/shop" className="inline-flex justify-center bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm w-fit hover:bg-gray-200 transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRODUCTS SECTION */}
      <section className="py-20 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-3">Our Signature Pickles</h2>
            <p className="text-text-muted">Crafted with love, spices, and tradition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {products.slice(0, 2).map((product, i) => (
              <div key={product.id} className="bg-bg-elevated border border-border hover:border-brand-primary rounded-2xl p-6 transition-colors flex flex-col">
                <div className="relative h-64 mb-6 rounded-xl bg-bg-surface border border-border overflow-hidden group hover:border-brand-accent/50 transition-colors">
                  <div className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                    {product.discount}% OFF
                  </div>
                  {(product.images?.[0]) ? (
                    <img src={(product.images?.[0]) || undefined} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Placeholder className="absolute inset-0 w-full h-full border-none" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-text-primary mb-2">{product.name}</h3>
                <p className="text-text-muted text-sm mb-6 flex-grow">{product.description}</p>
                
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-[#D4A017]">₹{product.price}</span>
                  <span className="text-text-muted line-through text-lg">₹{product.originalPrice}</span>
                  <span className="text-[#4CAF50] text-sm font-medium bg-[#4CAF50]/10 px-2 py-1 rounded-md ml-auto">
                    Save {product.discount}%
                  </span>
                </div>
                
                <Link to={`/product/${product.id}`} className="w-full text-center bg-gradient-to-r from-brand-primary to-brand-accent text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                  View & Add to Cart
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMBO SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-dashed border-brand-primary overflow-hidden">
            <div className="absolute inset-0 bg-black/70 z-10" />
           <img
  src="deal page buy 2 get 3.png"
  alt="Combo Offer"
  className="absolute inset-0 w-full h-full object-cover"
/>
            
            <div className="relative z-20 grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
              <div className="space-y-6">
                <div className="text-brand-accent uppercase tracking-widest font-bold text-sm">Special Combo Offer</div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Buy 2 Get 1 Free</h2>
                <p className="text-gray-300 text-lg">
                  Get 3 jars of our signature Aloo Ka Achar at the price of 2. Perfect for gifting or stocking up.
                </p>
                <div className="text-4xl font-bold text-[#D4A017]">₹796 only</div>
                <Link to="/shop" className="inline-block bg-gradient-to-r from-brand-primary to-brand-accent text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                  Add Combo to Cart
                </Link>
              </div>
              <div className="hidden md:block">
                {/* Image is handled by the background, just leaving space */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE US */}
      <section className="py-20 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">The Tikhi Promise</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Shield, color: "text-brand-primary", title: "FSSAI Approved", desc: "Every batch is prepared under strict hygiene standards. License: 133259988000037" },
              { icon: Leaf, color: "text-[#4CAF50]", title: "100% Natural", desc: "No artificial preservatives, colors, or chemicals. Just pure homemade goodness." },
              { icon: HomeIcon, color: "text-[#D4A017]", title: "Homemade Recipe", desc: "Made with the same love and care as your mother's kitchen. Small batch production." },
              { icon: Truck, color: "text-brand-accent", title: "Pan India Delivery", desc: "Free shipping on orders above ₹999. Delivered in 3-5 business days." },
            ].map((item, i) => (
              <div key={i} className="bg-bg-hover backdrop-blur-sm border border-border hover:border-brand-primary p-6 rounded-2xl flex gap-6 group hover:-translate-y-2 transition-all">
                <div className={`${item.color} shrink-0`}>
                  <item.icon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. OUR STORY SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-base to-bg-elevated" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-center justify-center">
  <img
    src="achar image sample.jpeg"
    alt="Our Story"
    className="max-w-[300px] md:max-w-[400px] w-full h-auto object-contain rounded-2xl"
  />
</div>
          
          <div className="space-y-8">
            <div className="text-brand-accent uppercase tracking-widest font-bold text-sm">Our Story</div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Not Just Achar..<br/>
              <span className="text-brand-primary">It's a Feeling.</span>
            </h2>
            
            <div className="space-y-4 text-lg text-text-muted leading-relaxed">
              <p>
                It all started in a small kitchen in New Delhi. The aroma of roasted mustard seeds, the vibrant red of sun-dried chillies, and the magic hands of our founder creating what we call 'Maa Ke Haath Ka Swaad'.
              </p>
              <p>
                The Tikhi isn't just about selling pickles; it's about preserving a legacy. Every jar of our Aloo Ka Achar is a testament to the authentic, traditional methods passed down through generations.
              </p>
            </div>
            
            <blockquote className="border-l-4 border-brand-primary pl-6 py-2 text-xl italic text-[#D4A017] font-serif">
              "Ghar jaisa achar, lekin sabke ghar tak."
            </blockquote>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-border mt-8">
              <div className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-primary" /> <span className="text-sm font-medium">Handpicked Potatoes</span></div>
              <div className="flex items-center gap-3"><Sun className="w-5 h-5 text-brand-primary" /> <span className="text-sm font-medium">Sun-Dried Spices</span></div>
              <div className="flex items-center gap-3"><Book className="w-5 h-5 text-brand-primary" /> <span className="text-sm font-medium">Traditional Recipe</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. RECIPES SECTION */}
      <section className="py-20 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">How to Enjoy</h2>
            <p className="text-text-muted max-w-2xl mx-auto">Our Aloo Ka Achar is incredibly versatile. Here are our favorite ways to spice up every meal.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { img: "", title: "With Paratha", desc: "The classic combination. A generous dollop on a hot paratha." },
              { img: "", title: "Dal Chawal", desc: "Elevate your simple comfort food with a tangy kick." },
              { img: "", title: "Poha", desc: "A tangy twist to your morning breakfast." },
              { img: "", title: "Straight from Jar", desc: "We won't judge! It's that good. Grab a spoon." },
            ].map((recipe, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden bg-bg-elevated border border-border">
                <div className="h-48 overflow-hidden">
                 <img
    src={"recipe-${i + 1}.png"}
    alt={recipe.title}
    className="w-full h-full object-cover"
/>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-text-primary mb-2">{recipe.title}</h3>
                  <p className="text-sm text-text-muted">{recipe.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 flex-wrap">

  <video
    src="videos/reel1.mp4"
    controls
    autoPlay
    muted
    loop
    playsInline
    className="w-[280px] aspect-[9/16] rounded-3xl shadow-xl object-cover"
  />

  <video
    src="videos/reel2.mp4"
    controls
    autoPlay
    muted
    loop
    playsInline
    className="w-[280px] aspect-[9/16] rounded-3xl shadow-xl object-cover"
  />

  <video
    src="videos/reel3.mp4"
    controls
    autoPlay
    muted
    loop
    playsInline
    className="w-[280px] aspect-[9/16] rounded-3xl shadow-xl object-cover"
  />

</div>
        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">What Our Customers Say</h2>
            <p className="text-text-muted">Real feedback from real spice lovers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bg-elevated border border-border rounded-2xl p-6">
              <div className="flex text-[#D4A017] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-text-muted mb-6 italic">"The best achar I've ever tasted! Truly reminds me of my grandmother's recipe."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center font-bold text-brand-primary">P</div>
                <div>
                  <div className="font-bold text-text-primary">Priya Sharma</div>
                  <div className="text-xs text-text-muted">Dwarka, New Delhi</div>
                </div>
              </div>
            </div>
            <div className="bg-bg-elevated border border-border rounded-2xl p-6">
              <div className="flex text-[#D4A017] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-text-muted mb-6 italic">"Finally found an achar that tastes homemade and authentic. The Tikhi has become a staple in my kitchen."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center font-bold text-brand-primary">R</div>
                <div>
                  <div className="font-bold text-text-primary">Rahul Verma</div>
                  <div className="text-xs text-text-muted">Gurgaon</div>
                </div>
              </div>
            </div>
            <div className="bg-bg-elevated border border-border rounded-2xl p-6">
              <div className="flex text-[#D4A017] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-text-muted mb-6 italic">"Bought the combo pack for my family. Everyone loved it! Will definitely reorder."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center font-bold text-brand-primary">A</div>
                <div>
                  <div className="font-bold text-text-primary">Anita Gupta</div>
                  <div className="text-xs text-text-muted">Noida</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. CONTACT PREVIEW */}
      <section className="py-20 bg-bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold uppercase mb-8">Get in Touch</h2>
          <div className="flex flex-wrap justify-center gap-8 text-text-muted">
            <div className="flex items-center gap-3"><MapPin className="text-brand-primary" /> New Delhi-110018</div>
            <div className="flex items-center gap-3"><Phone className="text-brand-primary" /> +91 88267 06250</div>
            <div className="flex items-center gap-3"><Mail className="text-brand-primary" /> support@thetikhi.com</div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
