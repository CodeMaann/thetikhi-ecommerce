import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function ShippingPolicy() {
  return (
    <div className="bg-bg-base min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DRAFT — client should review/confirm processing times and coverage areas before this goes live */}
        <div className="text-center mb-12">
          <Truck className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-4">
            Shipping Policy
          </h1>
          <p className="text-text-muted">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert prose-brand max-w-none text-text-secondary">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Delivery Areas</h2>
            <p className="mb-4">
              We proudly offer Pan-India shipping. We strive to deliver our authentic homemade spices to as many pincodes across India as supported by our courier partners.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Order Processing Time</h2>
            <p className="mb-4">
              All orders are freshly packed and processed for dispatch within <strong>1 to 2 business days</strong> (excluding weekends and public holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Estimated Delivery Times</h2>
            <p className="mb-4">
              Once dispatched, the delivery timeline depends on your location and the specific courier service handling your package. Standard delivery typically takes between <strong>3 to 7 business days</strong>.
            </p>
            <p className="mb-4">
              You can monitor the live progress of your shipment at any time using the AWB number provided in your shipping confirmation email by visiting our <Link to="/track-order" className="text-brand-primary hover:underline">Track Order</Link> page.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Shipping Charges</h2>
            <p className="mb-4">
              Shipping charges for your order will be calculated and displayed at checkout. We currently offer <strong>Free Shipping</strong> on all orders above ₹1000. For orders below this amount, a standard shipping rate will be applied based on your delivery address.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Unforeseen Delays</h2>
            <p className="mb-4">
              While we and our shipping partners do our best to ensure timely delivery, we cannot be held liable for delays caused by circumstances beyond our control. This includes severe weather conditions, natural disasters, courier strikes, or logistical disruptions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Items Damaged in Transit</h2>
            <p className="mb-4">
              We take great care in securely packaging our products. However, if your order arrives damaged, please do not accept the package if the damage is apparent from the outside. If you discover damage after opening, please refer to our <Link to="/refund-policy" className="text-brand-primary hover:underline">Refund Policy</Link> for instructions on how to report the issue within 24-48 hours.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Incorrect Shipping Addresses</h2>
            <p className="mb-4">
              Please ensure that your delivery address and contact number are accurate during checkout. We are not responsible for packages that are delayed, lost, or returned due to incorrect or incomplete information provided by the customer. If a package is returned to us for this reason, additional shipping charges may apply to resend it.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or concerns regarding the shipping of your order, please reach out via our <Link to="/contact" className="text-brand-primary hover:underline">Contact Us</Link> page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
