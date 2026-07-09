import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Placeholder } from "./Placeholder";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className="group relative bg-bg-surface rounded-3xl p-6 border border-border hover:border-brand-accent/50 transition-all flex flex-col h-full"
    >
      {product.discount && product.discount > 0 ? (
        <div className="absolute top-4 right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          {product.discount}% OFF
        </div>
      ) : null}
      
      <Link to={`/product/${product.id}`} className="block relative h-64 mb-6 rounded-2xl bg-bg-surface border border-border overflow-hidden group-hover:border-brand-accent/50 transition-colors">
        {(product.images?.[0]) ? (
          <img src={(product.images?.[0]) || undefined} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Placeholder className="absolute inset-0 w-full h-full border-none" />
        )}
      </Link>
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-accent transition-colors">{product.name}</h3>
        </div>
        <p className="text-text-muted text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-end gap-2 mb-4">
            {product.price > 0 ? (
              <span className="text-2xl font-bold text-text-primary">₹{product.price}</span>
            ) : (
              <span className="text-xl font-medium text-text-muted">Price not set</span>
            )}
            {product.originalPrice > 0 && product.price > 0 && (
              <span className="text-gray-500 line-through text-sm mb-1">₹{product.originalPrice}</span>
            )}
          </div>
          <Link 
            to={`/product/${product.id}`}
            className="w-full flex justify-center py-3 rounded-xl bg-bg-hover hover:bg-brand-primary text-text-primary hover:text-white font-medium transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
