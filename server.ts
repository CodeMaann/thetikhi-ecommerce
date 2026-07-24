import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';
import prisma from './src/server/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendOrderReceiptEmail, sendNewOrderAlertToOwner } from './src/server/email';
import { createShiprocketOrder } from './src/server/shiprocket';

console.log('[ENV CHECK] RAZORPAY_KEY_ID present:', !!process.env.RAZORPAY_KEY_ID);
console.log('[ENV CHECK] RAZORPAY_KEY_ID length:', process.env.RAZORPAY_KEY_ID?.length || 0);
console.log('[ENV CHECK] RAZORPAY_KEY_ID starts with rzp_:', process.env.RAZORPAY_KEY_ID?.startsWith('rzp_'));
console.log('[ENV CHECK] RAZORPAY_KEY_SECRET present:', !!process.env.RAZORPAY_KEY_SECRET);
console.log('[ENV CHECK] RAZORPAY_KEY_SECRET length:', process.env.RAZORPAY_KEY_SECRET?.length || 0);
console.log('[ENV CHECK] All env var names containing RAZORPAY:', Object.keys(process.env).filter(k => k.toUpperCase().includes('RAZORPAY')));

console.log('[ENV CHECK] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
console.log('[ENV CHECK] RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
console.log('[ENV CHECK] RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'));
console.log('[ENV CHECK] SENDER_EMAIL present:', !!process.env.SENDER_EMAIL);
console.log('[ENV CHECK] SENDER_EMAIL value:', process.env.SENDER_EMAIL);
console.log('[ENV CHECK] OWNER_EMAIL present:', !!process.env.OWNER_EMAIL);
console.log('[ENV CHECK] OWNER_EMAIL value:', process.env.OWNER_EMAIL);
console.log('[ENV CHECK] All env var names containing RESEND, SENDER, or OWNER:', Object.keys(process.env).filter(k => k.toUpperCase().includes('RESEND') || k.toUpperCase().includes('SENDER') || k.toUpperCase().includes('OWNER')));

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'the-tikhi-super-secret-key-123';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Falling back to default temporary key.');
}

const ADMIN_USER = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== 'production' ? 'CHANGE_ME' : '');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'CHANGE_ME' : '');

if (!ADMIN_USER || !ADMIN_PASS) {
  console.warn('WARNING: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are not set.');
}

if (!process.env.OWNER_EMAIL) {
  console.warn('WARNING: OWNER_EMAIL environment variable is not set. The store owner will not receive new order alerts.');
}

let _razorpayInstance: Razorpay | null = null;
function getRazorpayInstance(): Razorpay | null {
  if (_razorpayInstance) return _razorpayInstance;
  
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    _razorpayInstance = new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET 
    });
    return _razorpayInstance;
  }
  
  return null;
}

async function createOrderInDatabase(newOrderData: any) {
  if (!newOrderData.orderId) {
    newOrderData.orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  
  newOrderData.receiptUrl = `/receipt/${newOrderData.orderId}`;

  const savedOrder = await prisma.order.create({
    data: {
      orderId: newOrderData.orderId,
      orderDate: newOrderData.orderDate || new Date().toISOString(),
      customer: newOrderData.customer || {},
      pricing: newOrderData.pricing || {},
      payment: newOrderData.payment || {},
      status: newOrderData.status || 'Received',
      estimatedDelivery: newOrderData.estimatedDelivery || '',
      receiptUrl: newOrderData.receiptUrl,
      items: {
        create: newOrderData.items.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          mrp: item.mrp || item.price,
          image: item.image || ''
        }))
      },
      statusHistory: {
        create: [{
          status: newOrderData.status || 'Received',
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully'
        }]
      }
    },
    include: {
      items: true,
      statusHistory: true
    }
  });

  if (savedOrder.customer && (savedOrder.customer as any).email) {
    try {
      await sendOrderReceiptEmail((savedOrder.customer as any).email, savedOrder);
    } catch (error) {
      console.error('Failed to send customer receipt email:', error);
    }
  }

  try {
    await sendNewOrderAlertToOwner(savedOrder);
  } catch (error) {
    console.error('Failed to send owner alert email in createOrderInDatabase:', error);
  }

  try {
    await createShiprocketOrder(savedOrder);
  } catch (error) {
    console.error('Failed to create Shiprocket order:', error);
  }

  return savedOrder;
}

async function startServer() {
  const app = express();
  
  const PORT = 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running immediately on port ${PORT}`);
  });

  function processImages(images: string[]): string[] {
    if (!images || !Array.isArray(images)) return [];
    return images.map(img => {
      if (typeof img !== 'string') return '';
      if (!img.startsWith('data:image/')) return img;
      const matches = img.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid base64 image data format.');
      const approxBytes = matches[2].length * 0.75;
      if (approxBytes > 4 * 1024 * 1024) {
        throw new Error('One or more images exceed the 4MB size limit.');
      }
      return img;
    }).filter(Boolean);
  }
 
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((req, res, next) => {
    res.setTimeout(30000, () => {
      if (!res.headersSent) {
        res.status(503).json({ error: 'Request timed out. Please try again.' });
      }
    });
    next();
  });
  
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser || email === ADMIN_USER) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({ 
        data: { name, email, passwordHash, role: 'customer' } 
      });

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
      }

      res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      const genericMessage = 'If an account exists for that email, a reset code has been sent.';

      if (!user || user.role === 'admin') {
        return res.json({ message: genericMessage });
      }

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        return res.status(500).json({ error: 'Email service is not configured' });
      }

      const resend = new Resend(resendApiKey);
      const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

      await prisma.passwordResetCode.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true }
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.passwordResetCode.create({
        data: { userId: user.id, code, expiresAt }
      });

      await resend.emails.send({
        from: senderEmail,
        to: email,
        subject: 'Your Password Reset Code',
        html: `<p>Your password reset code is: <strong>${code}</strong>. This code expires in 15 minutes.</p>`
      });

      res.json({ message: genericMessage });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, code, and new password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      const genericError = 'This code is invalid or has expired. Please request a new one.';

      if (!user || user.role === 'admin') {
        return res.status(400).json({ error: genericError });
      }

      const resetCode = await prisma.passwordResetCode.findFirst({
        where: { userId: user.id, code: code, used: false }
      });

      if (!resetCode || new Date() > new Date(resetCode.expiresAt)) {
        return res.status(400).json({ error: genericError });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      await prisma.passwordResetCode.update({
        where: { id: resetCode.id },
        data: { used: true }
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { weight: 'asc' }
      });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (e) {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code || typeof subtotal !== 'number') {
        return res.status(400).json({ valid: false, reason: 'Invalid request payload.' });
      }

      const coupon = await prisma.coupon.findFirst({
        where: { code: { equals: code, mode: 'insensitive' } }
      });

      if (!coupon) return res.json({ valid: false, reason: 'Coupon not found.' });
      if (!coupon.active) return res.json({ valid: false, reason: 'Coupon is inactive.' });
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.json({ valid: false, reason: 'Coupon has expired.' });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.json({ valid: false, reason: 'Coupon usage limit exceeded.' });
      }
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return res.json({ valid: false, reason: `Minimum order value of ₹${coupon.minOrderValue} required.` });
      }
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
      } else {
        discountAmount = coupon.value;
      }
      res.json({ valid: true, discountAmount, code: coupon.code });
    } catch (err) {
      res.status(500).json({ valid: false, reason: 'Server error' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const newOrderData = req.body;
      const savedOrder = await createOrderInDatabase(newOrderData);
      res.json({ success: true, order: savedOrder });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create order. Please try again.' });
    }
  });

  app.post('/api/payment/razorpay/create-order', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        return res.status(500).json({ error: 'Razorpay is not configured on the server' });
      }

      const orderOptions = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: 'rcpt_' + Math.random().toString(36).substring(2, 9)
      };

      const order = await razorpay.orders.create(orderOptions);
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  });

  app.post('/api/payment/razorpay/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
      
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({ success: false, error: 'Razorpay secret not configured' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Payment verification failed.' });
      }

      if (!orderData.payment) orderData.payment = {};
      orderData.payment.method = 'razorpay';
      orderData.payment.status = 'paid';
      orderData.payment.razorpayOrderId = razorpay_order_id;
      orderData.payment.razorpayPaymentId = razorpay_payment_id;
      orderData.payment.paidAt = new Date().toISOString();

      const savedOrder = await createOrderInDatabase(orderData);
      res.json({ success: true, order: savedOrder });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to verify payment and create order.' });
    }
  });

  app.post('/api/webhooks/shiprocket', async (req, res) => {
    try {
      const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
      if (webhookToken) {
        const receivedToken = req.headers['x-api-key'];
        if (receivedToken !== webhookToken) {
          return res.status(401).json({ error: 'Unauthorized webhook request' });
        }
      }

      const payload = req.body;
      const shipmentId = payload.shipment_id ? String(payload.shipment_id) : null;
      const orderId = payload.order_id ? String(payload.order_id) : null;
      const status = payload.current_status || 'Unknown';
      const awb = payload.awb || '';
      const courier = payload.courier_name || '';

      if (!shipmentId && !orderId) {
        return res.status(400).json({ error: 'Missing shipment_id and order_id in payload' });
      }

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(shipmentId ? [{ shiprocketShipmentId: shipmentId }] : []),
            ...(orderId ? [{ shiprocketOrderId: orderId }] : []),
            ...(payload.channel_order_id ? [{ orderId: String(payload.channel_order_id) }] : [])
          ]
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found for given Shiprocket ID' });
      }

      const trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : '';

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: status,
          tracking: {
            courierName: courier,
            trackingNumber: awb,
            trackingUrl: trackingUrl
          },
          statusHistory: {
            create: {
              status: status,
              timestamp: new Date().toISOString(),
              note: `Shiprocket update: ${status}${awb ? ` (${courier} AWB: ${awb})` : ''}`
            }
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/orders/lookup', async (req, res) => {
    try {
      const { phone } = req.query;
      if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
        return res.status(400).json({ error: 'Valid phone number is required' });
      }
      
      const orders = await prisma.order.findMany({
        where: {
          customer: {
            path: ['phone'],
            equals: phone.trim()
          }
        },
        include: { items: true, statusHistory: true },
        orderBy: { orderDate: 'desc' }
      });
      
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to lookup orders' });
    }
  });

  app.get('/api/orders/:orderId', async (req, res) => {
    try {
      const order = await prisma.order.findUnique({
        where: { orderId: req.params.orderId },
        include: { items: true, statusHistory: true }
      });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get order' });
    }
  });

  app.get('/api/admin/coupons', requireAuth, requireAdmin, async (req, res) => {
    try {
      const allCoupons = await prisma.coupon.findMany();
      res.json(allCoupons);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/coupons', requireAuth, requireAdmin, async (req, res) => {
    try {
      let { code, type, value, expiresAt, minOrderValue, usageLimit } = req.body;
      if (!code) {
        code = 'TIKHI' + Math.random().toString(36).substring(2, 7).toUpperCase();
      }
      const newCoupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase(),
          type,
          value: Number(value),
          active: true,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          minOrderValue: minOrderValue ? Number(minOrderValue) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          usedCount: 0
        }
      });
      res.json(newCoupon);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/coupons/:code', requireAuth, requireAdmin, async (req, res) => {
    try {
      const coupon = await prisma.coupon.findFirst({
        where: { code: { equals: req.params.code, mode: 'insensitive' } }
      });
      if (coupon) {
        let updateData = { ...req.body };
        if (updateData.expiresAt) {
          updateData.expiresAt = new Date(updateData.expiresAt);
        } else if (updateData.expiresAt === "") {
          updateData.expiresAt = null;
        }
        
        const updated = await prisma.coupon.update({
          where: { id: coupon.id },
          data: updateData
        });
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Coupon not found.' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/admin/coupons/:code', requireAuth, requireAdmin, async (req, res) => {
    try {
      const coupon = await prisma.coupon.findFirst({
        where: { code: { equals: req.params.code, mode: 'insensitive' } }
      });
      if (coupon) {
        await prisma.coupon.delete({ where: { id: coupon.id } });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Coupon not found.' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
    try {
      const allProducts = await prisma.product.findMany();
      res.json(allProducts);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, price, weight, stock, status, originalPrice, discount, description, images, image, ingredients, nutrition, baseProductName, variantType, comboItems } = req.body;
      
      if (!name || price === undefined || !weight) {
        return res.status(400).json({ error: 'Name, price, and weight are required.' });
      }
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number.' });
      }
      
      const initialStock = stock !== undefined ? stock : 0;
      if (typeof initialStock !== 'number' || initialStock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative number.' });
      }

      let processedImages;
      try {
        processedImages = processImages(images || (image ? [image] : []));
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          price,
          weight,
          stock: initialStock,
          status: status || 'active',
          originalPrice: originalPrice || price,
          discount: discount || 0,
          description: description || '',
          images: processedImages,
          ingredients: ingredients || null,
          nutrition: nutrition || null,
          baseProductName: baseProductName || null,
          variantType: variantType || 'single',
          comboItems: comboItems || null
        }
      });
      res.json(newProduct);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
        return res.status(400).json({ error: 'Price must be a non-negative number.' });
      }
      if (updates.stock !== undefined && (typeof updates.stock !== 'number' || updates.stock < 0)) {
        return res.status(400).json({ error: 'Stock must be a non-negative number.' });
      }

      let processedImages = updates.images;
      if (updates.images) {
        try {
          processedImages = processImages(updates.images);
        } catch (err: any) {
          return res.status(400).json({ error: err.message });
        }
      }

      const { name, description, price, originalPrice, discount, weight, ingredients, nutrition, stock, status, baseProductName, variantType, comboItems } = updates;
      
      const dataToUpdate: any = {};
      if (name !== undefined) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (price !== undefined) dataToUpdate.price = price;
      if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice;
      if (discount !== undefined) dataToUpdate.discount = discount;
      if (weight !== undefined) dataToUpdate.weight = weight;
      if (processedImages !== undefined) dataToUpdate.images = processedImages;
      if (ingredients !== undefined) dataToUpdate.ingredients = ingredients;
      if (nutrition !== undefined) dataToUpdate.nutrition = nutrition;
      if (stock !== undefined) dataToUpdate.stock = stock;
      if (status !== undefined) dataToUpdate.status = status;
      if (baseProductName !== undefined) dataToUpdate.baseProductName = baseProductName;
      if (variantType !== undefined) dataToUpdate.variantType = variantType;
      if (comboItems !== undefined) dataToUpdate.comboItems = comboItems;

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: dataToUpdate
      });
      res.json(updated);
    } catch (e: any) {
      if (e.code === 'P2025' || e.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found.' });
      } else {
        res.status(500).json({ error: e.message || 'Internal server error' });
      }
    }
  });

  app.delete('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (e) {
      res.status(404).json({ error: 'Product not found.' });
    }
  });

  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
      res.json({ value: setting?.value || null });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/admin/settings/:key', requireAuth, requireAdmin, async (req, res) => {
    try {
      const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
      res.json({ key: req.params.key, value: setting?.value || null });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/settings/:key', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      const trimmedValue = value ? value.trim() : null;
      
      if (!trimmedValue) {
        return res.status(400).json({ error: 'Value is required' });
      }

      const updated = await prisma.siteSetting.upsert({
        where: { key: req.params.key },
        update: { value: trimmedValue },
        create: { key: req.params.key, value: trimmedValue }
      });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/admin/orders', requireAuth, requireAdmin, async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        include: { items: true, statusHistory: true },
        orderBy: { orderDate: 'desc' }
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const order = await prisma.order.findUnique({ where: { orderId: req.params.id } });
      if (order) {
        const updated = await prisma.order.update({
          where: { orderId: req.params.id },
          data: {
            status: req.body.status,
            statusHistory: {
              create: {
                status: req.body.status,
                timestamp: new Date().toISOString(),
                note: req.body.note || ''
              }
            }
          },
          include: { items: true, statusHistory: true }
        });
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/orders/:id/tracking', requireAuth, requireAdmin, async (req, res) => {
    const { courier, trackingNo } = req.body;
    try {
      const order = await prisma.order.findUnique({ where: { orderId: req.params.id } });
      if (order) {
        const updated = await prisma.order.update({
          where: { orderId: req.params.id },
          data: {
            status: 'shipped',
            tracking: {
              courierName: courier,
              trackingNumber: trackingNo,
              trackingUrl: `https://www.google.com/search?q=${trackingNo}`
            },
            statusHistory: {
              create: {
                status: 'shipped',
                timestamp: new Date().toISOString(),
                note: `Shipped via ${courier} (${trackingNo})`
              }
            }
          },
          include: { items: true, statusHistory: true }
        });
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch(e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId: req.params.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.get('/api/products/:id/can-review', requireAuth, async (req, res) => {
    try {
      const hasPurchased = await prisma.order.findFirst({
        where: {
          customer: { path: ['email'], equals: (req as any).user.email },
          items: { some: { productId: req.params.id } }
        }
      });
      res.json({ canReview: !!hasPurchased });
    } catch (error) {
      res.json({ canReview: false });
    }
  });

  app.post('/api/products/:id/reviews', requireAuth, async (req, res) => {
    const { rating, comment } = req.body;
    const userId = (req as any).user.id;
    try {
      const hasPurchased = await prisma.order.findFirst({
        where: {
          customer: { path: ['email'], equals: (req as any).user.email },
          items: { some: { productId: req.params.id } }
        }
      });
      
      if (!hasPurchased) {
        return res.status(403).json({ error: 'You must purchase this product to review it.' });
      }

      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          productId: req.params.id,
          userId
        },
        include: { user: { select: { name: true } } }
      });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add review' });
    }
  });

  app.get('/api/products/:id/variants', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product || !product.baseProductName) return res.json([]);
      
      const variants = await prisma.product.findMany({
        where: { 
          baseProductName: product.baseProductName
        },
        orderBy: { weight: 'asc' }
      });
      res.json(variants);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch variants' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
    app.use(vite.middlewares);
  } else {
    app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
