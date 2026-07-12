import { Resend } from 'resend';

export async function sendOrderReceiptEmail(to: string, order: any) {
  if (!to) return;
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Skipping order receipt email.');
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
  
  const customer = order.customer as any;
  const pricing = order.pricing as any;
  const address = customer.address || {};
  
  const subtotal = pricing.subtotal || 0;
  const discount = pricing.discount || 0;
  const shipping = pricing.shipping || 0;
  const total = pricing.grandTotal || 0;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-4">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <p><strong>Order ID:</strong> ${order.orderId || order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.payment?.method === 'razorpay' ? 'Razorpay - Paid' : 'Cash on Delivery'}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: right; padding: 8px;">Qty</th>
            <th style="text-align: right; padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">${item.name}</td>
              <td style="text-align: right; padding: 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px;">₹${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p>Subtotal: ₹${subtotal}</p>
        ${discount > 0 ? `<p style="color: green;">Discount: -₹${discount}</p>` : ''}
        <p>Shipping: ₹${shipping}</p>
        <h3>Grand Total: ₹${total}</h3>
      </div>

      <div style="margin-top: 30px;">
        <h3>Delivery Details</h3>
        <p>${customer.name || ''}</p>
        <p>${address.fullAddress || ''}</p>
        <p>${address.city || ''}, ${address.state || ''} ${address.pincode || ''}</p>
        <p>Phone: ${customer.phone || ''}</p>
        <p>Estimated Delivery: ${order.estimatedDelivery || '3-5 Business Days'}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject: `Order Confirmation - ${order.orderId || order.id}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send order receipt email:', error);
    // Don't throw, we don't want to fail the order if the email fails
  }
}

export async function sendNewOrderAlertToOwner(order: any) {
  const OWNER_EMAIL = process.env.OWNER_EMAIL;
  if (!OWNER_EMAIL) {
    return;
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Skipping owner alert email.');
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
  
  const customer = order.customer as any || {};
  const pricing = order.pricing as any || {};
  const address = customer.address || {};
  
  const subtotal = pricing.subtotal || 0;
  const discount = pricing.discount || 0;
  const shipping = pricing.shipping || 0;
  const total = pricing.grandTotal || 0;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-4">
      <h2>New Order Received!</h2>
      <p>Log into the Admin dashboard to view and prepare this order.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-radius: 8px;">
        <p><strong>Order ID:</strong> ${order.orderId || order.id}</p>
        <p><strong>Date Placed:</strong> ${new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${order.payment?.method === 'razorpay' ? 'Razorpay - Paid' : 'Cash on Delivery'}</p>
      </div>

      <div style="margin-top: 20px;">
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${customer.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
        <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
        <p><strong>Address:</strong></p>
        <p>${address.fullAddress || ''}</p>
        <p>${address.city || ''}, ${address.state || ''} ${address.pincode || ''}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: right; padding: 8px;">Qty</th>
            <th style="text-align: right; padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">${item.name}</td>
              <td style="text-align: right; padding: 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px;">₹${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p>Subtotal: ₹${subtotal}</p>
        ${discount > 0 ? `<p style="color: green;">Discount: -₹${discount}</p>` : ''}
        <p>Shipping: ₹${shipping}</p>
        <h3 style="color: #2563eb;">Grand Total: ₹${total}</h3>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: OWNER_EMAIL,
      subject: `New Order Received - ${order.orderId || order.id}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send owner alert email:', error);
  }
}
