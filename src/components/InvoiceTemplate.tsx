import React from 'react';
import { Order } from '../lib/orderService';
import { format } from 'date-fns';

export function InvoiceTemplate({ order }: { order: Order }) {
  return (
    <div className="w-[800px] p-12 font-sans invoice-wrapper" id="invoice-template">
      <style>{`
        .invoice-wrapper {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .invoice-wrapper * {
          border-color: #e5e7eb !important;
          text-decoration-color: transparent !important;
          outline-color: transparent !important;
          box-shadow: none !important;
        }
        .inv-text-primary { color: #C41E3A !important; }
        .inv-text-black { color: #000000 !important; }
        .inv-text-gray-800 { color: #1f2937 !important; }
        .inv-text-gray-600 { color: #4b5563 !important; }
        .inv-text-gray-500 { color: #6b7280 !important; }
        .inv-text-text-muted { color: #9ca3af !important; }
        .inv-bg-gray-50 { background-color: #f9fafb !important; }
        .inv-border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
        .inv-border-b-2 { border-bottom-width: 2px !important; border-bottom-style: solid !important; }
        .inv-border-t { border-top-width: 1px !important; border-top-style: solid !important; }
        .inv-border-t-2 { border-top-width: 2px !important; border-top-style: solid !important; }
        .inv-border { border-width: 1px !important; border-style: solid !important; }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-start inv-border-b-2 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black inv-text-primary tracking-tighter">THE TIKHI</h1>
          <div className="mt-4 text-sm inv-text-gray-600 space-y-1">
            <p className="font-bold inv-text-black">The Tikhi</p>
            <p>D-14, 3rd Floor, Fateh Nagar</p>
            <p>New Delhi - 110018</p>
            <p>Phone: +91 8178823991</p>
            <p>Email: contact@thetikhi.com</p>
            <p className="mt-2 text-xs font-medium inv-text-gray-500">FSSAI: 133259988000037</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold inv-text-gray-800 tracking-tight uppercase">Tax Invoice</h1>
          <div className="mt-4 text-sm space-y-1">
            <p><span className="font-semibold inv-text-gray-600">Invoice No:</span> INV-{order.orderId}</p>
            <p><span className="font-semibold inv-text-gray-600">Date:</span> {format(new Date(order.orderDate), 'dd MMM yyyy')}</p>
            <p><span className="font-semibold inv-text-gray-600">Payment Mode:</span> {order.payment.method.toUpperCase()}</p>
            {order.payment.razorpayPaymentId && (
              <p><span className="font-semibold inv-text-gray-600">Txn ID:</span> {order.payment.razorpayPaymentId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-bold inv-text-text-muted uppercase mb-2">Billed To</h2>
          <div className="text-sm space-y-1">
            <p className="font-bold text-lg inv-text-black">{order.customer.name}</p>
            <p className="inv-text-gray-600">{order.customer.phone}</p>
            <p className="inv-text-gray-600">{order.customer.email}</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold inv-text-text-muted uppercase mb-2">Shipped To</h2>
          <div className="text-sm space-y-1">
            <p className="inv-text-gray-600">{order.customer.address.fullAddress}</p>
            <p className="inv-text-gray-600">{order.customer.address.city}, {order.customer.address.state}</p>
            <p className="inv-text-gray-600">PIN: {order.customer.address.pincode}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-hidden rounded-lg inv-border">
        <table className="w-full text-sm text-left">
          <thead className="inv-bg-gray-50 inv-text-gray-600 font-semibold uppercase text-xs inv-border-b">
            <tr>
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Item Description</th>
              <th className="px-4 py-3">HSN</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="inv-border-b">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium inv-text-black">{item.name}</td>
                <td className="px-4 py-3 inv-text-gray-500">2103</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium inv-text-black">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3 text-sm">
          <div className="flex justify-between inv-text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.pricing.subtotal.toFixed(2)}</span>
          </div>
          {order.pricing.shipping > 0 && (
            <div className="flex justify-between inv-text-gray-600">
              <span>Shipping</span>
              <span>₹{order.pricing.shipping.toFixed(2)}</span>
            </div>
          )}
          {order.pricing.codCharges > 0 && (
            <div className="flex justify-between inv-text-gray-600">
              <span>COD Charges</span>
              <span>₹{order.pricing.codCharges.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold inv-text-black pt-3 inv-border-t-2">
            <span>Grand Total</span>
            <span>₹{order.pricing.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="inv-border-t pt-8 text-center text-sm inv-text-gray-500 space-y-2">
        <p className="font-medium inv-text-gray-800">Thank you for choosing The Tikhi!</p>
        <p>This is a computer-generated invoice and requires no signature.</p>
      </div>
    </div>
  );
}
