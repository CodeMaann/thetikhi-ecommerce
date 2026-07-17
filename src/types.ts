export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  weight: string;
  images: string[];
  image?: string;
  ingredients: string;
  nutrition: string;
  stock: number;
  baseProductName?: string;
  status: 'active' | 'inactive';
  variantType?: 'single' | 'combo' | string;
  comboItems?: { baseProductName: string; quantity: number }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  orderId?: string;
  customerName: string;
  address: string;
  phone: string;
  paymentMethod: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  date: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  tracking?: any;
  statusHistory?: any[];
  customer?: any;
  pricing?: any;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  active: boolean;
  expiresAt?: string;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
}

export interface User {
  id?: string;
  email: string;
  name?: string;
  role: 'admin' | 'customer';
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
}
