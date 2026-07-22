import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Placeholder } from '../components/Placeholder';
import { safeFetch } from '../lib/api';
import { Product } from '../types';
import {
  Heart,
  ShieldCheck,
  Leaf,
  ChefHat,
  ThumbsUp,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Sun,
  Package,
  Truck,
  ShoppingBag
} from 'lucide-react';

export function Story() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    safeFetch('/api/products')
      .then(data => setProducts(data.slice(0, 6)))
      .catch(err => console.error('Error loading products for Story:', err));
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: "easeOut" as const }
  };

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-24">
        <motion.div {...fadeInUp} className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-display text-text-primary tracking-tight">
            Achar Jaisa Nahi... <br />
            <span className="text-brand-primary">Yaadon Jaisa Swaad.</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Authentic homemade pickles and chutneys crafted with traditional recipes, premium ingredients, and the perfect blend of Indian spices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/shop" className="w-full sm:w-auto px-8 py-3 bg-brand-primary text-black font-bold rounded-full hover:scale-105 transition-transform">
              Order Now
            </Link>
            <a href="#products" className="w-full sm:w-auto px-8 py-3 bg-bg-surface border border-border text-text-primary font-bold rounded-full hover:bg-bg-elevated transition-colors">
              Explore Products
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="bg-bg-surface border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-2">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary">100% Homemade</h3>
              <p className="text-sm text-text-muted">Prepared in small batches with authentic recipes.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary">No Artificial Preservatives</h3>
              <p className="text-sm text-text-muted">Only real ingredients and real flavours.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-2">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary">Premium Ingredients</h3>
              <p className="text-sm text-text-muted">Fresh vegetables, spices, and cold-pressed mustard oil.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary">Made with Love</h3>
              <p className="text-sm text-text-muted">Every jar is prepared with care and tradition.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary">Bringing Back the Taste of Home</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>At The Tikhi, we believe food is more than just taste—it is a memory.</p>
              <p>Every jar is inspired by recipes passed down through generations, prepared with premium ingredients, authentic Indian spices, and the warmth of homemade cooking.</p>
              <p>Whether it's our signature Aloo Ka Achar or our tangy Imli Ki Chutney, every product is crafted to bring the comforting flavours of home to your dining table.</p>
              <p>The Tikhi isn't just a brand. It's a celebration of tradition, family, and unforgettable taste.</p>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
<div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ring-4 ring-bg-surface hover:ring-brand-primary/20">
              <img src="/founder-photo.jpeg" alt="The Tikhi Founder" className="w-full h-full object-cover object-top" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. OUR PRODUCTS SECTION */}
      <section id="products" className="py-24 bg-bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary">Crafted for Every Food Lover</h2>
            <p className="text-text-muted max-w-2xl mx-auto">Discover a delicious range of homemade pickles and chutneys made to complement every meal.</p>
          </motion.div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <motion.div key={product.id} {...fadeInUp} transition={{ delay: i * 0.1 }} className="bg-bg-base border border-border rounded-2xl p-6 hover:border-brand-primary/50 transition-colors">
                  <div className="aspect-square mb-6 rounded-xl overflow-hidden bg-bg-surface">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Placeholder className="w-full h-full" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-text-muted text-sm line-clamp-2 mb-4">{product.description}</p>
                  <Link to={`/product/${product.id}`} className="text-brand-primary font-bold hover:underline inline-flex items-center">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
             <div className="text-center text-text-muted">Loading products...</div>
          )}
        </div>
      </section>

      {/* 5. WHY CHOOSE THE TIKHI SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary mb-4">Why Choose The Tikhi?</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: ChefHat, title: "Authentic Homemade Recipes", desc: "Prepared using traditional cooking methods.", color: "text-brand-primary", bgColor: "bg-brand-primary/10" },
            { icon: Leaf, title: "Premium Ingredients", desc: "Fresh vegetables, natural spices and high-quality mustard oil.", color: "text-[#4CAF50]", bgColor: "bg-[#4CAF50]/10" },
            { icon: Utensils, title: "Small Batch Production", desc: "Every batch receives the attention it deserves.", color: "text-[#D4A017]", bgColor: "bg-[#D4A017]/10" },
            { icon: ShieldCheck, title: "No Artificial Colours", desc: "Natural ingredients with authentic taste.", color: "text-brand-accent", bgColor: "bg-brand-accent/10" },
            { icon: Sun, title: "Rich Indian Flavours", desc: "Bold spices inspired by traditional Indian kitchens.", color: "text-brand-primary", bgColor: "bg-brand-primary/10" },
            { icon: ThumbsUp, title: "Trusted by Happy Customers", desc: "Thousands of families enjoy The Tikhi every day.", color: "text-[#4CAF50]", bgColor: "bg-[#4CAF50]/10" },
          ].map((item, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex items-start space-x-6 p-6 bg-gradient-to-br from-bg-surface to-bg-hover border border-border hover:border-brand-primary rounded-2xl group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className={`w-16 h-16 flex-shrink-0 ${item.bgColor} ${item.color} rounded-full flex items-center justify-center`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-2 group-hover:text-brand-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. HOMEMADE PROCESS SECTION */}
      <section className="py-24 bg-bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary">Crafted with Care</h2>
            <p className="text-text-muted max-w-2xl mx-auto">Every product follows a simple promise.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line for desktop (Animated) */}
            <div className="hidden md:block absolute top-8 left-[10%] w-[80%] h-1 bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                whileInView={{ width: "100%" }} 
                viewport={{ once: true }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
                className="h-full bg-brand-primary" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                { icon: Leaf, label: "Fresh Ingredients", color: "text-[#4CAF50]", bgColor: "bg-[#4CAF50]/10" },
                { icon: ChefHat, label: "Traditional Preparation", color: "text-[#D4A017]", bgColor: "bg-[#D4A017]/10" },
                { icon: Sun, label: "Authentic Spice Blend", color: "text-brand-primary", bgColor: "bg-brand-primary/10" },
                { icon: Package, label: "Carefully Packed", color: "text-brand-accent", bgColor: "bg-brand-accent/10" },
                { icon: Truck, label: "Delivered Fresh to Your Home", color: "text-[#4CAF50]", bgColor: "bg-[#4CAF50]/10" }
              ].map((step, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.2 }} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 bg-bg-base border-2 border-border group-hover:border-brand-primary group-hover:-translate-y-2 group-hover:shadow-xl rounded-full flex items-center justify-center ${step.color} mb-4 transition-all duration-300`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-text-primary text-sm group-hover:text-brand-primary transition-colors">{step.label}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. OUR PROMISE SECTION */}
      <section className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...fadeInUp} className="space-y-6">
          <ShieldCheck className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary">We never compromise on quality.</h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Every jar reflects our commitment to authentic taste, hygiene, freshness, and customer satisfaction. Because every meal deserves the flavour of home.
          </p>
        </motion.div>
      </section>

      {/* 8. CUSTOMER / SOCIAL PROOF SECTION */}
      <section className="py-24 bg-bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
           <motion.div {...fadeInUp}>
             <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary mb-4">Loved by Families Across India</h2>
             <p className="text-lg text-text-secondary leading-relaxed">
                From everyday meals to festive gatherings, The Tikhi has become a part of thousands of happy dining tables. Every smile, every review, and every repeat order motivates us to preserve the authentic taste of India.
             </p>
           </motion.div>
        </div>
      </section>

      {/* 9. AVAILABLE ON SECTION */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...fadeInUp} className="mb-12">
          <h2 className="text-3xl font-bold font-display text-text-primary mb-4">Available On</h2>
          <p className="text-text-muted">You can order The Tikhi from your favourite shopping platforms.</p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center gap-8 mb-12">
           <motion.a href="https://www.amazon.in/storefront?me=A2JB03W2D1N5R2&ref_=ssf_share" target="_blank" rel="noopener noreferrer" {...fadeInUp} transition={{ delay: 0.1 }} className="w-40 block hover:scale-105 transition-transform">
             <img src="/amazon-banner.png" alt="Buy on Amazon" className="w-full h-24 object-contain rounded-xl mb-3" />
             <span className="text-sm font-medium text-text-primary">Amazon</span>
           </motion.a>
           <motion.a href="https://www.flipkart.com/thetikhi-com-traditional-homemade-aaloo-ka-achar-green-chilli-pickle/p/itmd2e1518925d26?pid=PCKHMJZXZZTBF2U6" target="_blank" rel="noopener noreferrer" {...fadeInUp} transition={{ delay: 0.2 }} className="w-40 block hover:scale-105 transition-transform">
             <img src="/flipkart-banner.png" alt="Buy on Flipkart" className="w-full h-24 object-contain rounded-xl mb-3" />
             <span className="text-sm font-medium text-text-primary">Flipkart</span>
           </motion.a>
        </div>
        
        <motion.p {...fadeInUp} transition={{ delay: 0.4 }} className="text-text-secondary font-medium">
          Or order directly from our official website for exclusive offers.
        </motion.p>
      </section>

      {/* 10. COMBO OFFERS SECTION */}
      <section className="py-24 bg-bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg-base border border-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
             <motion.div {...fadeInUp} className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold font-display text-text-primary">Save More with Delicious Combos</h2>
                <p className="text-text-secondary">Choose from specially curated combo packs and enjoy more flavours at better prices.</p>
                <ul className="space-y-3">
                  {["Buy More & Save More", "Exclusive Online Offers", "Free Shipping on Selected Orders", "Special Gifts with Eligible Combos"].map((item, i) => (
                    <li key={i} className="flex items-center text-text-primary font-medium">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
             </motion.div>
             <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Link to="/shop" className="inline-flex px-8 py-4 bg-brand-primary text-black font-bold rounded-full hover:scale-105 transition-transform">
                  Shop Combos <ShoppingBag className="w-5 h-5 ml-2" />
                </Link>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
         <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-6">Ready to Experience the Taste of Home?</h2>
            <p className="text-xl text-text-muted mb-12">Bring home authentic Indian pickles and chutneys made with love, tradition, and premium ingredients.</p>
            
            <div className="bg-bg-surface inline-block border border-border rounded-3xl p-8 mb-10 text-left w-full sm:w-auto">
               <h3 className="font-bold text-lg text-text-primary mb-4 border-b border-border pb-4">Why The Tikhi?</h3>
               <ul className="space-y-3">
                 {["Homemade Style", "Authentic Recipe", "No Compromise Taste", "Bold & Spicy Flavor"].map((item, i) => (
                   <li key={i} className="flex items-center text-text-secondary">
                     <CheckCircle2 className="w-5 h-5 text-brand-primary mr-3 flex-shrink-0" />
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
            
            <div>
              <Link to="/shop" className="inline-block px-10 py-4 bg-brand-primary text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)]">
                Order Now
              </Link>
            </div>
         </motion.div>
      </section>

    </div>
  );
}
