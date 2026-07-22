import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';

export function RefundPolicy() {
  return (
    <div className="bg-bg-base min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <RefreshCcw className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-text-muted">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert prose-brand max-w-none text-text-secondary">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Order Cancellations</h2>
            <p className="mb-4">
              We understand that plans can change. You may cancel your order for a full refund <strong>only before it has been dispatched</strong>. Please contact us immediately if you wish to cancel. Once an order has been handed over to our shipping partners, it cannot be cancelled or recalled.
            </p>
            <p className="mb-4">
              We reserve the right to cancel any order from our end due to product unavailability, payment processing issues, or incomplete/incorrect shipping details provided by the customer. In such cases, you will receive a full refund.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Non-Returnable Nature of Products</h2>
            <p className="mb-4">
              Because our products are consumable food items, they are strictly non-returnable once delivered to ensure hygiene and safety standards. We do not accept returns or exchanges for food products that have left our facility.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Exceptions (When Refunds or Replacements Apply)</h2>
            <p className="mb-4">
              While general returns are not accepted, we stand by the quality of our products. You may be eligible for a refund or a replacement under the following specific circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Damaged Product:</strong> The product arrived physically damaged or broken in transit.</li>
              <li><strong>Incorrect Item:</strong> You received a product different from what you ordered.</li>
              <li><strong>Quality Issues:</strong> The product received was expired or unfit for consumption upon arrival.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Process for Claiming a Refund or Replacement</h2>
            <p className="mb-4">
              If you experience any of the eligible issues above, you must report it to us within <strong>24 to 48 hours of delivery</strong>. To initiate a claim:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Contact us immediately via our <Link to="/contact" className="text-brand-primary hover:underline">Contact Us</Link> page.</li>
              <li>Provide your Order ID and contact details.</li>
              <li>Include clear photographs or a short video showing the damaged product, the incorrect item, and the original packaging.</li>
            </ol>
            <p className="mb-4">
              Our team will review your claim. Unsupported claims lacking sufficient evidence (such as missing photos) may be declined. We reserve the right to determine the validity of the claim.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Refund Timeline</h2>
            <p className="mb-4">
              Once your refund claim is approved by our team, the refund will be processed within <strong>5 to 7 working days</strong>. The amount will be credited back to your original method of payment or transferred to your bank account, depending on the payment gateway's standard procedures.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Non-Refundable Cases</h2>
            <p className="mb-4">
              Please note that we cannot offer refunds, returns, or replacements in the following scenarios:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Change of mind after the order has been dispatched.</li>
              <li>Personal taste or preference mismatch (e.g., finding a product too spicy or not to your liking).</li>
              <li>Delays in delivery caused by the courier service.</li>
              <li>Orders that could not be delivered because you provided an incorrect or incomplete shipping address.</li>
              <li>Spoilage or quality degradation resulting from improper storage or handling after the product was successfully delivered to you.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Replacements</h2>
            <p className="mb-4">
              For eligible claims (such as damaged or incorrect items), we may offer a replacement of the product instead of a refund, subject to inventory availability and your preference.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our Refund & Cancellation Policy, or if you need to report an issue with your order, please reach out through our <Link to="/contact" className="text-brand-primary hover:underline">Contact Us</Link> page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
