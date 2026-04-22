# Coffee Flow CRM - Prompt Templates for Each Phase

Use these prompts with Claude to generate code for each phase. Copy-paste and customize as needed.

---

## **PHASE 1: Core Platform & Ordering - Prompts**

### Prompt 1.1: Project Setup & Supabase Schema
```
You are a senior full-stack developer. Help me build Phase 1 of a Coffee Shop CRM system.

Requirements:
- Next.js 14 with TypeScript
- Supabase for database & auth
- Guest checkout flow (anonymous sessions)
- Product catalog with categories
- Shopping cart & checkout

First, provide:
1. Directory structure for the project
2. Required npm packages
3. Complete Supabase schema (SQL) for:
   - users table (with line_user_id field for Phase 2)
   - products table (with categories)
   - orders & order_items tables
   - sessions table (for guest checkout)
   - order_status enum

Also include:
- .env.example file with all required variables
- Supabase client setup (lib/supabaseClient.ts)

Generate TypeScript code, include proper type definitions.
```

### Prompt 1.2: Guest Checkout Store & Cart
```
Build a guest checkout system for a coffee shop ordering app using Next.js and Zustand.

Requirements:
- Zustand store for cart state management
- Guest session ID generation (localStorage)
- Functions: addToCart, removeFromCart, updateQuantity, clearCart
- Calculate total, subtotal, tax (7% for Thailand)
- Persist cart in localStorage
- Cart should survive page refresh

Create:
1. lib/stores/guestCheckout.ts - Complete Zustand store with types
2. hooks/useCart.ts - Custom hook to use the store
3. Show TypeScript types for CartItem, GuestStore
4. Add error handling for localStorage

Include example usage in a React component.
```

### Prompt 1.3: Product Catalog Page
```
Create a responsive product catalog page for a coffee shop ordering system.

Requirements:
- Fetch products from Supabase with categories (Espresso, Latte, Cold Brew, etc.)
- Filter by category
- Search functionality
- Product cards with image, name, price, description
- Add to cart button
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Skeleton loading state while fetching

Technologies: Next.js, React, Tailwind CSS, Supabase

Create:
1. pages/menu.tsx - Main product page
2. components/ProductCard.tsx - Individual product card
3. components/CategoryFilter.tsx - Category filter
4. components/SearchBar.tsx - Search products

Include:
- Real-time product fetching from Supabase
- Error handling
- Loading states
```

### Prompt 1.4: Shopping Cart & Checkout Flow
```
Build a complete checkout flow for a coffee ordering app.

Requirements:
- Display cart items with quantity controls
- Show subtotal, tax (7%), total price
- Option for dine-in or takeaway
- Guest checkout (no login required)
- Submit order to Supabase
- Order confirmation page with order number

Components needed:
1. pages/cart.tsx - Cart page with item list
2. components/CartSummary.tsx - Price breakdown
3. pages/checkout.tsx - Checkout form
4. pages/order-confirmation.tsx - Order receipt

Features:
- Quantity increment/decrement
- Remove item from cart
- Input for customer name & phone (guest)
- Submit order & create database records
- Display order number & estimated time
- Print receipt functionality

Use Supabase transactions to ensure data consistency.
```

### Prompt 1.5: Order Confirmation & Receipt
```
Create an order confirmation screen with receipt printing capability.

Requirements:
- Display order number, date, time
- List all items ordered with quantities and prices
- Show subtotal, tax breakdown, total
- Estimated wait time (calculated from queue length)
- Print button for POS receipt
- Tailwind styling optimized for print (80mm thermal printer)
- QR code linking to order tracking (optional)

Create:
1. components/OrderReceipt.tsx - Receipt component
2. styles/receipt.css - Print styles
3. utils/receiptPrinter.ts - Print logic

Use:
- react-to-print for printing
- qrcode.react for QR code generation (optional)

Receipt format should look professional and work with 80mm thermal printers.
```

---

## **PHASE 2: CRM & LINE Loyalty - Prompts**

### Prompt 2.1: LINE OAuth Integration
```
Implement LINE Login authentication for a coffee shop app using Next.js.

Requirements:
- LINE Business OAuth 2.0 integration
- Store LINE user ID and profile data in Supabase
- Create session after successful login
- Logout functionality
- Redirect flow: Login → OAuth callback → Dashboard

Create:
1. lib/lineAuth.ts - LINE OAuth URL builder
2. pages/api/auth/line/callback.ts - OAuth callback handler
3. pages/login.tsx - Login page with LINE button
4. middleware/auth.ts - Authentication middleware

Details:
- Exchange authorization code for access token
- Fetch user profile from LINE
- Store line_user_id, line_access_token in users table
- Create Supabase session
- Handle errors gracefully

Environment variables:
- NEXT_PUBLIC_LINE_CLIENT_ID
- LINE_CLIENT_SECRET
- LINE_CHANNEL_ACCESS_TOKEN
```

### Prompt 2.2: Membership Tier System
```
Build a membership tier system (Bronze → Silver → Gold) for a loyalty program.

Requirements:
Tiers:
- Bronze: 0 points (1x multiplier)
- Silver: 1,000 points (1.5x multiplier, 5% discount)
- Gold: 5,000 points (2x multiplier, 10% discount, free drink monthly)

Database schema:
- membership_tiers table
- user_memberships table (links users to tiers with points)

Create:
1. SQL schema for membership system
2. service/membershipService.ts with functions:
   - getUserMembership(userId)
   - updateMembershipTier(userId)
   - getTierInfo(tierId)

Features:
- Auto-promote to next tier when points threshold reached
- Display tier badge with color
- Show points progress to next tier
- Calculate discount automatically on checkout

Include type definitions and error handling.
```

### Prompt 2.3: Points Earning & Redemption System
```
Create a points earning and redemption system for coffee shop loyalty.

Requirements:
- Earn points on every purchase (multiplier based on tier)
- Redeem points for free drinks (50 points = 1 free drink)
- Points history/transaction log
- Prevent point expiration (or set custom expiration)
- Show available points on every page

Services needed:
1. addPointsToOrder(orderId, userId, orderTotal)
   - Calculate points based on tier multiplier
   - Add to user_memberships.current_points
   - Create transaction log entry

2. redeemPoints(userId, pointsToRedeem)
   - Validate points availability
   - Create coupon/voucher
   - Deduct points from balance

3. getPointsHistory(userId)
   - List all transactions
   - Filter by date range

Components:
- components/PointsDisplay.tsx - Show current points
- components/RedemptionModal.tsx - Redeem dialog
- pages/points-history.tsx - Transaction history

Include Supabase RPC functions for atomic operations.
```

### Prompt 2.4: LINE Push Notifications for Points
```
Send LINE push notifications to notify customers about earned points.

Requirements:
- Send notification after order completion
- Show points earned and new total
- Format: "🎉 +150 points earned! Total: 2,500 points"
- Handle failed deliveries gracefully
- Log notification history

Create:
1. services/lineNotificationService.ts with functions:
   - sendPointsNotification(userId, pointsEarned, newTotal)
   - sendStatusNotification(userId, orderStatus)
   - sendCouponNotification(userId, coupon)

2. pages/api/notifications/send.ts - API endpoint

Features:
- Use LINE Official Account (Channel Access Token)
- Send rich messages with buttons (optional)
- Batch send for campaigns
- Retry logic for failed sends
- Track delivery status

Integrate with Phase 1 checkout to auto-send points notification.
```

### Prompt 2.5: Loyalty Dashboard
```
Build a loyalty dashboard showing membership status and points.

Requirements:
- Current tier with badge (color-coded)
- Points progress bar (current / next tier threshold)
- Recent transactions list (earned / redeemed)
- Tier benefits explanation
- Redemption button for available points
- Points expiration warning (if applicable)

Create:
1. pages/loyalty.tsx - Main loyalty dashboard
2. components/TierCard.tsx - Membership tier display
3. components/PointsProgressBar.tsx - Visual progress
4. components/TransactionHistory.tsx - Points history
5. components/RedemptionSection.tsx - Redeem UI

Features:
- Real-time points update from Supabase
- Mobile-responsive design
- Dark mode support
- Share tier achievement on LINE

Make it visually engaging with animations and clear hierarchy.
```

---

## **PHASE 3: KDS & Real-time Status - Prompts**

### Prompt 3.1: Kitchen Display System (KDS)
```
Create a Kitchen Display System (KDS) screen for real-time order management.

Requirements:
- Real-time order updates using Supabase subscriptions
- Three columns: Pending → Preparing → Ready
- Show order number, items, special instructions
- Color-coded priority (new orders = red, older = orange)
- Auto-refresh every 2 seconds
- Sound alert for new orders
- Mark order as "preparing" and "ready" with buttons

Create:
1. pages/kds.tsx - Main KDS screen
2. components/KDSColumn.tsx - Column for each status
3. components/OrderTicket.tsx - Individual order card
4. hooks/useKDSOrders.ts - Real-time subscription hook

Features:
- Supabase real-time subscription for kds_orders table
- Display item list with quantities
- Show special instructions prominently
- Estimated wait time calculation
- Tap to change status
- Archive completed orders

UI/UX:
- Large fonts for kitchen visibility
- Touchscreen-friendly buttons
- Minimize white space
- Dark theme recommended
- Show timestamp for each order

Include sound notification library.
```

### Prompt 3.2: Real-time Order Status Updates
```
Implement real-time order status tracking for customers.

Requirements:
- Customer sees: Pending → Preparing → Ready → Completed
- Update happens instantly across all connected clients
- Show estimated wait time
- Visual status progress indicator
- Show order number for quick reference

Create:
1. pages/order-status.tsx - Customer order tracking page
2. components/StatusProgressBar.tsx - Visual progress
3. hooks/useOrderStatus.ts - Subscribe to order updates
4. components/WaitTimeEstimate.tsx - Estimated time display

Features:
- Real-time updates using Supabase subscriptions
- Refresh automatically when status changes
- Show updates immediately without page refresh
- Responsive mobile design
- Order tracking by order number (guest orders)

Optional features:
- Queue position display (user's position in queue)
- Average wait time per item
- Share via QR code
```

### Prompt 3.3: Customer Notifications via LINE
```
Send status update notifications to customers via LINE when order status changes.

Requirements:
- Send notification when order status changes:
  - "preparing": "☕ Your order is being prepared"
  - "ready": "✅ Ready for pickup! Come to counter"
  - "completed": "🎉 Thanks for your order! See you soon"
- Include order number in notification
- Send only once per status change
- Handle users without LINE account (guests) gracefully

Create:
1. services/orderNotificationService.ts with function:
   - notifyOrderStatusChange(orderId, newStatus)
   - sendBatchNotifications(orderIds, status)

2. triggers/onOrderStatusChange.ts - Supabase trigger or Edge Function

Features:
- Check notification_sent flag in kds_orders to avoid duplicates
- Log all notifications for audit
- Handle delivery failures
- Retry mechanism for failed sends
- Optional: Rich message with buttons (e.g., "Call when ready")

Integration:
- Trigger after updating order status in KDS
- Include order tracking link in notification
```

### Prompt 3.4: Wait Time Estimation
```
Calculate and display estimated wait time for orders.

Requirements:
- Base wait time: 3-4 minutes per order
- Adjust for order complexity (items × 1.5 minutes each)
- Show queue position number
- Update dynamically as orders complete
- Show on KDS, customer tracking, LINE notifications

Create:
1. services/waitTimeService.ts with functions:
   - calculateWaitTime(queuePosition, itemCount): minutes
   - getQueuePosition(orderId): position
   - getAverageServiceTime(): minutes
   - estimateCompletionTime(orderId): DateTime

2. components/WaitTimeDisplay.tsx

Algorithm:
- Count pending + preparing orders
- Average service time: 3.5 minutes
- Complexity multiplier: 1 + (items * 0.5)
- Total wait = (queue_position * avg_time) + complexity_adjustment

Example:
- 5 orders ahead, current order has 2 items
- Wait = (5 × 3.5) + (2 × 0.5) = 18.5 minutes

Display:
- "Est. 18 min" on KDS
- "Your order: #3 in queue" on customer page
- Update every 30 seconds
```

---

## **PHASE 4: Admin Dashboard & Analytics - Prompts**

### Prompt 4.1: Admin Authentication & Role Management
```
Create admin authentication and role-based access control (RBAC).

Requirements:
Roles:
- Customer: View own orders, points, profile
- Staff: View orders, update status in KDS
- Manager: View analytics, manage products, view reports
- Admin: Full system access

Create:
1. SQL schema for admin_users table with roles
2. middleware/requireRole.ts - Middleware to check permissions
3. lib/permissions.ts - Permission definitions
4. components/ProtectedRoute.tsx - Route wrapper
5. lib/roleChecker.ts - Helper functions

Features:
- Create admin user from Supabase dashboard
- Assign roles to users
- Redirect unauthorized access to 403 page
- Check permissions on API routes
- Log admin actions for audit trail

Implement:
- requireAdmin() - Check if user is admin/manager
- requireManager() - Check if user is manager+
- hasPermission(userId, action) - Granular permission check

Include:
- Role-based page redirects
- Protected API endpoints
- Audit logging of admin actions
```

### Prompt 4.2: Revenue & Sales Analytics Dashboard
```
Build an admin analytics dashboard showing business metrics.

Requirements:
Metrics:
- Total Revenue (daily, weekly, monthly)
- Order Count & Average Order Value
- Top Products (by sales count & revenue)
- Revenue Trend Chart (line chart, 30 days)
- Hourly Order Distribution
- Customer Growth
- Peak Hours Analysis

Create:
1. pages/admin/analytics.tsx - Main dashboard
2. components/MetricCard.tsx - Stat display
3. components/RevenueChart.tsx - Revenue trend
4. components/TopProductsChart.tsx - Top sellers
5. components/HourlyDistribution.tsx - Orders by hour
6. services/analyticsService.ts - Data fetching

Data queries:
- SELECT SUM(total) FROM orders WHERE created_at >= X
- SELECT COUNT(*), AVG(total) FROM orders
- SELECT product_id, COUNT(*), SUM(price) FROM order_items GROUP BY product_id
- SELECT DATE(created_at), SUM(total) FROM orders GROUP BY DATE

Charts:
- Use Recharts or Chart.js for visualizations
- Line chart for revenue trend
- Bar chart for top products
- Pie chart for category breakdown

Features:
- Date range filter (Today, 7 days, 30 days, custom)
- Export to CSV
- Hourly breakdown
- Timezone support (UTC+7 for Thailand)
- Mobile responsive
- Dark mode
```

### Prompt 4.3: Customer Segmentation
```
Create customer segmentation for targeted marketing campaigns.

Requirements:
Segments:
- High-Value Customers: Total spent > $500
- Regular Customers: 2+ orders per month
- Inactive Customers: No order in 90 days
- VIP Members: Gold tier with 10+ orders
- New Customers: Registered < 30 days
- Loyalty Program Members: All registered users

Create:
1. SQL functions for segmentation queries
2. pages/admin/segments.tsx - View segments
3. components/SegmentList.tsx - List all segments
4. services/segmentationService.ts:
   - getHighValueCustomers(minSpend)
   - getInactiveCustomers(days)
   - getRegularCustomers(monthsActive)
   - getNewCustomers(daysOld)
   - getAllSegments()

Features:
- Export segment as CSV
- Send campaigns to segment
- View segment details
- Filter customers within segment
- Track segment metrics (size, avg spend, etc.)

Display:
- Segment name & size
- Average spend per customer
- Last order date (for inactive)
- Growth trend
- Actions: Email, LINE broadcast, discount campaign
```

### Prompt 4.4: Campaign Management & LINE Broadcasting
```
Build campaign management system to send promotions via LINE.

Requirements:
Campaign types:
- Discount campaigns (e.g., "20% off this weekend")
- Loyalty promotions (e.g., "Double points")
- Seasonal campaigns (e.g., "New flavor launch")
- Re-engagement (e.g., "Come back, we miss you!")

Create:
1. pages/admin/campaigns.tsx - Campaign management
2. components/CampaignForm.tsx - Create/edit campaign
3. components/SegmentSelector.tsx - Target audience
4. pages/admin/campaigns/:id/preview.tsx - Preview message
5. services/campaignService.ts:
   - createCampaign(data)
   - sendCampaign(campaignId)
   - getCampaignMetrics(campaignId)
   - updateCampaignStatus(campaignId, status)

Features:
- Target specific customer segments
- Schedule campaigns for future date/time
- Rich message templates (buttons, images)
- A/B testing (optional)
- Track delivery & click rates
- Campaign history & analytics

Campaign fields:
- Campaign name & description
- Start & end date
- Target segment
- Message template
- CTA (Call-to-Action) button
- Discount code (if applicable)

Send via LINE:
- Use push API to send bulk messages
- Log all sends for audit
- Track delivery status
- Handle opt-outs

Include:
- Rich message builder
- Preview on phone mockup
- Scheduling UI
- Analytics: sent, delivered, clicked, redeemed
```

---

## **PHASE 5: Deployment & Polish - Prompts**

### Prompt 5.1: PWA Configuration
```
Configure the app as a Progressive Web App (PWA) for installability.

Requirements:
- Installable on mobile home screen
- Offline support (cache first strategy)
- Web app manifest
- Service worker
- Install prompt
- App icon for different sizes

Create:
1. Configure next-pwa plugin
2. public/manifest.json - Web app manifest
3. public/service-worker.ts - Service worker
4. public/icons/ - App icons (192x192, 512x512, favicon)
5. components/PWAInstallPrompt.tsx - Install UI

Implementation:
- Install next-pwa: npm install next-pwa
- Add to next.config.js
- Create manifest.json with app metadata
- Service worker for offline caching
- Cache strategies: cache-first for static, network-first for API

Features:
- Install prompt on iOS & Android
- Offline page when network unavailable
- Push notification capability
- Standalone mode (no URL bar)
- App icon on home screen

Manifest includes:
- App name, short name
- Icons in multiple sizes
- Start URL, theme color
- Display mode (standalone)
- Orientation (portrait)
```

### Prompt 5.2: Production Deployment (Vercel)
```
Deploy the Coffee Flow app to Vercel for production.

Requirements:
- Zero-downtime deployment
- Environment-specific configs
- Database backups
- CI/CD pipeline with GitHub Actions
- Performance monitoring
- Error tracking (Sentry)

Create:
1. vercel.json - Deployment config
2. .github/workflows/deploy.yml - GitHub Actions
3. Setup Sentry for error tracking
4. Database backup strategy

Implementation:
- Connect GitHub repo to Vercel
- Set environment variables in Vercel dashboard
- Deploy on push to main branch
- Preview deploys for pull requests
- Automatic rollbacks on failure

Performance:
- Optimize images with Next.js Image component
- Code splitting & lazy loading
- Database query optimization
- CDN caching strategy
- Monitor Core Web Vitals

Monitoring:
- Sentry for error tracking
- Vercel Analytics for performance
- Custom logging to Supabase
- Alert on critical errors

Commands:
- npm run build
- npm start
- vercel --prod
```

### Prompt 5.3: Error Handling & Logging
```
Implement comprehensive error handling and logging for production.

Requirements:
- Global error boundary
- API error handling
- Supabase error handling
- User-friendly error messages
- Detailed error logs for debugging
- Error tracking with Sentry

Create:
1. components/ErrorBoundary.tsx - React error boundary
2. lib/errorHandler.ts - Centralized error handling
3. services/logger.ts - Logging service
4. middleware/errorMiddleware.ts - API error handler
5. Setup Sentry integration

Error types:
- Network errors (retry logic)
- Database errors (user-friendly message)
- Authentication errors (redirect to login)
- Business logic errors (toast notification)
- Unexpected errors (report to Sentry)

Features:
- Try-catch wrapping for async operations
- Error logging to Supabase logs table
- Sentry integration for crash reporting
- User-friendly error messages
- Stack trace in dev mode, hidden in production
- Automatic retry for failed API calls

Example error responses:
- Network error: "Connection failed, please try again"
- Database error: "Something went wrong, please contact support"
- Auth error: "Session expired, please login again"
- Validation error: Show specific field error

Logging levels:
- ERROR: Critical issues needing immediate attention
- WARN: Potential issues that should be monitored
- INFO: Important business events (order placed, points redeemed)
- DEBUG: Detailed info for troubleshooting
```

### Prompt 5.4: Testing Suite
```
Build a comprehensive testing suite for the Coffee Flow app.

Requirements:
Testing types:
- Unit tests for utility functions
- Component tests for React components
- Integration tests for API flows
- E2E tests for critical user journeys

Create:
1. jest.config.js - Jest configuration
2. __tests__/unit/ - Utility tests
3. __tests__/components/ - Component tests
4. __tests__/integration/ - API integration tests
5. e2e/ - Playwright E2E tests

Setup:
- npm install --save-dev jest @testing-library/react @testing-library/jest-dom
- npm install --save-dev playwright @playwright/test
- Add test scripts to package.json

Tests to create:
- Guest checkout flow (end-to-end)
- Add to cart & remove items
- Order placement & confirmation
- Points calculation
- Membership tier upgrade
- Loyalty dashboard
- KDS order status update
- Admin analytics queries
- LINE notification sending

Test coverage goal: 80%+

CI/CD:
- Run tests on every PR
- Block merge if tests fail
- Upload coverage reports
- Test on multiple browsers (Chrome, Firefox, Safari)

Example test:
```typescript
describe('Checkout Flow', () => {
  it('should calculate total with tax correctly', () => {
    const cart = [{ price: 100, qty: 2 }];
    const total = calculateTotal(cart);
    expect(total).toBe(214); // 200 + 14% tax
  });
});
```
```

---

## **How to Use These Prompts**

1. **Copy the relevant prompt** from above
2. **Paste into Claude chat** with your project context
3. **Customize** as needed (adjust numbers, requirements, etc.)
4. **Ask for specific outputs**: TypeScript code, SQL schema, React components, etc.
5. **Follow up with**: "Create the component folder structure", "Add error handling", "Write tests"

---

## **Example Full Workflow**

```
Session 1:
- Use Prompt 1.1: Get project structure & Supabase schema
- Use Prompt 1.2: Get Zustand store for cart

Session 2:
- Use Prompt 1.3: Get product catalog
- Use Prompt 1.4: Get checkout flow

Session 3:
- Use Prompt 2.1: Get LINE OAuth integration
- Use Prompt 2.2: Get membership tier system

... and so on
```

---

## **Pro Tips**

1. **Ask Claude to generate boilerplate** instead of typing it all
2. **Request TypeScript types first**, then implementation
3. **Ask for "complete, production-ready code"** with error handling
4. **Request Supabase RPC functions** for complex queries
5. **Get SQL migrations** for database changes
6. **Ask for tests** as part of the code generation
7. **Request API endpoint documentation** in comments

---

## **Phase-by-Phase Timeline**

- **Week 1-3:** Phases 1.1-1.5
- **Week 4-6:** Phases 2.1-2.5
- **Week 7-8:** Phases 3.1-3.4
- **Week 9-11:** Phases 4.1-4.4
- **Week 12:** Phase 5.1-5.4

Good luck building! 🚀☕
