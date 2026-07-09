import { Placeholder } from "../components/Placeholder";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Order } from '../lib/orderService';
import { downloadInvoicePdf } from '../lib/pdfService';
import { Loader2, CheckCircle2, ChevronRight, MapPin, Package, Truck, Download, MessageCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { useRazorpay } from 'react-razorpay';
import { addDays, format } from 'date-fns';
import { trackEvent } from '../lib/analytics';

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const [shipping, setShipping] = useState({
    name: '', phone: '', email: '', fullAddress: '', city: '', state: '', pincode: '', landmark: '', type: 'Home'
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'upi' | 'wallet'>('cod');
  
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('checkout_started', { cartCount: cart.length, cartTotal: cartTotal() });
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !successOrder) {
      navigate('/shop');
    }
  }, [cart, navigate, successOrder]);

  const subtotal = cartTotal();
  const shippingFee = subtotal > 999 ? 0 : 50;
  const codCharges = paymentMethod === 'cod' && subtotal < 999 ? 50 : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = subtotal + shippingFee + codCharges - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount: data.discountAmount });
        setCouponInput('');
      } else {
        setCouponError(data.reason);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shipping.phone.length !== 10 || !/^[6-9]\d{9}$/.test(shipping.phone)) {
      setError("Please enter a valid 10-digit Indian phone number");
      return;
    }
    if (shipping.pincode.length !== 6 || !/^\d{6}$/.test(shipping.pincode)) {
      setError("Please enter a valid 6-digit PIN code");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleLocationDetect = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.address) {
              setShipping(prev => ({
                ...prev,
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                pincode: data.address.postcode || ''
              }));
            }
          } catch (err) {
            console.error("Location detect failed");
          }
        },
        () => setError("Location permission denied. Please enter manually.")
      );
    }
  };

  const placeOrderDirect = async (paymentStatus: Order['payment']['status'], rzpDetails?: any) => {
    const baseOrder = {
      orderDate: new Date().toISOString(),
      customer: {
        name: shipping.name,
        phone: shipping.phone,
        email: shipping.email,
        address: {
          fullAddress: shipping.fullAddress,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          landmark: shipping.landmark,
          type: shipping.type
        }
      },
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        mrp: i.price * 1.5,
        image: i.image
      })),
      pricing: {
        subtotal,
        shipping: shippingFee,
        codCharges,
        discount: 0,
        grandTotal
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        razorpayOrderId: rzpDetails?.razorpay_order_id,
        razorpayPaymentId: rzpDetails?.razorpay_payment_id,
        paidAt: paymentStatus === 'paid' ? new Date().toISOString() : undefined
      },
      status: 'confirmed',
      statusHistory: [{ status: 'confirmed', timestamp: new Date().toISOString(), note: 'Order placed successfully' }],
      estimatedDelivery: format(addDays(new Date(), 4), 'yyyy-MM-dd')
    };

    try {
      const payload = {
        ...baseOrder,
        couponCode: appliedCoupon?.code
      };
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }
      if (data.success) {
        const finalOrder = data.order;
        // receiptUrl is now set on the server
        clearCart();
        
        // Mock Email / WhatsApp
        console.log(`Email Sent: Subject: "Order Confirmed — ${finalOrder.orderId} | The Tikhi"`);
        console.log(`WhatsApp Sent to ${shipping.phone}: "Hi ${shipping.name}, your order *${finalOrder.orderId}* has been *confirmed*!"`);
        
        trackEvent('order_placed', { orderId: finalOrder.orderId, total: finalOrder.pricing.grandTotal, discount: finalOrder.pricing.discount, couponCode: finalOrder.pricing.offerApplied });
        
        setSuccessOrder(finalOrder);

        // Fire confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    
    if (paymentMethod === 'cod') {
      setTimeout(() => {
        placeOrderDirect('pending');
      }, 1000);
      return;
    }

    if (paymentMethod === 'razorpay') {
      // Mock Razorpay Flow
      const options: any = {
        key: 'rzp_test_mock_key',
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'The Tikhi',
        description: 'Aloo Ka Achar Order',
        image: '/logo.png',
        order_id: 'order_mock_' + Math.floor(Math.random() * 1000000), // Mock backend order_id
        handler: (res: any) => {
          placeOrderDirect('paid', res);
        },
        prefill: {
          name: shipping.name,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: {
          color: '#C41E3A',
        },
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setError("Payment failed. Please try again or use COD.");
        setLoading(false);
      });
      
      rzp.open();
      // Reset loading since the modal takes over
      setLoading(false);
    }
  };

  if (cart.length === 0 && !successOrder) return null;

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20 text-text-primary relative">
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-elevated border border-border rounded-2xl p-6 md:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => navigate('/shop')} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-brand-primary" />
            
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-20 h-20 bg-[#4CAF50]/10 rounded-full flex items-center justify-center animate-bounce-slow">
                <CheckCircle2 className="w-12 h-12 text-[#4CAF50]" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-[28px] font-bold text-text-primary mb-2 leading-tight">Order Placed Successfully!</h2>
              <p className="text-text-muted text-lg">Thank you, {successOrder.customer.name}!</p>
            </div>

            <div className="bg-bg-base rounded-xl p-4 border border-border mb-6 text-center">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Order ID</p>
              <p className="text-2xl font-bold text-[#D4A017]">{successOrder.orderId}</p>
            </div>

            <div className="flex justify-center gap-6 text-sm text-text-muted mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-accent" />
                <span>{successOrder.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary" />
                <span>Est. 3-5 business days</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-text-secondary mb-8 px-2">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="uppercase font-medium text-text-primary">{successOrder.payment.method}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 text-[#D4A017]">
                <span>Total Amount</span>
                <span>₹{successOrder.pricing.grandTotal}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Link to={`/track-order/${successOrder.orderId}`} className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-text-primary rounded-xl font-bold transition-colors text-center text-sm">
                  Track Your Order
                </Link>
                <button onClick={() => downloadInvoicePdf(successOrder)} className="flex-1 py-3 px-4 bg-gradient-to-r from-brand-accent to-brand-primary hover:opacity-90 text-white rounded-xl font-bold transition-opacity flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Receipt
                </button>
              </div>
              
              <button onClick={() => navigate('/shop')} className="w-full py-3 px-4 border border-border hover:bg-bg-hover text-text-primary rounded-xl font-bold transition-colors text-sm">
                Continue Shopping
              </button>

              <a href={`https://wa.me/918178823991?text=Hi, I placed order ${successOrder.orderId}.`} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm border border-[#25D366]/20 mt-4">
                <MessageCircle className="w-5 h-5" /> Get updates on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-brand-primary' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-brand-primary bg-brand-primary/20' : 'border-gray-500'}`}>1</div>
            <span className="ml-2 font-bold hidden sm:block">Shipping</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-700'}`} />
          <div className={`flex items-center ${step >= 2 ? 'text-brand-primary' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-brand-primary bg-brand-primary/20' : 'border-gray-500'}`}>2</div>
            <span className="ml-2 font-bold hidden sm:block">Payment</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-brand-primary' : 'bg-gray-700'}`} />
          <div className={`flex items-center ${step >= 3 ? 'text-brand-primary' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-brand-primary bg-brand-primary/20' : 'border-gray-500'}`}>3</div>
            <span className="ml-2 font-bold hidden sm:block">Confirm</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN - Forms */}
          <div className="flex-1">
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">Shipping Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Full Name *</label>
                    <input required type="text" minLength={3} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Phone Number *</label>
                    <input required type="tel" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Email Address *</label>
                  <input required type="email" value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-text-muted">Complete Address *</label>
                    <button type="button" onClick={handleLocationDetect} className="text-brand-accent text-xs flex items-center hover:underline">
                      <MapPin className="w-3 h-3 mr-1" /> Detect My Location
                    </button>
                  </div>
                  <textarea required minLength={10} rows={3} value={shipping.fullAddress} onChange={e => setShipping({...shipping, fullAddress: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">City *</label>
                    <input required type="text" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">State *</label>
                    <select required value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary">
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">PIN Code *</label>
                    <input required type="text" maxLength={6} value={shipping.pincode} onChange={e => setShipping({...shipping, pincode: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Landmark (Optional)</label>
                    <input type="text" value={shipping.landmark} onChange={e => setShipping({...shipping, landmark: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Address Type</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" checked={shipping.type === 'Home'} onChange={() => setShipping({...shipping, type: 'Home'})} className="mr-2 text-brand-primary" /> Home
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" checked={shipping.type === 'Work'} onChange={() => setShipping({...shipping, type: 'Work'})} className="mr-2 text-brand-primary" /> Work
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors flex items-center justify-center">
                    Proceed to Payment <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <button onClick={() => setStep(1)} className="text-sm text-text-muted hover:text-text-primary">Edit Shipping</button>
                </div>

                <div className="space-y-4">
                  <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-primary/5 shadow-[0_0_15px_rgba(196,30,58,0.2)]' : 'border-border hover:border-gray-500'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-4 w-5 h-5 accent-[#C41E3A]" />
                        <div>
                          <p className="font-bold">CASH ON DELIVERY (COD)</p>
                          <p className="text-sm text-text-muted">Pay ₹50 extra COD charges if order below ₹999</p>
                        </div>
                      </div>
                      <span className="bg-gray-800 text-xs px-2 py-1 rounded text-text-secondary">No prepayment needed</span>
                    </div>
                  </label>

                  <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-brand-primary bg-brand-primary/5 shadow-[0_0_15px_rgba(196,30,58,0.2)]' : 'border-border hover:border-gray-500'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mr-4 w-5 h-5 accent-[#C41E3A]" />
                        <div>
                          <p className="font-bold">RAZORPAY — Online Payment</p>
                          <p className="text-sm text-text-muted">Powered by Razorpay. 100% secure SSL encryption.</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] bg-bg-base px-2 py-1 rounded border border-border">UPI</span>
                            <span className="text-[10px] bg-bg-base px-2 py-1 rounded border border-border">Cards</span>
                            <span className="text-[10px] bg-bg-base px-2 py-1 rounded border border-border">NetBanking</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-[#4CAF50]/20 text-[#4CAF50] text-xs px-2 py-1 rounded">Secure & Instant</span>
                    </div>
                  </label>
                </div>

                <div className="pt-6 flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border border-border hover:bg-bg-hover text-text-primary rounded-xl font-bold transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                  <h2 className="text-xl font-bold">Review Order</h2>
                  <button onClick={() => setStep(2)} className="text-sm text-text-muted hover:text-text-primary">Edit Payment</button>
                </div>
                
                <div className="bg-bg-base p-4 rounded-xl border border-border mb-4">
                  <p className="text-text-muted text-sm mb-1">Delivering to:</p>
                  <p className="font-medium">{shipping.name} — {shipping.phone}</p>
                  <p className="text-sm text-text-secondary">{shipping.fullAddress}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
                </div>

                <label className="flex items-start gap-3 mt-6 cursor-pointer">
                  <input type="checkbox" required className="mt-1 accent-[#C41E3A]" />
                  <span className="text-sm text-text-muted">I agree to the Terms & Conditions and Privacy Policy. I confirm all details are correct.</span>
                </label>

                <div className="pt-6 flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border border-border hover:bg-bg-hover text-text-primary rounded-xl font-bold transition-colors">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="flex-[2] py-4 bg-gradient-to-r from-brand-accent to-brand-primary hover:opacity-90 text-white rounded-xl font-bold transition-opacity flex items-center justify-center">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Place Order — ₹${grandTotal}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-bg-elevated p-6 rounded-2xl border border-border sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6 scrollbar-thin">
                {cart.map((item, index) => (
                  <div key={item.id || `cart-item-${index}`} className="flex gap-4 bg-bg-base p-2 rounded-xl border border-border">
                    <div className="w-16 h-16 bg-bg-surface rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.images?.[0] ? (
                        <img referrerPolicy="no-referrer" src={item.images?.[0] || undefined} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Placeholder className="absolute inset-0 w-full h-full border-none p-1 text-[8px]" />
                      )}
                    </div>
                    <div className="flex-1 text-sm flex flex-col justify-center">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-text-muted">Qty: {item.quantity}</p>
                      <p className="text-brand-accent font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 pt-4 border-t border-border">
                <p className="text-sm font-bold text-text-muted mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary uppercase"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-brand-primary text-xs mt-2">{couponError}</p>}
                {appliedCoupon && <p className="text-[#4CAF50] text-xs mt-2 font-bold">Coupon '{appliedCoupon.code}' applied!</p>}
              </div>

              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#4CAF50]">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-[#4CAF50]">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-brand-primary">
                    <span>COD Charges</span>
                    <span>₹{codCharges}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-border mt-2">
                  <span>Grand Total</span>
                  <span className="text-[#D4A017]">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
