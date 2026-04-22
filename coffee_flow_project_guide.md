# Coffee Flow CRM & Ordering System - Complete Implementation Guide

## Project Overview
A 12-week full-stack bootcamp project building a comprehensive coffee shop management system with CRM, loyalty program, KDS (Kitchen Display System), and admin analytics.

---

## **PHASE 1: Core Platform & Ordering (Weeks 1-3)**

### Architecture & Tech Stack
```
Frontend: Next.js + React + Supabase (Real-time)
Backend: Node.js API or Supabase RPC functions
Database: Supabase PostgreSQL
Auth: Supabase Auth
Guest Checkout: Anonymous sessions
```

### Step-by-Step Implementation

#### Step 1.1: Project Setup
```bash
npx create-next-app@latest coffee-flow --typescript --tailwind
cd coffee-flow
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand # State management
npm install react-hot-toast # Notifications
```

#### Step 1.2: Supabase Configuration
1. Create Supabase project
2. Create tables:
   - `users` (id, email, name, created_at)
   - `products` (id, name, price, category, image_url)
   - `orders` (id, user_id, status, total, created_at)
   - `order_items` (id, order_id, product_id, quantity, price)
   - `sessions` (session_id, user_id, created_at) for guest checkout

#### Step 1.3: Guest Checkout Flow
```typescript
// Store/guestCheckout.ts
import { create } from 'zustand';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface GuestStore {
  sessionId: string | null;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  initSession: () => void;
}

export const useGuestStore = create<GuestStore>((set) => ({
  sessionId: null,
  cart: [],
  
  initSession: () => {
    const sessionId = `guest_${Date.now()}_${Math.random()}`;
    set({ sessionId });
    localStorage.setItem('guestSessionId', sessionId);
  },
  
  addToCart: (item) => set((state) => ({
    cart: [...state.cart, item]
  })),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.productId !== productId)
  }))
}));
```

#### Step 1.4: Product Catalog Page
```typescript
// pages/menu.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MenuPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category');
      
      if (data) setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Step 1.5: Checkout Process
```typescript
// pages/checkout.tsx
export default function CheckoutPage() {
  const { sessionId, cart } = useGuestStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    const { data: order } = await supabase
      .from('orders')
      .insert({
        session_id: sessionId,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        status: 'pending'
      })
      .select()
      .single();

    // Insert order items
    await Promise.all(
      cart.map(item =>
        supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        })
      )
    );

    setLoading(false);
    // Redirect to confirmation
  };

  return (
    <div>
      <h1>Confirm Order</h1>
      <OrderSummary items={cart} />
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}
```

#### Step 1.6: Order Confirmation & Print
```typescript
// Use React-to-print for receipt
import { useReactToPrint } from 'react-to-print';

export function OrderReceipt({ order }) {
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <>
      <div ref={printRef} className="receipt-format">
        <h2>Order #{order.id}</h2>
        {order.items.map(item => (
          <div key={item.id}>{item.product} x{item.quantity}</div>
        ))}
        <p>Total: ${order.total.toFixed(2)}</p>
      </div>
      <button onClick={handlePrint}>Print Receipt</button>
    </>
  );
}
```

**Deliverables Phase 1:**
- ✅ Supabase schema setup
- ✅ Next.js frontend with guest checkout
- ✅ Product catalog & cart functionality
- ✅ Order creation & confirmation
- ✅ Receipt printing

---

## **PHASE 2: CRM & LINE Loyalty (Weeks 4-6)**

### Step 2.1: LINE OAuth Integration
```typescript
// lib/lineAuth.ts
export const getLineAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/auth/line/callback`;
  
  return `https://web.line.biz/web/login?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email'
  }).toString()}`;
};
```

```typescript
// pages/api/auth/line/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  // Exchange code for access token
  const tokenResponse = await fetch('https://api.line.biz/oauth/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/line/callback`
    }).toString()
  });

  const { access_token } = await tokenResponse.json();

  // Get user profile
  const profileResponse = await fetch('https://api.line.biz/v2/profile', {
    headers: { Authorization: `Bearer ${access_token}` }
  });

  const profile = await profileResponse.json();

  // Save/update user in Supabase
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      line_user_id: profile.userId,
      name: profile.displayName,
      avatar: profile.pictureUrl,
      line_access_token: access_token
    }, { onConflict: 'line_user_id' })
    .select()
    .single();

  // Redirect to dashboard
  res.redirect('/dashboard');
}
```

### Step 2.2: Membership Tier System
```typescript
// Database Schema
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  points_required INT,
  badge_color VARCHAR(20),
  benefits TEXT[]
);

CREATE TABLE user_memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier_id UUID REFERENCES membership_tiers(id),
  current_points INT DEFAULT 0,
  total_points_earned INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Insert tier data
INSERT INTO membership_tiers (name, points_required, badge_color, benefits) VALUES
('Bronze', 0, '#CD7F32', ARRAY['1 point per $1 spent']),
('Silver', 1000, '#C0C0C0', ARRAY['1.5 points per $1 spent', '5% discount']),
('Gold', 5000, '#FFD700', ARRAY['2 points per $1 spent', '10% discount', 'Free drink monthly']);
```

```typescript
// Service: calculateMembershipTier.ts
export async function updateMembershipTier(userId: string) {
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('current_points')
    .eq('user_id', userId)
    .single();

  const points = membership?.current_points || 0;

  let tierId: string;
  if (points >= 5000) tierId = 'gold'; // Gold UUID
  else if (points >= 1000) tierId = 'silver';
  else tierId = 'bronze';

  await supabase
    .from('user_memberships')
    .update({ tier_id: tierId })
    .eq('user_id', userId);
}
```

### Step 2.3: Points System
```typescript
// Function: addPointsToOrder.ts
export async function addPointsToOrder(orderId: string, userId: string, orderTotal: number) {
  // Get user's current tier
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('tier_id')
    .eq('user_id', userId)
    .single();

  // Points multiplier by tier
  const pointsMultiplier = membership?.tier_id === 'gold' ? 2 : 
                           membership?.tier_id === 'silver' ? 1.5 : 1;

  const pointsEarned = Math.floor(orderTotal * pointsMultiplier);

  // Update points
  await supabase
    .from('user_memberships')
    .update({
      current_points: supabase.raw(`current_points + ${pointsEarned}`),
      total_points_earned: supabase.raw(`total_points_earned + ${pointsEarned}`)
    })
    .eq('user_id', userId);

  // Tier check
  await updateMembershipTier(userId);

  return pointsEarned;
}
```

### Step 2.4: LINE Notification for Points
```typescript
// Send points notification via LINE
export async function sendPointsNotification(userId: string, pointsEarned: number) {
  const { data: user } = await supabase
    .from('users')
    .select('line_user_id, line_access_token')
    .eq('id', userId)
    .single();

  await fetch('https://api.line.biz/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.line_access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: user.line_user_id,
      messages: [{
        type: 'text',
        text: `🎉 +${pointsEarned} points earned! Total: ${totalPoints} points`
      }]
    })
  });
}
```

### Step 2.5: Loyalty Dashboard
```typescript
// pages/loyalty-dashboard.tsx
export default function LoyaltyDashboard() {
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    const fetchMembership = async () => {
      const { data } = await supabase
        .from('user_memberships')
        .select(`
          *,
          tier:membership_tiers(*)
        `)
        .eq('user_id', user.id)
        .single();

      setMembership(data);
    };

    fetchMembership();
  }, []);

  return (
    <div className="loyalty-container">
      <MembershipTierCard tier={membership.tier} points={membership.current_points} />
      <PointsProgressBar current={membership.current_points} nextLevel={membership.tier.next_tier_points} />
      <RecentTransactions userId={user.id} />
    </div>
  );
}
```

**Deliverables Phase 2:**
- ✅ LINE OAuth authentication
- ✅ User membership tier system (Bronze/Silver/Gold)
- ✅ Points earning & redemption system
- ✅ LINE push notifications for points
- ✅ Loyalty dashboard

---

## **PHASE 3: KDS & Real-time Status (Weeks 7-8)**

### Step 3.1: Kitchen Display System (KDS)
```typescript
// Database: Real-time monitoring
CREATE TABLE kds_orders (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, picked_up
  assigned_to VARCHAR(100),
  created_at TIMESTAMP,
  prepared_at TIMESTAMP,
  picked_up_at TIMESTAMP
);

CREATE TABLE order_items_detail (
  id UUID PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id),
  kds_order_id UUID REFERENCES kds_orders(id),
  special_instructions TEXT,
  status VARCHAR(50) DEFAULT 'pending'
);
```

### Step 3.2: Real-time Updates with Supabase Subscriptions
```typescript
// Components/KDSScreen.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function KDSScreen() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);

  useEffect(() => {
    // Subscribe to real-time changes
    const subscription = supabase
      .from('kds_orders')
      .on('*', (payload) => {
        console.log('KDS Update:', payload);
        fetchOrders();
      })
      .subscribe();

    fetchOrders();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('kds_orders')
      .select(`
        *,
        order_items_detail(*)
      `)
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true });

    const pending = data?.filter(o => o.status === 'pending') || [];
    const preparing = data?.filter(o => o.status === 'preparing') || [];

    setPendingOrders(pending);
    setPreparingOrders(preparing);
  };

  return (
    <div className="kds-grid grid-cols-3 gap-4">
      <div className="kds-column">
        <h2>Pending ({pendingOrders.length})</h2>
        {pendingOrders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
          />
        ))}
      </div>

      <div className="kds-column">
        <h2>Preparing ({preparingOrders.length})</h2>
        {preparingOrders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
          />
        ))}
      </div>

      <div className="kds-column">
        <h2>Ready for Pickup</h2>
        {/* Ready items */}
      </div>
    </div>
  );
}

async function updateOrderStatus(orderId: string, newStatus: string) {
  await supabase
    .from('kds_orders')
    .update({
      status: newStatus,
      prepared_at: newStatus === 'ready' ? new Date().toISOString() : null
    })
    .eq('id', orderId);
}
```

### Step 3.3: Status Updates for Customers
```typescript
// Send real-time status to LINE
export async function notifyCustomerOrderStatus(orderId: string, status: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single();

  const { data: user } = await supabase
    .from('users')
    .select('line_user_id')
    .eq('id', order.user_id)
    .single();

  const statusMessages = {
    preparing: '☕ Your order is being prepared',
    ready: '✅ Your order is ready for pickup!',
    picked_up: '🎉 Thanks for your order!'
  };

  await fetch('https://api.line.biz/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: user.line_user_id,
      messages: [{
        type: 'text',
        text: statusMessages[status]
      }]
    })
  });
}
```

### Step 3.4: Estimated Wait Time
```typescript
// Calculate wait time based on queue
export function calculateWaitTime(queueLength: number): number {
  // Assume 3 minutes per order average
  const avgTimePerOrder = 3;
  return queueLength * avgTimePerOrder;
}

// Show in KDS
export function OrderCard({ order, onStatusChange }) {
  const queuePos = order.queue_position;
  const waitTime = calculateWaitTime(queuePos);

  return (
    <div className="order-card">
      <h3>Order #{order.order_number}</h3>
      <p>Est. wait: {waitTime} min</p>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>{item.product} x{item.qty}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Deliverables Phase 3:**
- ✅ KDS (Kitchen Display System) screen
- ✅ Real-time order status updates
- ✅ Customer status notifications via LINE
- ✅ Estimated wait time calculation

---

## **PHASE 4: Admin Dashboard & Analytics (Weeks 9-11)**

### Step 4.1: Role-based Access Control
```typescript
// Database: Admin roles
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'manager', 'admin');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES users(id),
  role user_role DEFAULT 'staff',
  can_view_reports BOOLEAN DEFAULT false,
  can_manage_products BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

```typescript
// Middleware: Check admin access
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const { user } = await supabase.auth.getUser();
  
  const { data: admin } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!admin || !['manager', 'admin'].includes(admin.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  return user;
}
```

### Step 4.2: Analytics Dashboard
```typescript
// pages/admin/analytics.tsx
export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Total Revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', getPreviousDays(30));

      const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;

      // Order count & average
      const avgOrderValue = totalRevenue / orders?.length;

      // Top products
      const { data: topProducts } = await supabase
        .from('order_items')
        .select('product_id, count(*) as sales_count, sum(price) as revenue')
        .gte('created_at', getPreviousDays(30))
        .group('product_id')
        .order('sales_count', { ascending: false })
        .limit(10);

      setMetrics({
        totalRevenue,
        avgOrderValue,
        totalOrders: orders?.length || 0,
        topProducts
      });
    };

    fetchMetrics();
  }, []);

  return (
    <div className="dashboard-grid">
      <MetricCard title="Total Revenue" value={`$${metrics?.totalRevenue}`} />
      <MetricCard title="Avg Order Value" value={`$${metrics?.avgOrderValue}`} />
      <MetricCard title="Total Orders" value={metrics?.totalOrders} />
      <RevenueChart data={metrics} />
      <TopProductsChart products={metrics?.topProducts} />
    </div>
  );
}
```

### Step 4.3: CRM Segmentation
```typescript
// Database: Customer segments
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  query_filter JSONB,
  created_at TIMESTAMP
);

-- Segmentation logic
export async function segmentCustomers() {
  const { data: highValue } = await supabase
    .from('orders')
    .select('user_id, sum(total) as total_spent')
    .group('user_id')
    .having('sum(total) > 500')
    .limit(100);

  const { data: inactive } = await supabase
    .from('orders')
    .select('user_id, max(created_at) as last_order')
    .group('user_id')
    .having(`max(created_at) < NOW() - INTERVAL '90 days'`);

  return { highValue, inactive };
}
```

### Step 4.4: Campaign Management (CMS)
```typescript
// Database
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  discount_percentage INT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  segment_id UUID REFERENCES customer_segments(id),
  created_at TIMESTAMP
);

// Send campaign via LINE
export async function sendCampaign(campaignId: string) {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  const { data: segment } = await supabase
    .from('customer_segments')
    .select('*')
    .eq('id', campaign.segment_id)
    .single();

  // Get customers in segment
  const { data: customers } = await supabase
    .from('users')
    .select('line_user_id')
    .in('id', segment.customer_ids);

  // Send to all
  for (const customer of customers) {
    await fetch('https://api.line.biz/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: customer.line_user_id,
        messages: [{
          type: 'template',
          altText: campaign.name,
          template: {
            type: 'buttons',
            text: campaign.description,
            actions: [{
              type: 'uri',
              label: `Get ${campaign.discount_percentage}% Off`,
              uri: `https://yourapp.com/coupon/${campaign.id}`
            }]
          }
        }]
      })
    });
  }
}
```

**Deliverables Phase 4:**
- ✅ Admin authentication & role management
- ✅ Revenue & sales analytics dashboard
- ✅ Customer segmentation
- ✅ Campaign management & LINE push campaigns
- ✅ CMS for managing products & promotions

---

## **PHASE 5: Deployment & Polish (Week 12)**

### Step 5.1: PWA Setup
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your config
});

// public/manifest.json
{
  "name": "Coffee Flow",
  "short_name": "CoffeeFlow",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff",
  "theme_color": "#6B4423"
}
```

### Step 5.2: Deployment
```bash
# Vercel (Recommended for Next.js)
npm i -g vercel
vercel login
vercel --prod

# Or Docker for traditional hosting
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next /app/.next
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 5.3: Bug Fixes & Performance
- Implement error boundaries
- Add logging & monitoring (Sentry)
- Optimize images (Next.js Image component)
- Set up error tracking: `npm i @sentry/nextjs`

### Step 5.4: Testing
```typescript
// __tests__/checkout.test.ts
import { render, screen } from '@testing-library/react';
import CheckoutPage from '@/pages/checkout';

describe('Checkout', () => {
  it('should display order summary', () => {
    render(<CheckoutPage />);
    expect(screen.getByText('Confirm Order')).toBeInTheDocument();
  });
});
```

**Deliverables Phase 5:**
- ✅ PWA installation capability
- ✅ Production deployment (Vercel/Docker)
- ✅ Bug fixes & optimizations
- ✅ Performance monitoring
- ✅ Testing suite

---

## **Quick Reference: API Endpoints**

### Authentication
- `POST /api/auth/line/callback` - LINE OAuth callback
- `POST /api/auth/logout` - Logout user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/user/:userId` - Get user's orders
- `PUT /api/orders/:id/status` - Update order status

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### Loyalty
- `GET /api/loyalty/membership` - Get user membership
- `POST /api/loyalty/redeem` - Redeem points
- `GET /api/loyalty/tier` - Get tier information

### Analytics (Admin)
- `GET /api/analytics/revenue` - Revenue data
- `GET /api/analytics/orders` - Order statistics
- `GET /api/analytics/products` - Product sales

---

## **Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
```

---

## **Key Technologies Summary**

| Phase | Frontend | Backend | Database | Auth |
|-------|----------|---------|----------|------|
| 1 | Next.js + React | Node.js | Supabase | Guest Sessions |
| 2 | React + Zustand | Supabase RPC | PostgreSQL | LINE OAuth |
| 3 | Real-time UI | Supabase Subs | Supabase | User-based |
| 4 | Admin Dashboard | Next.js API | PostgreSQL | Role-based |
| 5 | PWA + Native | Vercel | Supabase | Production |

---

## **Common Issues & Solutions**

### Issue: Timezone mismatch (UTC ↔ UTC+7)
```typescript
// Always store as UTC, convert on display
export function formatLocalTime(isoString: string): string {
  return new Date(isoString).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok'
  });
}
```

### Issue: Real-time subscriptions not updating
```typescript
// Always unsubscribe on cleanup
useEffect(() => {
  const subscription = supabase.from('table').on('*', callback).subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Issue: LINE OAuth token expiration
```typescript
// Refresh token if needed
export async function refreshLineToken(refreshToken: string) {
  const response = await fetch('https://api.line.biz/oauth/accessToken', {
    // ... refresh token request
  });
  return response.json();
}
```

---

## **Next Steps**

1. **Week 1-3:** Clone this guide, set up Supabase project, build Phase 1
2. **Week 4-6:** Integrate LINE OAuth, implement loyalty system
3. **Week 7-8:** Set up real-time KDS with Supabase subscriptions
4. **Week 9-11:** Build admin dashboard with analytics
5. **Week 12:** Deploy to production, test, optimize

Good luck! 🚀☕
