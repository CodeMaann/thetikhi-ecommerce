import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="bg-bg-base min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DRAFT — client should review/confirm actual data practices before this goes live */}
        <div className="text-center mb-12">
          <Lock className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-muted">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert prose-brand max-w-none text-text-secondary">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              When you visit our website or make a purchase, we collect certain personal information necessary to fulfill your orders and improve your experience. This includes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Contact & Delivery Information:</strong> Your name, email address, phone number, and physical shipping address.</li>
              <li><strong>Order History:</strong> Records of the products you have purchased from us.</li>
            </ul>
            <p className="mb-4">
              <strong>Note on Payments:</strong> All payment processing is securely handled by our third-party payment gateway (Razorpay). We do not collect, process, or store your sensitive payment details (such as credit card numbers or UPI PINs) on our servers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              The personal information we collect is used strictly for legitimate business purposes, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Processing and fulfilling your orders.</li>
              <li>Providing updates regarding your order status and shipping tracking.</li>
              <li>Responding to your customer support inquiries or requests.</li>
              <li>Sending occasional marketing or promotional emails (only if you have explicitly opted in).</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Use of Cookies</h2>
            <p className="mb-4">
              Our website uses cookies and similar tracking technologies to function efficiently and analyze site usage. We use a cookie consent system to ensure you have control over non-essential tracking. You can manage or revoke your consent at any time by clicking the "Cookie Preferences" link in the footer of our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Sharing with Third Parties</h2>
            <p className="mb-4">
              We respect your privacy and <strong>do not sell, rent, or trade your personal data to advertisers or data brokers</strong>. We only share necessary information with trusted third-party service providers solely to operate our business and fulfill your orders:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Payment Processors (Razorpay):</strong> To securely process your transactions.</li>
              <li><strong>Shipping Partners (Shiprocket):</strong> To generate shipping labels and deliver your orders.</li>
              <li><strong>Email Providers (Resend):</strong> To send transactional emails such as order confirmations and shipping updates.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Data Security</h2>
            <p className="mb-4">
              We take reasonable administrative and technical precautions to protect your personal information from unauthorized access, loss, or misuse. However, please understand that no data transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Your Rights</h2>
            <p className="mb-4">
              You have the right to request access to the personal data we hold about you, or ask that your personal information be corrected, updated, or deleted. If you would like to exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. Your continued use of our website after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please reach out through our <Link to="/contact" className="text-brand-primary hover:underline">Contact Us</Link> page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
