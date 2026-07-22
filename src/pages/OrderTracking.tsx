import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../lib/orderService';
import { Search, Package, Truck, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { downloadInvoicePdf } from '../lib/pdfService';

export function OrderTracking() {
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [orderIdInput, setOrderIdInput] = useState(paramOrderId || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // If orderId is provided in URL, we don't strictly require phone if we just want to show basic tracking,
    // but for security, usually we require both. For this demo, let's just fetch it.
    if (paramOrderId) {
      setLoading(true);
      fetch(`/api/orders/${paramOrderId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setOrder(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [paramOrderId]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/orders/${orderIdInput}`);
      if (res.ok) {
        const foundOrder = await res.json();
        setOrder(foundOrder);
        setError('');
      } else {
        setError('Order not found. Please check your Order ID.');
        setOrder(null);
      }
    } catch (err) {
      setError('Order not found. Please check your Order ID.');
      setOrder(null);
    }
  };

  const steps = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const stepLabels = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -1;
    return steps.indexOf(order.status);
  };

  return (
    <div className="min-h-screen bg-bg-base pt-32 pb-20 px-4 text-text-primary">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-text-muted">Enter your order ID and phone number to see the latest updates.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-bg-elevated border border-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-muted mb-2">Order ID</label>
            <input required type="text" placeholder="TIKHI-XXXXX" value={orderIdInput} onChange={e => setOrderIdInput(e.target.value)} className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary uppercase text-text-primary" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-muted mb-2">Phone Number</label>
            <input required type="tel" placeholder="10-digit mobile number" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary text-text-primary" />
          </div>
          <button type="submit" className="w-full md:w-auto px-8 py-3 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors flex justify-center items-center h-[50px]">
            <Search className="w-5 h-5 mr-2" /> Track
          </button>
        </form>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8 text-center">{error}</div>}

        {order && (
          <div className="bg-bg-elevated border border-border rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4A017]">{order.orderId}</h2>
                  <p className="text-text-muted text-sm mt-1">Placed on {format(new Date(order.orderDate), 'dd MMM yyyy')}</p>
                </div>
                {order.status === 'cancelled' ? (
                  <span className="mt-2 sm:mt-0 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold border border-red-500/20">Cancelled</span>
                ) : (
                  <span className="mt-2 sm:mt-0 px-3 py-1 bg-[#4CAF50]/20 text-[#4CAF50] rounded-full text-sm font-bold border border-[#4CAF50]/20">Estimated Delivery: {format(new Date(order.estimatedDelivery), 'dd MMM')}</span>
                )}
              </div>

              {/* Timeline */}
              {order.status !== 'cancelled' && (
                <div className="relative pl-4 sm:pl-0 mt-8 mb-4">
                  {/* Vertical Line for mobile, Horizontal for desktop */}
                  <div className="absolute left-[27px] sm:left-0 top-0 bottom-0 w-0.5 sm:w-full sm:h-0.5 sm:top-5 bg-[#27272A] z-0" />
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-4 relative z-10">
                    {steps.map((stepName, idx) => {
                      const isCompleted = getCurrentStepIndex() >= idx;
                      const isCurrent = getCurrentStepIndex() === idx;
                      const historyEntry = order.statusHistory.find(h => h.status === stepName);
                      
                      let Icon = Package;
                      if (stepName === 'shipped') Icon = Truck;
                      if (stepName === 'delivered') Icon = CheckCircle2;

                      return (
                        <div key={stepName} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center w-full sm:w-1/5 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-bg-elevated z-10 shrink-0
                            ${isCompleted ? 'border-brand-primary text-brand-primary' : 'border-border text-gray-600'}
                            ${isCurrent ? 'shadow-[0_0_15px_rgba(196,30,58,0.5)] scale-110' : ''}
                          `}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                          </div>
                          
                          <div className="flex-1 sm:flex-none">
                            <p className={`font-bold text-sm ${isCompleted ? 'text-text-primary' : 'text-gray-500'}`}>{stepLabels[idx]}</p>
                            {historyEntry && (
                              <p className="text-xs text-text-muted mt-1">{format(new Date(historyEntry.timestamp), 'dd MMM, hh:mm a')}</p>
                            )}
                            {isCurrent && historyEntry?.note && (
                              <p className="text-xs text-brand-accent mt-1 line-clamp-2">{historyEntry.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {order.tracking && order.tracking.trackingNumber && (
                <div className="mt-8 p-4 bg-bg-base border border-border rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-text-muted">Courier: <span className="text-text-primary font-medium">{order.tracking.courierName}</span></p>
                    <p className="text-sm text-text-muted">Tracking Number: <span className="text-text-primary font-medium">{order.tracking.trackingNumber}</span></p>
                  </div>
                  {order.tracking.trackingUrl && (
                    <a href={order.tracking.trackingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                      Track on Courier Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Order Details Accordion */}
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-6 hover:bg-bg-hover transition-colors">
              <span className="font-bold">View Order Details</span>
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {expanded && (
              <div className="p-6 border-t border-border bg-bg-base">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-text-muted mb-2 uppercase">Shipping Address</h3>
                    <p className="text-sm text-text-secondary">
                      <span className="text-text-primary font-medium block mb-1">{order.customer.name}</span>
                      {order.customer.address.fullAddress}<br/>
                      {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-muted mb-2 uppercase">Payment Details</h3>
                    <p className="text-sm text-text-secondary capitalize">Method: {order.payment.method}</p>
                    <p className="text-sm text-text-secondary capitalize">Status: {order.payment.status}</p>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-text-muted mb-4 uppercase">Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-bg-elevated p-3 rounded-xl">
                      <img referrerPolicy="no-referrer" src={item.image || undefined} alt={item.name} className="w-12 h-12 rounded object-cover bg-bg-surface" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-brand-accent">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button onClick={() => downloadInvoicePdf(order)} className="text-brand-primary hover:underline text-sm font-medium">Download Invoice</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
