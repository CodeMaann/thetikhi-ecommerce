import { Placeholder } from "./Placeholder";
import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-elevated border-l border-border shadow-2xl z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Your Cart</h2>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition w-11 h-11 flex items-center justify-center -mr-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p>Your cart is empty.</p>
                  <button onClick={onClose} className="text-brand-primary hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-bg-hover border border-border relative group">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-1 right-1 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-20 h-20 bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center border border-border relative">
                       {item.images?.[0] ? (
                         <img src={item.images?.[0] || undefined} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                       ) : (
                         <Placeholder className="absolute inset-0 w-full h-full border-none p-1 text-[8px]" />
                       )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-sm font-medium text-text-primary pr-6">{item.name}</h3>
                      <p className="text-xs text-text-muted mt-1">{item.weight}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-brand-accent">₹{item.price}</span>
                        <div className="flex items-center bg-black rounded-md border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-text-primary">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-bg-base space-y-4">
                <div className="flex justify-between text-text-muted text-sm">
                  <span>Subtotal</span>
                  <span className="text-text-primary">₹{cartTotal()}</span>
                </div>
                <div className="flex justify-between text-text-muted text-sm">
                  <span>Delivery</span>
                  {cartTotal() > 999 ? (
                    <span className="text-[#4CAF50]">Free</span>
                  ) : (
                    <span className="text-text-primary">₹50</span>
                  )}
                </div>
                <div className="flex justify-between text-text-primary font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₹{cartTotal() > 999 ? cartTotal() : cartTotal() + 50}</span>
                </div>
                
                {cartTotal() <= 999 && (
                  <p className="text-xs text-brand-accent text-center">Add ₹{1000 - cartTotal()} more to get Free Delivery!</p>
                )}
                {cartTotal() > 999 && (
                  <p className="text-xs text-[#4CAF50] text-center font-medium">🎉 Free Delivery Unlocked!</p>
                )}
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center py-4 px-8 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-xl font-bold hover:scale-[1.02] transition-transform"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
