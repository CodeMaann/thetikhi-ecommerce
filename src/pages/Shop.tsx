import { Placeholder } from "../components/Placeholder";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { safeFetch } from '../lib/api';


export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'single' | 'combo'>('all');

  useEffect(() => {
    safeFetch('/api/products')
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => {
    if (filterType === 'all') return true;
    const type = p.variantType || 'single';
    return type === filterType;
  });

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">All Products</h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Browse our collection of authentic, homemade Indian pickles. Crafted with love and the finest spices.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {(['all', 'single', 'combo'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filterType === type 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-bg-surface text-text-primary border border-border hover:border-brand-primary'
              }`}
            >
              {type === 'all' ? 'All' : type === 'single' ? 'Single Items' : 'Combo Packs'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={product.id}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
