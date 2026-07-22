import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="bg-bg-base min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <ShieldCheck className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-4">
            Terms of Service
          </h1>
          <p className="text-text-muted">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert prose-brand max-w-none text-text-secondary">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing, browsing, or using our website and placing orders, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website. You must be at least the age of majority in your jurisdiction to make purchases on this site, or have the consent and supervision of a parent or legal guardian.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Products and Orders</h2>
            <p className="mb-4">
              We make every reasonable effort to ensure that product descriptions, images, and pricing are accurate. However, because our products are homemade and packed in batches, natural variations in appearance, color, and packaging may occur. All orders are subject to acceptance and availability. We reserve the right to cancel, refuse, or limit any order at our sole discretion, including in the event of suspected fraud or pricing errors.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Pricing and Payments</h2>
            <p className="mb-4">
              All prices are listed in Indian Rupees (INR) and are subject to change without prior notice. The price charged will be the price in effect at the time the order is placed. We accept various payment methods as presented during checkout. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Shipping and Delivery</h2>
            <p className="mb-4">
              Dispatch and delivery timelines provided are estimates only and are not guaranteed. Delivery times may vary depending on your location, courier performance, holidays, and weather conditions. We are not liable for any delays in delivery caused by third-party courier services or circumstances beyond our control.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Returns and Refunds</h2>
            <p className="mb-4">
              Due to the perishable and hygienic nature of food products, our items are generally non-returnable once delivered. Exceptions are strictly limited to cases where the product is damaged, defective, expired on arrival, or incorrect. Such issues must be reported to us within 24-48 hours of delivery with photographic evidence. For full details, please review our <Link to="/refund-policy" className="text-brand-primary hover:underline">Refund Policy</Link>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Product Storage and Usage</h2>
            <p className="mb-4">
              Products must be stored and used in accordance with the instructions provided on the packaging (e.g., storing in a cool, dry place or refrigerating after opening). We are not liable for any spoilage, degradation of quality, or adverse effects resulting from improper storage or handling after the product has been delivered.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Allergies and Ingredients</h2>
            <p className="mb-4">
              We urge all customers to carefully read ingredient labels before consuming our products. If you have specific food sensitivities or allergies, we recommend consulting a healthcare professional before use. We cannot guarantee our products are entirely free from trace allergens, and we are not liable for any allergic reactions that may occur.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Intellectual Property</h2>
            <p className="mb-4">
              All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of The Tikhi and is protected by applicable intellectual property laws. You may not reproduce, distribute, or otherwise use any of our content without our express prior written permission.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">9. User Conduct</h2>
            <p className="mb-4">
              You agree not to use our website for any unlawful purpose or in any way that could damage, disable, overburden, or impair the site. You must not attempt to gain unauthorized access to any part of the website or any systems or networks connected to the website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, The Tikhi and its affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of, or inability to use, this website or our products. Our total liability to you for any damages shall not exceed the amount paid by you for the specific product in question.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">11. Privacy</h2>
            <p className="mb-4">
              Your submission of personal information through the store is governed by our Privacy Policy. By using our site, you consent to our collection and use of personal data as outlined in our <Link to="/privacy-policy" className="text-brand-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">12. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to update, modify, or replace any part of these Terms of Service at any time by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">13. Governing Law</h2>
            <p className="mb-4">
              {/* NOTE FOR CLIENT: Please replace [City/State] with your actual jurisdiction */}
              These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of India, with jurisdiction in [City/State], India.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">14. Contact Information</h2>
            <p className="mb-4">
              Questions about the Terms of Service should be sent to us via our <Link to="/contact" className="text-brand-primary hover:underline">Contact Us</Link> page or by emailing support@thetikhi.com.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
