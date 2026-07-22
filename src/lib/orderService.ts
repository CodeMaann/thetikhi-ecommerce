export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  mrp: number;
  image: string;
}

export interface Order {
  orderId: string;
  orderDate: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: {
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
      type?: string;
    };
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shipping: number;
    codCharges: number;
    discount: number;
    grandTotal: number;
    offerApplied?: string;
  };
  payment: {
    method: 'razorpay' | 'cod' | 'upi' | 'wallet';
    status: 'paid' | 'pending' | 'failed';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: { status: string; timestamp: string; note: string }[];
  tracking?: {
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
  };
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  estimatedDelivery: string;
  receiptUrl: string;
}

