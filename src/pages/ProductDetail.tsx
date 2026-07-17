import { Placeholder } from "../components/Placeholder";
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Check, ChevronRight, Star, ShieldCheck, Clock, RefreshCcw, Leaf } from 'lucide-react';
import { Product, Review } from '../types';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const { addToCart, user, token } = useStore();

  useEffect(() => {
    setLoading(true);
    // Fetch product
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.id) {
          setProduct(data);
          if (data?.images?.length) setActiveImage(data.images[0]);
        } else {
          setProduct(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch related products
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        setRelatedProducts(data.filter(p => p.id !== id).slice(0, 4));
      })
      .catch(console.error);

    // Fetch reviews
    fetch(`/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(console.error);
      
    // Fetch variants
    
    if (token) {
      fetch(`/api/products/${id}/can-review`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setCanReview(data.canReview))
        .catch(console.error);
    }

    fetch(`/api/products/${id}/variants`)
      .then(res => res.json())
      .then(data => setVariants(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [id]);

  

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Please log in to review");
    
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Review added!");
        setReviews([data, ...reviews]);
        setReviewComment('');
        setReviewRating(5);
      } else {
        toast.error(data.error || "Failed to add review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex justify-center items-center">
         <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-base flex justify-center items-center text-text-primary">
        Product not found
      </div>
    );
  }

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* TOP SECTION: Gallery & Actions */}
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
            <Link to="/" className="hover:text-text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/shop" className="hover:text-text-primary">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* LEFT - IMAGE GALLERY */}
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-bg-surface border border-border flex items-center justify-center overflow-hidden group aspect-square">
                {activeImage || product.images?.[0] ? (
                  <img src={activeImage || product.images?.[0] || undefined} alt={product.name} className="absolute inset-0 w-full h-full object-cover p-0" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-bg-elevated flex items-center justify-center text-text-muted">
                    No image yet
                  </div>
                )}
              </div>
              
              {(product.images?.length || 0) > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images?.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative rounded-xl overflow-hidden aspect-square bg-bg-elevated border-2 transition-colors ${activeImage === img ? 'border-brand-primary' : 'border-border hover:border-gray-500'}`}
                    >
                      <img src={img || undefined} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT - PRODUCT INFO */}
            <div className="text-text-primary space-y-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-[#D4A017] gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{avgRating}</span>
                  </div>
                  <span className="text-text-muted text-sm border-l border-border pl-4">{reviews.length} reviews</span>
                </div>

                <div className="flex gap-4 mb-6">
                  {variants.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {variants.map(v => (
                        <Link 
                          key={v.id} 
                          to={`/product/${v.id}`}
                          className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${v.id === product.id ? 'bg-brand-primary border-brand-primary text-white' : 'bg-bg-surface border-border hover:border-gray-500'}`}
                        >
                          {v.weight}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="px-6 py-2 rounded-full border text-sm font-bold bg-brand-primary border-brand-primary text-white">
                      {product.weight}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-2">
                  {product.price > 0 ? (
                    <span className="text-4xl font-bold text-[#D4A017]">₹{product.price}</span>
                  ) : (
                    <span className="text-2xl font-medium text-text-muted">Price not set</span>
                  )}
                  {product.price > 0 && product.originalPrice > product.price && (
                    <span className="text-xl text-text-muted line-through">₹{product.originalPrice}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-[#4CAF50] text-sm font-medium bg-[#4CAF50]/10 px-3 py-1 rounded-full">
                      Save {product.discount}%
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[#4CAF50] text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" /> In Stock
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-bg-elevated rounded-xl border border-border">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-text-muted hover:text-text-primary transition"
                    >-</button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="px-4 py-3 text-text-muted hover:text-text-primary transition"
                    >+</button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={added}
                    className="flex-1 py-4 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90 disabled:from-[#4CAF50] disabled:to-[#4CAF50] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {added ? (
                      <><Check className="w-5 h-5" /> Added to Cart</>
                    ) : (
                      <><ShoppingBag className="w-5 h-5" /> Add to Cart</>
                    )}
                  </button>
                  <Link to="/checkout" className="flex-1 py-4 bg-white hover:bg-gray-200 text-[#0A0A0A] rounded-xl font-bold transition-colors flex items-center justify-center">
                    Buy Now
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-accent" />
                  <span className="text-sm font-medium text-text-muted">100% Homemade</span>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-[#4CAF50]" />
                  <span className="text-sm font-medium text-text-muted">No Preservatives</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4A017]" />
                  <span className="text-sm font-medium text-text-muted">Freshly Prepared</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-[#3b82f6]" />
                  <span className="text-sm font-medium text-text-muted">Easy Returns</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="pt-12 border-t border-border">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('description')} 
              className={`px-8 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'description' ? 'border-brand-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('ingredients')} 
              className={`px-8 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'ingredients' ? 'border-brand-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              Ingredients & Nutrition
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`px-8 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-brand-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              Reviews (${reviews.length})
            </button>
          </div>

          <div className="py-8 text-text-primary min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none text-text-muted">
                <p className="whitespace-pre-wrap">{product.description || 'No description available.'}</p>
                
                {product.variantType === 'combo' && product.comboItems && product.comboItems.length > 0 && (
                  <div className="mt-8 p-6 bg-bg-surface border border-brand-accent/20 rounded-xl">
                    <h4 className="text-text-primary font-bold mb-4">What's Included</h4>
                    <ul className="space-y-2 list-disc pl-5">
                      {product.comboItems.map((item, idx) => (
                        <li key={idx}>
                          <span className="font-bold">{item.quantity} x</span> {item.baseProductName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 p-6 bg-bg-surface border border-border rounded-xl">
                  <h4 className="text-text-primary font-bold mb-2">Storage Instructions</h4>
                  <p>Store in a cool, dry place. Refrigerate after opening. Best before 6 months from packaging.</p>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="grid md:grid-cols-2 gap-8 text-text-muted">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-text-primary">Ingredients</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{product.ingredients || 'No ingredients information available.'}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-text-primary">Nutritional Value</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{product.nutrition || 'No nutritional information available.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid md:grid-cols-12 gap-12">
                <div className="md:col-span-4 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Customer Reviews</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex text-[#D4A017]">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-6 h-6 ${i <= parseFloat(avgRating) ? 'fill-current' : 'text-border'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-xl">{avgRating} out of 5</span>
                    </div>
                    <p className="text-text-muted mt-2">Based on {reviews.length} reviews</p>
                  </div>
                  
                  
                  {user && !canReview && (
                    <div className="bg-bg-surface border border-border p-6 rounded-xl mt-8 opacity-75">
                      <h4 className="font-bold text-lg mb-2">Write a Review</h4>
                      <p className="text-text-muted text-sm">You must purchase this product to write a review. Only verified purchases are eligible.</p>
                      <button disabled className="mt-4 w-full py-3 bg-bg-elevated text-text-muted rounded-lg font-bold">Review Unavailable</button>
                    </div>
                  )}
                  {user && canReview && (
                    <form onSubmit={submitReview} className="bg-bg-surface border border-border p-6 rounded-xl space-y-4 mt-8">
                      <h4 className="font-bold text-lg">Write a Review</h4>
                      <div>
                        <label className="block text-sm text-text-muted mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(i => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i)}
                              className={`w-8 h-8 ${i <= reviewRating ? 'text-[#D4A017] fill-[#D4A017]' : 'text-border'}`}
                            >
                              <Star className={`w-full h-full ${i <= reviewRating ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-2">Comment</label>
                        <textarea 
                          required
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          rows={4}
                          className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
                          placeholder="What did you like about it?"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSubmittingReview}
                        className="w-full py-3 bg-brand-primary text-white rounded-lg font-bold disabled:opacity-50"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                  {!user && (
                    <div className="bg-bg-surface border border-border p-6 rounded-xl mt-8">
                      <p className="text-text-muted mb-4">Please log in to write a review.</p>
                      <Link to="/login" className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg font-bold">
                        Log In
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-8 space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                      <div key={review.id || i} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center font-bold text-brand-primary">
                              {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold">{review.user?.name || 'User'}</div>
                              <div className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex text-[#D4A017]">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-border'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-text-muted mt-3">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-text-muted border border-border rounded-xl border-dashed">
                      No reviews yet. Be the first to review this product!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMPARISON TABLE */}
        {variants.length > 1 && (
          <div className="pt-12 border-t border-border">
            <h2 className="text-2xl font-bold mb-8">Compare Options</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 px-6 font-medium text-text-muted">Size / Variant</th>
                    <th className="py-4 px-6 font-medium text-text-muted">Price</th>
                    <th className="py-4 px-6 font-medium text-text-muted">Price per 100g</th>
                    <th className="py-4 px-6 font-medium text-text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(v => {
                    // Extract numeric value from weight string (e.g. "250g" -> 250)
                    const weightMatch = v.weight.match(/(\d+)\s*(g|kg)/i);
                    let pricePer100 = 0;
                    if (weightMatch) {
                      let grams = parseFloat(weightMatch[1]);
                      if (weightMatch[2].toLowerCase() === 'kg') grams *= 1000;
                      pricePer100 = (v.price / grams) * 100;
                    }
                    
                    return (
                      <tr key={v.id} className={`border-b border-border hover:bg-bg-surface transition-colors ${v.id === product.id ? 'bg-bg-surface border-l-4 border-l-brand-primary' : ''}`}>
                        <td className="py-4 px-6 font-bold">{v.weight} {v.id === product.id && <span className="ml-2 text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded">Current</span>}</td>
                        <td className="py-4 px-6 font-bold text-[#D4A017]">₹{v.price}</td>
                        <td className="py-4 px-6 text-text-muted">
                          {pricePer100 > 0 ? `₹${pricePer100.toFixed(2)}/100g` : '-'}
                        </td>
                        <td className="py-4 px-6">
                          {v.id !== product.id ? (
                            <Link to={`/product/${v.id}`} className="text-brand-primary font-bold hover:underline">
                              View Product
                            </Link>
                          ) : (
                            <span className="text-text-muted">Selected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* YOU MAY ALSO LIKE */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-border pb-12">
            <h2 className="text-2xl font-bold mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
