import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Search, Eye, Filter, ArrowRightLeft, Edit, Trash2, Plus, Image as ImageIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageCropper } from '../components/ImageCropper';
import { Order } from '../lib/orderService';
import { Product, Coupon } from '../types';
import { downloadInvoicePdf } from '../lib/pdfService';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export function Admin() {
  const navigate = useNavigate();
  const { user, token } = useStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [courier, setCourier] = useState('');

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialProductForm = {
    name: '', description: '', price: 0, originalPrice: 0, discount: 0,
    weight: '', images: [], image: '', ingredients: '', nutrition: '', stock: 0, status: 'active' as 'active' | 'inactive'
  };
  const [productForm, setProductForm] = useState<Omit<Product, "id">>(initialProductForm);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const initialCouponForm = {
    code: '', type: 'percentage' as const, value: 0,
    minOrderValue: 0, usageLimit: 0, expiresAt: ''
  };
  const [couponForm, setCouponForm] = useState<any>(initialCouponForm);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      toast.error('Access denied, please login as admin');
      return;
    }
    loadOrders();
    loadProducts();
    loadCoupons();
  }, [user, navigate, token]);

  const loadOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCoupons = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Orders Logic ---
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Status updated');
        loadOrders();
        if (selectedOrder?.orderId === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const updateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      try {
        const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}/tracking`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ courier, trackingNo })
        });
        
        if (res.ok) {
          toast.success('Tracking updated');
          loadOrders();
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      } catch (err) {
        toast.error('Failed to update tracking');
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customer.phone.includes(searchTerm) || 
                          o.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((acc, curr) => acc + curr.pricing.grandTotal, 0),
    pending: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length
  };

  // --- Products Logic ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.price < 0) {
      toast.error('Price cannot be negative'); return;
    }
    if (productForm.stock < 0) {
      toast.error('Stock cannot be negative'); return;
    }
    
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(productForm)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }
      
      toast.success(isEdit ? 'Product updated' : 'Product created');
      await loadProducts();

      if (isEdit) {
        const updatedRes = await fetch(`/api/products/${editingProduct.id}`);
        if (updatedRes.ok) {
          const updatedProduct = await updatedRes.json();
          setEditingProduct(updatedProduct);
          setProductForm(updatedProduct);
        }
      } else {
        setShowProductModal(false);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Product deleted');
        loadProducts();
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm(initialProductForm);
    }
    setShowProductModal(true);
  };

  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), croppedImage]
    }));
    setCropImageSrc(null);
  };

  const handleRemoveImage = (index: number) => {
    setProductForm(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setProductForm(prev => {
      const newImages = [...(prev.images || [])];
      if (direction === 'up' && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return { ...prev, images: newImages };
    });
  };

  // --- Coupons Logic ---
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponForm.value <= 0) {
      toast.error('Value must be greater than 0'); return;
    }
    try {
      const isEdit = !!coupons.find(c => c.code === couponForm.code && showCouponModal);
      const url = isEdit ? `/api/admin/coupons/${couponForm.code}` : '/api/admin/coupons';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(couponForm)
      });
      
      if (!res.ok) throw new Error('Failed to save coupon');
      
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created');
      setShowCouponModal(false);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleCouponStatus = async (code: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (res.ok) {
        toast.success('Coupon status updated');
        loadCoupons();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteCoupon = async (code: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Coupon deleted');
        loadCoupons();
      }
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20 px-4 text-text-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <div className="flex bg-bg-elevated border border-border rounded-lg p-1 w-full md:w-auto overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex-1 md:flex-none ${activeTab === 'orders' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex-1 md:flex-none ${activeTab === 'products' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setActiveTab('coupons')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex-1 md:flex-none ${activeTab === 'coupons' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Coupons
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><Package className="w-6 h-6" /></div>
                <div><p className="text-text-muted text-sm">Total Orders</p><p className="text-2xl font-bold">{stats.total}</p></div>
              </div>
              <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                <div><p className="text-text-muted text-sm">Total Revenue</p><p className="text-2xl font-bold text-[#D4A017]">₹{stats.revenue}</p></div>
              </div>
              <div className="bg-bg-elevated border border-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-brand-primary transition-colors" onClick={() => setStatusFilter('confirmed')}>
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center"><Truck className="w-6 h-6" /></div>
                <div><p className="text-text-muted text-sm">Pending Action</p><p className="text-2xl font-bold text-brand-accent">{stats.pending}</p></div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" placeholder="Search by ID, Phone, Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary text-text-primary" />
              </div>
              <div className="relative md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary text-text-primary appearance-none">
                  <option value="All">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-bg-elevated border border-border rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-base border-b border-border text-text-muted uppercase">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found</td></tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.orderId} className="hover:bg-bg-hover transition-colors">
                        <td className="px-6 py-4 font-bold text-[#D4A017]">{order.orderId}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-primary">{order.customer.name}</p>
                          <p className="text-xs text-text-muted">{order.customer.phone}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">₹{order.pricing.grandTotal}</td>
                        <td className="px-6 py-4 text-text-muted capitalize">{order.payment.method}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.orderId, e.target.value)}
                            className={`bg-bg-base border border-border rounded px-2 py-1 text-xs font-bold capitalize outline-none cursor-pointer
                              ${order.status === 'delivered' ? 'text-green-500' : order.status === 'shipped' ? 'text-blue-500' : 'text-yellow-500'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-brand-primary/20 hover:text-brand-primary rounded transition-colors" title="View Details">
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'products' ? (
          <>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => openProductModal()} 
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[#A01830] text-white rounded-lg font-bold transition-colors"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>
            
            {/* Products Table */}
            <div className="bg-bg-elevated border border-border rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-base border-b border-border text-text-muted uppercase">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found</td></tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-bg-hover transition-colors">
                        <td className="px-6 py-4">
                          {product.images?.[0] ? (
                            <img src={product.images?.[0] || undefined} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-border" />
                          ) : (
                            <div className="w-12 h-12 bg-bg-elevated rounded-lg flex items-center justify-center text-gray-500 border border-dashed border-gray-600 text-[10px] text-center">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">{product.name}</td>
                        <td className="px-6 py-4 font-bold text-[#D4A017]">₹{product.price}</td>
                        <td className="px-6 py-4">{product.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openProductModal(product)} className="p-2 hover:bg-blue-500/20 hover:text-blue-500 rounded transition-colors" title="Edit Product">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors" title="Delete Product">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'coupons' ? (
          <>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => {
                  setCouponForm(initialCouponForm);
                  setShowCouponModal(true);
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[#A01830] text-white rounded-lg font-bold transition-colors"
              >
                <Plus className="w-5 h-5" /> Generate Coupon
              </button>
            </div>
            
            {/* Coupons Table */}
            <div className="bg-bg-elevated border border-border rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-base border-b border-border text-text-muted uppercase">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Usage</th>
                    <th className="px-6 py-4">Expires</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {coupons.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No coupons generated</td></tr>
                  ) : (
                    coupons.map(coupon => (
                      <tr key={coupon.code} className="hover:bg-bg-hover transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-2">
                          {coupon.code}
                          <button onClick={() => copyToClipboard(coupon.code)} className="text-text-muted hover:text-text-primary" title="Copy code">
                            <ArrowRightLeft className="w-4 h-4" /> 
                          </button>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#D4A017]">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleCouponStatus(coupon.code, coupon.active)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${coupon.active ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-gray-500/20 text-text-muted hover:bg-gray-500/30'}`}
                          >
                            {coupon.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-muted">
                            {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-muted">
                            {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM dd, yyyy') : 'No expiry'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setCouponForm(coupon); setShowCouponModal(true); }} className="p-2 hover:bg-blue-500/20 hover:text-blue-500 rounded transition-colors" title="Edit Coupon">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteCoupon(coupon.code)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors" title="Delete Coupon">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-bg-elevated z-10">
              <h2 className="text-xl font-bold">Order Details: {selectedOrder.orderId}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-text-primary">&times; Close</button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-text-muted mb-2 uppercase">Customer & Shipping</h3>
                <p className="text-sm text-text-secondary">
                  <span className="text-text-primary font-medium block mb-1">{selectedOrder.customer.name}</span>
                  {selectedOrder.customer.phone} <br/>
                  {selectedOrder.customer.email} <br/><br/>
                  {selectedOrder.customer.address.fullAddress}<br/>
                  {selectedOrder.customer.address.city}, {selectedOrder.customer.address.state} - {selectedOrder.customer.address.pincode}
                </p>

                <h3 className="text-sm font-bold text-text-muted mt-6 mb-2 uppercase">Payment Info</h3>
                <p className="text-sm text-text-secondary">
                  Method: <span className="uppercase text-text-primary">{selectedOrder.payment.method}</span><br/>
                  Status: <span className="uppercase text-text-primary">{selectedOrder.payment.status}</span><br/>
                  {selectedOrder.payment.razorpayPaymentId && (
                    <span className="text-xs text-gray-500">Txn: {selectedOrder.payment.razorpayPaymentId}</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text-muted mb-2 uppercase">Order Summary</h3>
                <div className="space-y-3 mb-6 bg-bg-base p-4 rounded-xl border border-border">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-text-secondary">{item.name} x {item.quantity}</span>
                      <span className="text-text-primary">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 font-bold flex justify-between">
                    <span>Grand Total</span>
                    <span className="text-[#D4A017]">₹{selectedOrder.pricing.grandTotal}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-muted mb-2 uppercase">Tracking & Shipping</h3>
                {(selectedOrder.shiprocketOrderId || selectedOrder.shiprocketShipmentId) && (
                  <div className="bg-[#f0f7ff] p-4 rounded-xl border border-blue-200 text-sm mb-4">
                    <p className="text-blue-700 font-bold mb-1 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      Tracking updates automatically via Shiprocket
                    </p>
                    {selectedOrder.shiprocketOrderId && <p className="text-blue-900/70">Shiprocket Order ID: {selectedOrder.shiprocketOrderId}</p>}
                    {selectedOrder.shiprocketShipmentId && <p className="text-blue-900/70">Shipment ID: {selectedOrder.shiprocketShipmentId}</p>}
                  </div>
                )}
                
                {selectedOrder.status === 'shipped' || selectedOrder.tracking?.trackingNumber ? (
                  <div className="bg-bg-base p-4 rounded-xl border border-green-500/20 text-sm mb-4">
                    <p className="text-green-500 font-bold mb-1">Shipped</p>
                    <p className="text-text-secondary">Courier: {selectedOrder.tracking?.courierName}</p>
                    <p className="text-text-secondary">Tracking: {selectedOrder.tracking?.trackingNumber}</p>
                  </div>
                ) : null}

                <details className="text-sm group mt-4">
                  <summary className="cursor-pointer text-text-secondary hover:text-brand-primary font-medium mb-2 outline-none">
                    Manual Tracking Override
                  </summary>
                  <form onSubmit={updateTracking} className="space-y-3 pt-2">
                    <input type="text" required placeholder="Courier Name (e.g. Delhivery)" value={courier} onChange={e => setCourier(e.target.value)} className="w-full bg-bg-base border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" />
                    <input type="text" required placeholder="Tracking Number" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className="w-full bg-bg-base border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" />
                    <button type="submit" className="w-full py-2 bg-brand-primary hover:bg-[#A01830] text-white rounded text-sm font-bold transition-colors">Mark as Shipped (Manual Override)</button>
                  </form>
                </details>
              </div>
            </div>
            
            <div className="p-6 border-t border-border bg-bg-base flex flex-wrap gap-4 mt-auto">
              <button onClick={() => downloadInvoicePdf(selectedOrder)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-medium text-sm transition-colors">Print Invoice</button>
              <a href={`https://wa.me/91${selectedOrder.customer.phone}?text=Hi ${selectedOrder.customer.name}, your order ${selectedOrder.orderId} status is now ${selectedOrder.status}.`} target="_blank" className="px-4 py-2 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded font-medium text-sm transition-colors">WhatsApp Customer</a>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-bg-elevated z-10">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-text-muted hover:text-text-primary">&times; Close</button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Product Name *</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Weight * (e.g. 250g)</label>
                  <input type="text" required value={productForm.weight} onChange={e => setProductForm({...productForm, weight: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Price (₹) *</label>
                  <input type="number" required min="0" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value), discount: productForm.originalPrice > Number(e.target.value) ? Math.round(((productForm.originalPrice - Number(e.target.value)) / productForm.originalPrice) * 100) : productForm.discount})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Original Price (₹)</label>
                  <input type="number" min="0" value={productForm.originalPrice || ''} onChange={e => setProductForm({...productForm, originalPrice: Number(e.target.value), discount: Number(e.target.value) > productForm.price ? Math.round(((Number(e.target.value) - productForm.price) / Number(e.target.value)) * 100) : productForm.discount})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Discount (%)</label>
                  <input type="number" min="0" value={productForm.discount || ''} onChange={e => setProductForm({...productForm, discount: Number(e.target.value)})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Stock *</label>
                  <input type="number" required min="0" value={productForm.stock || ''} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-text-primary">
                      Product Photos (recommended: at least 4, first photo is the main image shown in listings)
                    </label>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(productForm.images || []).map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-bg-surface">
                          <img src={img || undefined} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          
                          {i === 0 && (
                            <div className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm z-10">
                              Main
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleMoveImage(i, 'up')} disabled={i === 0} className="p-1.5 text-white disabled:opacity-30 hover:bg-white/20 rounded-md transition-colors bg-black/40">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => handleMoveImage(i, 'down')} disabled={i === (productForm.images?.length || 0) - 1} className="p-1.5 text-white disabled:opacity-30 hover:bg-white/20 rounded-md transition-colors bg-black/40">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => handleRemoveImage(i)} className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors bg-black/40">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {Array.from({ length: Math.max(4 - (productForm.images || []).length, 1) }).map((_, i) => (
                        <button
                          key={`empty-${i}`}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="relative rounded-xl border-2 border-dashed border-border hover:border-brand-primary/50 aspect-square bg-bg-surface hover:bg-bg-elevated transition-colors flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-primary group"
                        >
                          <Plus className="w-8 h-8 text-text-muted group-hover:text-brand-primary transition-colors" />
                          <span className="text-sm font-medium">Add Photo</span>
                        </button>
                      ))}
                    </div>
                    
                    {cropImageSrc && (
                      <ImageCropper
                        imageSrc={cropImageSrc}
                        onCropComplete={handleCropComplete}
                        onCancel={() => setCropImageSrc(null)}
                      />
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-text-muted mb-1">Description</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-muted mb-1">Ingredients (comma separated)</label>
                  <input type="text" value={productForm.ingredients} onChange={e => setProductForm({...productForm, ingredients: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-text-muted mb-1">Nutrition Info</label>
                  <input type="text" value={productForm.nutrition} onChange={e => setProductForm({...productForm, nutrition: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                </div>

                
                <div>
                  <label className="block text-sm text-text-muted mb-1">Base Product Name (for variants)</label>
                  <input type="text" value={productForm.baseProductName || ''} onChange={e => setProductForm({...productForm, baseProductName: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" placeholder="e.g. Mango Pickle" />
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Status</label>
                  <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value as 'active'|'inactive'})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-2 border border-border text-text-primary rounded-lg font-bold hover:bg-bg-hover transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-brand-primary hover:bg-[#A01830] text-white rounded-lg font-bold transition-colors">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Add/Edit Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-border rounded-2xl w-full max-w-xl flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{couponForm.code && coupons.some(c => c.code === couponForm.code) ? 'Edit Coupon' : 'Generate Coupon'}</h2>
              <button onClick={() => setShowCouponModal(false)} className="text-text-muted hover:text-text-primary">&times; Close</button>
            </div>
            
            <form onSubmit={handleCouponSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Coupon Code (Leave empty to auto-generate)</label>
                  <input type="text" placeholder="e.g. SUMMER50" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary uppercase" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Type *</label>
                    <select value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value as 'percentage' | 'flat'})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Value *</label>
                    <input type="number" required min="1" value={couponForm.value || ''} onChange={e => setCouponForm({...couponForm, value: Number(e.target.value)})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Min. Order Value (Optional)</label>
                    <input type="number" min="0" placeholder="e.g. 500" value={couponForm.minOrderValue || ''} onChange={e => setCouponForm({...couponForm, minOrderValue: Number(e.target.value)})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Usage Limit (Optional)</label>
                    <input type="number" min="1" placeholder="e.g. 100" value={couponForm.usageLimit || ''} onChange={e => setCouponForm({...couponForm, usageLimit: Number(e.target.value)})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Expires At (Optional)</label>
                  <input type="date" value={couponForm.expiresAt ? couponForm.expiresAt.split('T')[0] : ''} onChange={e => setCouponForm({...couponForm, expiresAt: e.target.value})} className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary [color-scheme:dark]" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setShowCouponModal(false)} className="px-6 py-2 border border-border text-text-primary rounded-lg font-bold hover:bg-bg-hover transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-brand-primary hover:bg-[#A01830] text-white rounded-lg font-bold transition-colors">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

