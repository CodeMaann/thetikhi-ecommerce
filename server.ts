import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createServer as createViteServer } from 'vite';
import prisma from './src/server/prisma';

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  function processImages(images: string[]): string[] {
    if (!images || !Array.isArray(images)) return [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  
    return images.map(img => {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        const matches = img.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1];
          const base64Data = matches[2];
          const filename = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
          const filepath = path.join(uploadDir, filename);
          fs.writeFileSync(filepath, base64Data, 'base64');
          return `/uploads/${filename}`;
        }
      }
      return img;
    });
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
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

  app.get('/api/products', async (req, res) => {
    const activeProducts = await prisma.product.findMany({ where: { status: 'active' } });
    res.json(activeProducts);
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
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== 'number') {
      return res.status(400).json({ valid: false, reason: 'Invalid request payload.' });
    }
    
    // Case-insensitive match in Prisma can be tricky. Prisma Postgres `findFirst` with `mode: 'insensitive'` works.
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
  });

  app.post('/api/orders', async (req, res) => {
  try {
    const newOrderData = req.body;
    
    // Add orderId if missing
    if (!newOrderData.orderId) {
      newOrderData.orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
    
    // Unconditionally set receiptUrl server-side
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
            price: item.price,
            quantity: item.quantity,
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

    res.json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ success: false, error: 'Failed to create order. Please try again.' });
  }
});

// GET /api/orders/lookup
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
    console.error('Lookup failed:', err);
    res.status(500).json({ error: 'Failed to lookup orders' });
  }
});

// GET /api/orders/:orderId
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
    console.error('Failed to get order:', err);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

app.get('/api/admin/coupons', requireAuth, requireAdmin, async (req, res) => {
    const allCoupons = await prisma.coupon.findMany();
    res.json(allCoupons);
  });

  app.post('/api/admin/coupons', requireAuth, requireAdmin, async (req, res) => {
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
    const allProducts = await prisma.product.findMany();
    res.json(allProducts);
  });

  app.post('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
    const { name, price, weight, stock, status, originalPrice, discount, description, images, image, ingredients, nutrition, baseProductName } = req.body;
    
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

    let processedImages = processImages(images || (image ? [image] : []));

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
        baseProductName: baseProductName || null
      }
    });
    res.json(newProduct);
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

      if (updates.images) {
        updates.images = processImages(updates.images);
      }

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: updates
      });
      res.json(updated);
    } catch (e) {
      res.status(404).json({ error: 'Product not found.' });
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

  // Reviews
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId: req.params.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(reviews);
    } catch (error) {
      console.error(error);
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
      // Check if user has purchased this product
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
      console.error(error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  });

  // Get variants for a product
  app.get('/api/products/:id/variants', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product || !product.baseProductName) return res.json([]);
      
      const variants = await prisma.product.findMany({
        where: { 
          baseProductName: product.baseProductName,
          status: 'active'
        },
        orderBy: { weight: 'asc' }
      });
      res.json(variants);
    } catch (error) {
      console.error(error);
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
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
