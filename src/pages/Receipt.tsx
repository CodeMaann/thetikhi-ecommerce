import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../lib/orderService';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { Placeholder } from '../components/Placeholder';
import { downloadInvoicePdf } from '../lib/pdfService';

export function Receipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data) setOrder(data);
        });
    }
  }, [orderId]);

  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  const handlePrint = async () => {
    // We use the new background pdf generator here too, for consistency.
    await downloadInvoicePdf(order);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8 px-4 font-sans print:p-0 print:bg-white print:block">
      <div className="w-full max-w-[800px] bg-white text-black p-8 md:p-12 shadow-lg print:shadow-none print:w-full print:max-w-none">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
          <div>
            <Placeholder text="Logo" className="w-32 h-10 border-none bg-transparent" />
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p className="font-bold text-black">The Tikhi</p>
              <p>D-14, 3rd Floor, Fateh Nagar</p>
              <p>New Delhi - 110018</p>
              <p>Phone: +91 8178823991</p>
              <p>Email: contact@thetikhi.com</p>
              <p className="mt-2 text-xs">FSSAI: 133259988000037</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight uppercase">Tax Invoice</h1>
            <div className="mt-4 text-sm space-y-1">
              <p><span className="font-semibold text-gray-600">Invoice No:</span> {order.orderId}</p>
              <p><span className="font-semibold text-gray-600">Date:</span> {format(new Date(order.orderDate), 'dd MMM yyyy')}</p>
              <p><span className="font-semibold text-gray-600">Payment Mode:</span> {order.payment.method.toUpperCase()}</p>
              {order.payment.razorpayPaymentId && (
                <p><span className="font-semibold text-gray-600">Txn ID:</span> {order.payment.razorpayPaymentId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-sm font-bold text-text-muted uppercase mb-2">Billed To</h2>
            <div className="text-sm space-y-1">
              <p className="font-bold text-lg">{order.customer.name}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.email}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-muted uppercase mb-2">Shipped To</h2>
            <div className="text-sm space-y-1">
              <p>{order.customer.address.fullAddress}</p>
              <p>{order.customer.address.city}, {order.customer.address.state}</p>
              <p>PIN: {order.customer.address.pincode}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">HSN</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">2103</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.pricing.subtotal.toFixed(2)}</span>
            </div>
            {order.pricing.shipping > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{order.pricing.shipping.toFixed(2)}</span>
              </div>
            )}
            {order.pricing.codCharges > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>COD Charges</span>
                <span>₹{order.pricing.codCharges.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold text-black pt-3 border-t-2 border-gray-200">
              <span>Grand Total</span>
              <span>₹{order.pricing.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-800">Thank you for choosing The Tikhi!</p>
          <p>This is a computer-generated invoice and requires no signature.</p>
        </div>
        
        <div className="mt-8 text-center print:hidden">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
            <Printer className="w-5 h-5" /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
