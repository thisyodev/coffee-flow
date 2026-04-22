-- Coffee Flow CRM - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  line_user_id VARCHAR(255) UNIQUE,
  line_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster session lookups
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- GUEST SESSIONS TABLE
-- ============================================
CREATE TABLE guest_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEMBERSHIP TIERS TABLE
-- ============================================
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  points_required INTEGER NOT NULL,
  badge_color VARCHAR(20),
  benefits TEXT[],
  next_tier_points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO membership_tiers (name, points_required, badge_color, benefits, next_tier_points) VALUES
('Bronze', 0, '#CD7F32', ARRAY['1 point per $1 spent'], 1000),
('Silver', 1000, '#C0C0C0', ARRAY['1.5 points per $1 spent', '5% discount'], 5000),
('Gold', 5000, '#FFD700', ARRAY['2 points per $1 spent', '10% discount', 'Free drink monthly'], NULL);

-- ============================================
-- USER MEMBERSHIPS TABLE
-- ============================================
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES membership_tiers(id),
  current_points INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);

-- ============================================
-- KDS ORDERS TABLE (Kitchen Display System)
-- ============================================
CREATE TABLE kds_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up')),
  assigned_to VARCHAR(100),
  queue_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prepared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  picked_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kds_orders_status ON kds_orders(status);

-- ============================================
-- ORDER ITEMS DETAIL (for KDS)
-- ============================================
CREATE TABLE order_items_detail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  kds_order_id UUID REFERENCES kds_orders(id) ON DELETE CASCADE,
  special_instructions TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prepared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'manager', 'admin');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'staff',
  can_view_reports BOOLEAN DEFAULT false,
  can_manage_products BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_campaigns BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMER SEGMENTS TABLE
-- ============================================
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  query_filter JSONB,
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_code VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  segment_id UUID REFERENCES customer_segments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SEED DATA - Sample Products
-- ============================================
INSERT INTO products (name, price, category, description) VALUES
-- Espresso Drinks
('Espresso', 3.50, 'Espresso', 'Rich and bold single shot'),
('Double Espresso', 4.50, 'Espresso', 'Two shots of bold espresso'),
('Americano', 4.00, 'Espresso', 'Espresso with hot water'),
('Latte', 5.00, 'Espresso', 'Espresso with steamed milk'),
('Cappuccino', 5.00, 'Espresso', 'Equal parts espresso, milk, and foam'),
('Mocha', 5.50, 'Espresso', 'Espresso with chocolate and milk'),
('Flat White', 5.00, 'Espresso', 'Velvety microfoam over espresso'),

-- Cold Drinks
('Iced Latte', 5.50, 'Cold', 'Chilled espresso with milk'),
('Iced Americano', 4.50, 'Cold', 'Espresso over ice with water'),
('Cold Brew', 5.00, 'Cold', 'Smooth slow-steeped coffee'),
('Iced Mocha', 6.00, 'Cold', 'Chocolate espresso over ice'),
('Frappuccino', 6.50, 'Cold', 'Blended ice coffee drink'),

-- Specialty
('Matcha Latte', 5.50, 'Specialty', 'Japanese matcha with milk'),
('Chai Latte', 5.00, 'Specialty', 'Spiced tea with milk'),
('Hot Chocolate', 4.50, 'Specialty', 'Rich chocolate with steamed milk'),

-- Food
('Croissant', 3.50, 'Food', 'Buttery French pastry'),
('Blueberry Muffin', 3.50, 'Food', 'Fresh baked muffin'),
('Avocado Toast', 7.00, 'Food', 'Sourdough with avocado and seasonings'),
('Breakfast Sandwich', 8.00, 'Food', 'Egg, cheese, and bacon on bagel');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Products: Only admins can modify
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Orders: Users can read their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
  );

-- Orders: Staff can view all orders
CREATE POLICY "Staff can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('staff', 'manager', 'admin'))
  );

-- Membership tiers: Everyone can read
CREATE POLICY "Tiers are viewable by everyone" ON membership_tiers
  FOR SELECT USING (true);

-- User memberships: Users can read own
CREATE POLICY "Users can view own membership" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE kds_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
