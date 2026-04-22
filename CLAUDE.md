# Coffee Flow CRM & Ordering System — CLAUDE.md

## Project Overview

12-week full-stack bootcamp project. Coffee shop management system with guest ordering, LINE loyalty CRM, Kitchen Display System (KDS), and admin analytics.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Next.js API routes (server-side)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: LINE OAuth 2.0 (custom, not Supabase Auth)
- **State**: Zustand (cart + guest session, persisted to localStorage)
- **Notifications**: react-hot-toast

## Project Structure

```text
app/                          ← Next.js app (run dev server from here)
  src/
    app/                      ← Pages (App Router)
      api/auth/line/          ← LINE OAuth routes (login, callback, me)
      api/orders/             ← Order creation + history API
      api/kds/                ← KDS read/update (supabaseAdmin)
      api/admin/              ← Analytics, staff, campaigns, segments
      menu/                   ← Product catalog + cart
      checkout/               ← Order placement
      confirmation/           ← Post-order receipt + print
      order-status/[orderId]/ ← Real-time order tracking
      orders/                 ← Guest order history
      login/                  ← LINE login page
      loyalty/                ← Membership dashboard
      kds/                    ← Kitchen Display System
      admin/                  ← Admin dashboard, staff, campaigns
    components/               ← Shared UI components
    hooks/                    ← useUser (current LINE user)
    lib/
      supabase.ts             ← Anon client (client-safe)
      supabaseAdmin.ts        ← Service role client (server-only)
      lineAuth.ts             ← LINE OAuth helpers (server-only)
      membership.ts           ← Points + tier logic (server-only)
      tierUtils.ts            ← Pure tier functions (client-safe)
    store/
      guestStore.ts           ← Zustand cart + session store
    types/index.ts            ← Shared TypeScript types
    middleware.ts             ← Protects /admin routes
```

## Running the Project

The folder name contains `&` which breaks `npm run dev` on Windows. Use PowerShell:

```powershell
Set-Location "c:\Users\User\Project\Coffee Flow CRM & Ordering System\app"
node .\node_modules\next\dist\bin\next dev
```

## Key Architecture Rules

- **`supabaseAdmin`** — server-side only (service role key bypasses RLS). Never import in client components or pages.
- **`tierUtils.ts`** — client-safe pure functions. Import this in components instead of `membership.ts`.
- **All data reads/writes** — go through API routes with `supabaseAdmin`. Anon client is only used for Realtime channel subscriptions (triggers only).
- **LINE session** — stored in httpOnly cookies: `line_user_id` (Supabase UUID) and `line_access_token`.
- **Guest session** — stored in localStorage via Zustand persist: `guestSessionId`.
- **Order API** — always use `/api/orders` POST route so points are awarded server-side.
- **Admin session** — stored in httpOnly cookie `admin_session` (base64 JSON). Protected by `middleware.ts`.

## Environment Variables (app/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_LINE_CLIENT_ID=
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=
NEXT_PUBLIC_LINE_LIFF_ID=
LINE_CHANNEL_ACCESS_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Tables (all in Supabase)

| Table | Purpose |
| --- | --- |
| `users` | LINE-authenticated users |
| `products` | Menu items (seeded with 19 products) |
| `orders` | All orders (guest + member) |
| `order_items` | Line items per order |
| `guest_sessions` | Guest session tracking |
| `membership_tiers` | Bronze / Silver / Gold config |
| `user_memberships` | Per-user points + tier |
| `kds_orders` | Kitchen display entries |
| `order_items_detail` | KDS item-level detail |
| `admin_users` | Staff / manager / admin roles |
| `customer_segments` | CRM segmentation |
| `campaigns` | LINE marketing campaigns |

## Phase Progress

| Phase | Status |
| --- | --- |
| Phase 1: Core Ordering | ✅ Complete |
| Phase 2: CRM & LINE Loyalty | ✅ Complete (push notifications pending LINE token) |
| Phase 3: KDS & Real-time | ✅ Complete |
| Phase 4: Admin & Analytics | ✅ Complete (LINE bulk messaging pending) |
| Phase 5: Deployment | ⏳ Not Started |

## Supabase Realtime

`kds_orders` and `orders` tables are added to `supabase_realtime` publication. Use `supabase.channel()` for live subscriptions (read data via API on trigger).

## Important Notes

- `membership_tiers` is seeded with Bronze/Silver/Gold — do not re-run the seed INSERT.
- Points are earned server-side only via `lib/membership.ts` → `addPointsForOrder()`.
- The `&` in the project folder path causes issues with Windows cmd.exe. Always use PowerShell.
- To create an admin user: add them to Supabase Auth, then insert into `admin_users` table with their UUID and role.
