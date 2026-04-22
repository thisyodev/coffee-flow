# Coffee Flow - Code Starters & Boilerplate

Quick copy-paste code snippets to get started immediately.

---

## **PROJECT SETUP**

### 1. Create Next.js Project
```bash
npx create-next-app@latest coffee-flow \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --import-alias '@/*' \
  --no-git

cd coffee-flow

# Install dependencies
npm install \
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  zustand \
  react-hot-toast \
  react-to-print \
  axios \
  date-fns \
  uuid

# Dev dependencies
npm install --save-dev \
  @types/react \
  @types/node \
  typescript
```

### 2. Directory Structure
```
coffee-flow/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── loyalty/
│   │   ├── admin/
│   │   ├── menu.tsx
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── order-status.tsx
│   │   └── loyalty.tsx
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── CartSummary.tsx
│   │   ├── OrderTicket.tsx
│   │   ├── KDSColumn.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useAuth.ts
│   │   ├── useKDSOrders.ts
│   │   └── useOrderStatus.ts
│   ├── services/
│   │   ├── orderService.ts
│   │   ├── loyaltyService.ts
│   │   ├── analyticsService.ts
│   │   └── lineService.ts
│   ├── stores/
│   │   ├── guestCheckout.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── supabaseAdmin.ts
│   │   ├── lineAuth.ts
│   │   ├── errorHandler.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── api.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── receipt.css
│   └── _app.tsx
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── sw.js
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## **CONFIGURATION FILES**

### .env.example
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# LINE
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
NEXT_PUBLIC_LINE_LIFF_ID=your-liff-id
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Sentry (Phase 5)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-cdn-domain.com', 'supabase-bucket.s3.amazonaws.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf7f2',
          100: '#f3ede4',
          200: '#e8d7c3',
          300: '#d9b89a',
          400: '#c49268',
          500: '#b37c45',
          600: '#9d6b3a',
          700: '#7d5630',
          800: '#64452b',
          900: '#523927',
          950: '#2d1f15',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## **CORE LIBRARIES**

### lib/supabaseClient.ts
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Real-time subscription helper
export function subscribeToTable<T>(
  table: string,
  callback: (data: T) => void,
  filter?: string
) {
  return supabase
    .from(table)
    .on('*', (payload: any) => {
      callback(payload.new as T);
    })
    .subscribe();
}
```

### lib/supabaseAdmin.ts
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### lib/errorHandler.ts
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any) => {
  console.error('Error:', error);

  if (error.statusCode) {
    return {
      status: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error.response?.status) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.message,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
  };
};

export const toastError = (error: any) => {
  const { message } = handleError(error);
  return message;
};
```

### lib/constants.ts
```typescript
export const MEMBERSHIP_TIERS = {
  BRONZE: { id: 'bronze', name: 'Bronze', pointsRequired: 0, multiplier: 1 },
  SILVER: { id: 'silver', name: 'Silver', pointsRequired: 1000, multiplier: 1.5 },
  GOLD: { id: 'gold', name: 'Gold', pointsRequired: 5000, multiplier: 2 },
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TAX_RATE = 0.07; // 7% for Thailand
export const POINTS_PER_BAHT = 1; // 1 point per 1 THB spent
export const POINTS_TO_REDEEM = 50; // 50 points = 1 free drink

export const TOAST_DURATION = 3000;

export const API_ENDPOINTS = {
  ORDERS: '/api/orders',
  PRODUCTS: '/api/products',
  LOYALTY: '/api/loyalty',
  ANALYTICS: '/api/analytics',
  AUTH: '/api/auth',
} as const;
```

---

## **TYPE DEFINITIONS**

### types/database.ts
```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          line_user_id: string | null;
          line_access_token: string | null;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          available: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          total: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      user_memberships: {
        Row: {
          id: string;
          user_id: string;
          tier_id: string;
          current_points: number;
          total_points_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_memberships']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_memberships']['Insert']>;
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type UserMembership = Database['public']['Tables']['user_memberships']['Row'];
```

### types/index.ts
```typescript
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface KDSOrder extends Order {
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  estimated_completion_time: string;
  queue_position?: number;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: Array<{ productId: string; name: string; sales: number; revenue: number }>;
  revenueByHour: Array<{ hour: number; revenue: number }>;
}
```

---

## **ZUSTAND STORES**

### stores/guestCheckout.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TAX_RATE } from '@/lib/constants';
import { CartItem } from '@/types';

interface GuestCheckoutStore {
  sessionId: string | null;
  cart: CartItem[];
  
  // Getters
  subtotal: () => number;
  tax: () => number;
  total: () => number;
  itemCount: () => number;
  
  // Actions
  initSession: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

export const useGuestCheckout = create<GuestCheckoutStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      cart: [],

      initSession: () => {
        const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({ sessionId });
      },

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      setCart: (items) => set({ cart: items }),

      subtotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

      tax: () => get().subtotal() * TAX_RATE,

      total: () => get().subtotal() + get().tax(),

      itemCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'guest-checkout',
    }
  )
);
```

### stores/authStore.ts
```typescript
import { create } from 'zustand';
import { User } from '@/types/database';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, error: null }),
}));
```

---

## **CUSTOM HOOKS**

### hooks/useCart.ts
```typescript
import { useGuestCheckout } from '@/stores/guestCheckout';

export function useCart() {
  const cart = useGuestCheckout((state) => state.cart);
  const addToCart = useGuestCheckout((state) => state.addToCart);
  const removeFromCart = useGuestCheckout((state) => state.removeFromCart);
  const updateQuantity = useGuestCheckout((state) => state.updateQuantity);
  const clearCart = useGuestCheckout((state) => state.clearCart);
  
  const subtotal = useGuestCheckout((state) => state.subtotal());
  const tax = useGuestCheckout((state) => state.tax());
  const total = useGuestCheckout((state) => state.total());
  const itemCount = useGuestCheckout((state) => state.itemCount());

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount,
  };
}
```

### hooks/useAuth.ts
```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser(userData);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, setLoading]);

  return { user, loading, logout };
}
```

---

## **API ROUTES**

### pages/api/orders.ts
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Order } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, session_id, total, items, notes } = req.body;

    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id,
          session_id,
          total,
          notes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(
          items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        );

      if (itemsError) throw itemsError;

      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

### pages/api/products.ts
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category } = req.query;

    try {
      let query = supabase.from('products').select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data: products, error } = await query.eq('available', true);

      if (error) throw error;

      return res.status(200).json(products);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

## **REACT COMPONENTS**

### components/CartSummary.tsx
```typescript
import { useCart } from '@/hooks/useCart';

export default function CartSummary() {
  const { subtotal, tax, total } = useCart();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span className="font-semibold">฿{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-4 pb-4 border-b">
        <span>Tax (7%)</span>
        <span className="font-semibold">฿{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-lg">
        <span className="font-bold">Total</span>
        <span className="font-bold text-coffee-600">฿{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

### components/LoadingSpinner.tsx
```typescript
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin">
        <svg className="w-8 h-8 text-coffee-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}
```

---

## **DATABASE MIGRATIONS (SQL)**

### Initial Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  line_user_id VARCHAR(255) UNIQUE,
  line_access_token TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membership tiers
CREATE TABLE membership_tiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  points_required INT NOT NULL,
  points_multiplier DECIMAL(2, 1) DEFAULT 1.0,
  discount_percentage INT DEFAULT 0
);

-- User memberships
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier_id VARCHAR(50) REFERENCES membership_tiers(id),
  current_points INT DEFAULT 0,
  total_points_earned INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tier data
INSERT INTO membership_tiers (id, name, points_required, points_multiplier, discount_percentage) VALUES
('bronze', 'Bronze', 0, 1.0, 0),
('silver', 'Silver', 1000, 1.5, 5),
('gold', 'Gold', 5000, 2.0, 10);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
```

---

## **QUICK START CHECKLIST**

- [ ] Create Supabase project
- [ ] Run SQL schema migrations
- [ ] Set up environment variables
- [ ] Install npm dependencies
- [ ] Create Zustand stores
- [ ] Build product catalog page
- [ ] Build cart & checkout flow
- [ ] Test guest checkout
- [ ] Integrate LINE OAuth
- [ ] Set up loyalty system
- [ ] Build admin dashboard
- [ ] Deploy to Vercel

---

This gives you the foundation to start building immediately! 🚀☕
