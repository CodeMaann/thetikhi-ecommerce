import prisma from './prisma';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getShiprocketToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured. Cannot get Shiprocket token.');
    return null;
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shiprocket login failed:', errorText);
      return null;
    }

    const data = await response.json();
    cachedToken = data.token;
    // Token valid for 10 days, cache for 9 days to be safe
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    
    return cachedToken;
  } catch (error) {
    console.error('Error fetching Shiprocket token:', error);
    return null;
  }
}

export async function createShiprocketOrder(order: any) {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      console.warn('Skipping Shiprocket order creation because token could not be obtained.');
      return;
    }

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
    if (!pickupLocation) {
      console.warn('SHIPROCKET_PICKUP_LOCATION not configured. Skipping Shiprocket order creation.');
      return;
    }

    const customer = order.customer as any || {};
    const address = customer.address || {};
    const pricing = order.pricing as any || {};
    const items = order.items || [];

    const shiprocketItems = items.map((item: any) => ({
      name: item.name,
      sku: item.productId || 'UNKNOWN_SKU',
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
    }));

    const totalWeight = items.reduce((acc: number, item: any) => acc + (0.3 * item.quantity), 0);
    const weight = totalWeight > 0 ? totalWeight : 0.3;

    const payload = {
      order_id: order.orderId || order.id,
      order_date: new Date(order.orderDate || order.createdAt || Date.now()).toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].substring(0, 8),
      pickup_location: pickupLocation,
      billing_customer_name: customer.name || 'Unknown',
      billing_last_name: '',
      billing_address: address.fullAddress || 'Unknown Address',
      billing_city: address.city || 'Unknown',
      billing_pincode: address.pincode || '000000',
      billing_state: address.state || 'Unknown',
      billing_country: 'India',
      billing_email: customer.email || 'no-reply@thetikhi.com',
      billing_phone: customer.phone || '0000000000',
      shipping_is_billing: true,
      order_items: shiprocketItems,
      payment_method: order.payment?.method === 'razorpay' ? 'Prepaid' : 'COD',
      sub_total: pricing.grandTotal || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: weight,
    };

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shiprocket order creation failed:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Shiprocket order created successfully:', data);

    const shiprocketOrderId = data.order_id ? String(data.order_id) : null;
    const shiprocketShipmentId = data.shipment_id ? String(data.shipment_id) : null;

    if (shiprocketOrderId || shiprocketShipmentId) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId,
          shiprocketShipmentId,
        }
      });
    }

  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
  }
}
