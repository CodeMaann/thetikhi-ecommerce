import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../lib/orderService';
import { Search, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { downloadInvoicePdf } from '../lib/pdfService';

export function MyOrders() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('All');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      try {
        const res = await fetch(`/api/orders/lookup?phone=${phone}`);
        if (res.ok) {
          const found = await res.json();
          setOrders(found);
          setSearched(true);
        } else {
          setOrders([]);
          setSearched(true);
        }
      } catch (e) {
        setOrders([]);
        setSearched(true);
      }
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'shipped':
      case 'out_for_delivery': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base pt-32 pb-20 px-4 text-text-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">My Orders</h1>

        {!searched ? (
          <div className="max-w-md mx-auto bg-bg-elevated border border-border rounded-2xl p-8 text-center">
            <p className="text-text-muted mb-6">Enter your registered mobile number to view your past orders.</p>
            <form onSubmit={handleSearch} className="space-y-4">
              <input required type="tel" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary text-center text-lg tracking-widest" />
              <button type="submit" className="w-full py-4 bg-brand-primary hover:bg-[#A01830] text-white rounded-xl font-bold transition-colors flex justify-center items-center">
                <Search className="w-5 h-5 mr-2" /> View Orders
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <p className="text-text-muted">Showing orders for <span className="text-text-primary font-bold">{phone}</span></p>
              
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-brand-primary text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary border border-border'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-bg-elevated border border-border rounded-2xl">
                <p className="text-text-muted mb-4">No orders found.</p>
                <Link to="/shop" className="text-brand-primary hover:underline font-medium">Browse Shop</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map(order => (
                  <div key={order.orderId} className="bg-bg-elevated border border-border rounded-2xl p-6 transition-all hover:border-gray-500">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-[#D4A017]">{order.orderId}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted">Placed on {format(new Date(order.orderDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-text-muted">Total Amount</p>
                        <p className="text-xl font-bold">₹{order.pricing.grandTotal}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex gap-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-16 h-16 bg-bg-base rounded-lg border border-border overflow-hidden" title={item.name}>
                            <img referrerPolicy="no-referrer" src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-16 h-16 bg-bg-base rounded-lg border border-border flex items-center justify-center text-sm text-text-muted">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Link to={`/track-order/${order.orderId}`} className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-center">
                          Track
                        </Link>
                        <button onClick={() => downloadInvoicePdf(order)} className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-center">
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
