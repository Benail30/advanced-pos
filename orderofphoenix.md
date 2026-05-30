# Complete Technical Overview — Advanced POS System

---

## 1. Tools and Technologies (all `package.json` dependencies)

**Core Framework**
| Package | Version | Purpose |
|---|---|---|
| `next` | 14.1.0 | Full-stack framework (App Router, server components, API routes) |
| `react` / `react-dom` | ^18 | UI rendering |
| `typescript` | ^5 | Static typing |

**Authentication**
| Package | Purpose |
|---|---|
| `next-auth` ^4.24.14 | Session management, JWT strategy, CredentialsProvider |
| `bcryptjs` ^3.0.2 | Password hashing (compare on login, hash on register) |
| `jsonwebtoken` ^9.0.2 | Used separately for Metabase signed embed JWTs |

**Database**
| Package | Purpose |
|---|---|
| `prisma` ^7.8.0 | ORM + schema migrations (`db push`) |
| `@prisma/client` ^7.8.0 | Generated type-safe query client |
| `@prisma/adapter-pg` ^7.8.0 | Prisma adapter for `pg` (raw PostgreSQL driver) |
| `pg` ^8.16.0 | PostgreSQL Node.js driver |
| `postgres` ^3.4.3 | Secondary postgres client (installed, minimal use) |
| `@vercel/postgres` ^0.10.0 | Installed, not actively used |

**UI Components & Styling**
| Package | Purpose |
|---|---|
| `tailwindcss` ^3.4.17 | Utility-first CSS |
| `shadcn-ui` ^0.9.5 | Component library scaffolding CLI |
| `@radix-ui/react-*` | Headless accessible primitives: avatar, dialog, dropdown, label, select, slot, tabs, toast |
| `lucide-react` ^0.483.0 | Icon library |
| `class-variance-authority` ^0.7.1 | Variant-based className management |
| `clsx` ^2.1.1 | Conditional className merging |
| `tailwind-merge` ^3.3.0 | Merge conflicting Tailwind classes |
| `tw-animate-css` ^1.2.4 | Animation utilities |
| `geist` ^1.3.1 | Vercel Geist font |
| `next-themes` ^0.4.6 | Dark/light mode toggle (installed, not actively wired) |
| `sonner` ^2.0.1 | Toast notification system |

**Forms & Validation**
| Package | Purpose |
|---|---|
| `react-hook-form` ^7.54.2 | Form state management |
| `@hookform/resolvers` ^4.1.3 | Connects react-hook-form to Zod |
| `zod` ^3.25.30 | Schema validation |

**Receipt & PDF**
| Package | Purpose |
|---|---|
| `@react-pdf/renderer` ^4.5.1 | Generates downloadable PDF receipts (A6 format) |
| `qrcode` ^1.5.4 | Server-side QR code generation |
| `qrcode.react` ^4.2.0 | Client-side QR code SVG in the POS success modal |
| `@types/qrcode` ^1.5.5 | Types for qrcode |

**Analytics**
| Package | Purpose |
|---|---|
| `recharts` ^3.8.1 | Installed, not used (Metabase replaced it) |
| `powerbi-client` ^2.23.1 | Installed, not used (was considered, replaced by Metabase) |

**Utilities**
| Package | Purpose |
|---|---|
| `@paralleldrive/cuid2` ^2.2.2 | CUID generation (Prisma uses it internally) |
| `uuid` ^11.1.0 | UUID generation (installed, minimal use) |
| `cookie` ^1.0.2 | Cookie parsing |
| `dotenv` ^16.4.7 | `.env` file loading for seed script |
| `node-fetch` ^3.3.2 | Fetch polyfill for Node scripts |
| `@azure/identity` ^4.8.0 | Azure auth (installed, not used) |

**Dev Dependencies (notable)**
| Package | Purpose |
|---|---|
| `eslint` + `eslint-config-next` | Linting |
| `@tailwindcss/forms`, `typography`, `aspect-ratio` | Tailwind plugins |
| `tailwindcss-animate` | Animation plugin |
| `tsx` ^4.7.1 | TypeScript execution for seed script |
| `express` ^5.1.0 | Used in dev proxy scripts |
| `http-proxy-middleware` ^3.0.3 | Dev proxy |
| `postcss` + `postcss-nesting` | CSS processing |

---

## 2. Exact Folder Structure

```
c:\dev\pos-pfe\
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed script (SUPER_ADMIN + demo data)
├── public/
│   └── uploads/                   # Product image uploads (gitignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   ├── page.tsx               # Public home/landing page
│   │   ├── providers.tsx          # SessionProvider, Toaster wrappers
│   │   ├── error.tsx              # Global error boundary
│   │   ├── global-error.tsx       # Root error boundary
│   │   ├── loading.tsx            # Global loading state
│   │   ├── not-found.tsx          # 404 page
│   │   │
│   │   ├── login/page.tsx         # ADMIN login (Suspense + callbackUrl)
│   │   ├── register/page.tsx      # ADMIN self-registration
│   │   ├── cashier/login/page.tsx # CASHIER login
│   │   │
│   │   ├── super-admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # SuperAdmin dashboard (server component)
│   │   │   │   └── admins-client.tsx # Client table with activate/deactivate
│   │   │   └── components/super-admin-nav.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Admin shell with sidebar
│   │   │   ├── page.tsx           # KPI cards + Metabase iframe
│   │   │   └── components/admin-sidebar.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Product + category management
│   │   ├── orders/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Order history with filters + refund
│   │   ├── users/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Cashier management
│   │   ├── stores/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Store info
│   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Account settings
│   │   │
│   │   ├── pos/
│   │   │   ├── layout.tsx         # POS shell (conditional navbar)
│   │   │   ├── page.tsx           # POS terminal (product grid + cart)
│   │   │   ├── history/page.tsx   # Cashier order history
│   │   │   └── settings/page.tsx  # Cashier settings (password change)
│   │   │
│   │   ├── receipt/[orderId]/
│   │   │   ├── page.tsx           # Public receipt page (server rendered)
│   │   │   ├── receipt-pdf.tsx    # @react-pdf/renderer PDF document
│   │   │   └── download-button.tsx # Client "Download PDF" button
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │       │   └── register/route.ts       # Admin registration
│   │       ├── products/
│   │       │   ├── route.ts               # GET (list) + POST (create)
│   │       │   └── [id]/route.ts          # PUT (update) + DELETE
│   │       ├── categories/
│   │       │   ├── route.ts               # GET + POST
│   │       │   └── [id]/route.ts          # PUT + DELETE
│   │       ├── orders/
│   │       │   ├── route.ts               # GET (list) + POST (create sale)
│   │       │   └── [id]/route.ts          # GET (single) + POST (refund)
│   │       ├── users/
│   │       │   ├── route.ts               # GET (list cashiers) + POST (create)
│   │       │   └── [id]/route.ts          # PUT + DELETE
│   │       ├── stores/
│   │       │   ├── route.ts               # GET + POST
│   │       │   └── [id]/route.ts          # PUT + DELETE
│   │       ├── upload/route.ts            # POST — image upload to /public/uploads
│   │       ├── cashier/password/route.ts  # POST — cashier password change
│   │       └── super-admin/
│   │           ├── admins/route.ts        # GET (all admins)
│   │           └── admins/[id]/route.ts   # PATCH (toggle isActive) + DELETE
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (button, card, input, etc.)
│   │   ├── Invoice.tsx            # Unused legacy component
│   │   ├── navbar.tsx             # Legacy unused navbar
│   │   ├── admin/
│   │   │   ├── dashboard.tsx      # Unused legacy dashboard
│   │   │   └── PowerBIEmbed.tsx   # Unused PowerBI experiment
│   │   └── pos/
│   │       ├── navbar.tsx         # POS top navbar
│   │       ├── conditional-navbar.tsx # Conditionally shows POS navbar
│   │       ├── cart.tsx           # Legacy cart component (unused)
│   │       ├── checkout.tsx       # Legacy checkout (unused)
│   │       ├── customer-form.tsx  # Legacy (unused)
│   │       ├── customer-management.tsx # Legacy (unused)
│   │       ├── customer-segments.tsx   # Legacy (unused)
│   │       ├── inventory-management.tsx # Legacy (unused)
│   │       ├── payment-processing.tsx  # Legacy (unused)
│   │       ├── product-grid.tsx        # Legacy (unused)
│   │       ├── receipt.tsx             # Legacy receipt (unused — replaced by /receipt/[orderId])
│   │       └── transaction-history.tsx # Legacy (unused)
│   │
│   ├── lib/
│   │   ├── auth.ts                # NextAuth authOptions config
│   │   ├── prisma.ts              # Prisma singleton client
│   │   ├── metabase.ts            # Signed embed JWT generator
│   │   └── utils/
│   │       ├── utils.ts           # cn() helper
│   │       └── qr.ts              # QR code server utility
│   │
│   ├── generated/prisma/          # Auto-generated Prisma client (do not edit)
│   ├── middleware.ts              # Route guard (role-based protection)
│   └── types/
│       ├── index.ts               # Shared TypeScript types
│       └── next-auth.d.ts         # NextAuth session type augmentation
│
├── .env.local                     # Secrets (gitignored)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── docker-compose.yml             # PostgreSQL + Adminer + Metabase containers
```

---

## 3. Development Tools Actually Used

| Tool | What for |
|---|---|
| **VS Code** | Primary IDE |
| **Claude Code** | AI-assisted development |
| **Git** | Version control — `git init` locally, force-pushed to `github.com/Benail30/advanced-pos` |
| **Docker Desktop** | Runs PostgreSQL (port 5433), Adminer (port 8080), Metabase (port 4000) |
| **Adminer** | Database GUI — accessed at `localhost:8080`, server=`postgres`, db=`pos_db` |
| **ngrok** | Tunnels `localhost:3000` to a public URL for mobile/external testing |
| **Metabase** | Self-hosted BI tool for analytics dashboard |
| **Prisma Studio** (`npm run db:studio`) | Visual DB editor |
| **ESLint** | Code linting |
| **No testing framework** | No unit/integration tests were written |
| **No design tool** | UI built directly in code with Tailwind + shadcn |

---

## 4. Database Schema (all models)

**Enums**
```
Role:          SUPER_ADMIN | ADMIN | CASHIER
OrderStatus:   COMPLETED | REFUNDED
PaymentMethod: CASH | CARD | NFC
```

**User**
| Field | Type | Constraints |
|---|---|---|
| id | String (cuid) | PK |
| email | String | unique |
| password | String | bcrypt hash |
| name | String? | nullable |
| role | Role | SUPER_ADMIN / ADMIN / CASHIER |
| isActive | Boolean | default true |
| storeId | String? | FK → Store (only CASHIER) |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

Relations: `ownedStores Store[]` — ADMIN owns stores; `store Store?` — CASHIER belongs to one store; `orders Order[]`

**Store**
| Field | Type | Constraints |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| adminId | String | FK → User |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

Relations: `cashiers User[]`, `products Product[]`, `orders Order[]`, `categories Category[]`

**Category**
| Field | Type | Constraints |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| description | String? | nullable |
| storeId | String | FK → Store |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

Unique constraint: `(name, storeId)` — same category name cannot exist twice in one store.

**Product**
| Field | Type | Constraints |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| description | String? | nullable |
| imageUrl | String? | nullable — path to uploaded file |
| buyPrice | Decimal(10,2) | cost price |
| sellPrice | Decimal(10,2) | selling price |
| stock | Int | default 0 |
| sku | String? | nullable |
| storeId | String | FK → Store |
| categoryId | String? | FK → Category, nullable |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

Unique constraint: `(sku, storeId)`

**Order**
| Field | Type | Constraints |
|---|---|---|
| id | String | PK — custom 7-digit number, unique per store |
| status | OrderStatus | default COMPLETED |
| customerName | String? | nullable |
| paymentMethod | PaymentMethod | default CASH |
| total | Decimal(10,2) | sum at time of sale |
| storeId | String | FK → Store |
| cashierId | String | FK → User |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

**OrderItem**
| Field | Type | Constraints |
|---|---|---|
| id | String (cuid) | PK |
| quantity | Int | |
| unitPrice | Decimal(10,2) | snapshot of sellPrice at sale time |
| unitCost | Decimal(10,2) | snapshot of buyPrice at sale time, default 0 |
| orderId | String | FK → Order |
| productId | String | FK → Product |

---

## 5. All API Routes

| Method | Path | Role | What it does |
|---|---|---|---|
| POST | `/api/auth/[...nextauth]` | Public | NextAuth sign-in/sign-out/session |
| POST | `/api/auth/register` | Public | Create ADMIN + Store in one transaction |
| GET | `/api/products` | ADMIN, CASHIER | List all products for the caller's store |
| POST | `/api/products` | ADMIN | Create product (with optional image) |
| PUT | `/api/products/[id]` | ADMIN | Update product fields |
| DELETE | `/api/products/[id]` | ADMIN | Delete product |
| GET | `/api/categories` | ADMIN, CASHIER | List categories for the store |
| POST | `/api/categories` | ADMIN | Create category |
| PUT | `/api/categories/[id]` | ADMIN | Update category |
| DELETE | `/api/categories/[id]` | ADMIN | Delete category |
| GET | `/api/orders` | ADMIN, CASHIER | List orders (ADMIN = full store, CASHIER = own only); supports `?status=`, `?paymentMethod=`, `?search=`, `?from=`, `?to=`, `?cashierId=` |
| POST | `/api/orders` | CASHIER | Create order — validates stock, runs transaction (decrement stock + create Order + OrderItems) |
| GET | `/api/orders/[id]` | Public | Fetch single order by ID (used by receipt page, no auth required) |
| POST | `/api/orders/[id]` | ADMIN | Refund order — sets status=REFUNDED, restores stock in transaction |
| GET | `/api/users` | ADMIN | List cashiers in the store |
| POST | `/api/users` | ADMIN | Create cashier account (assigned to admin's store) |
| PUT | `/api/users/[id]` | ADMIN | Update cashier name/email/password |
| DELETE | `/api/users/[id]` | ADMIN | Delete cashier |
| GET | `/api/stores` | ADMIN | Get store info |
| PUT | `/api/stores/[id]` | ADMIN | Update store name |
| POST | `/api/upload` | ADMIN | Upload product image → saves to `/public/uploads/`, returns URL |
| POST | `/api/cashier/password` | CASHIER | Change own password |
| GET | `/api/super-admin/admins` | SUPER_ADMIN | List all ADMIN users with their store stats |
| PATCH | `/api/super-admin/admins/[id]` | SUPER_ADMIN | Toggle `isActive` (activate/deactivate admin) |
| DELETE | `/api/super-admin/admins/[id]` | SUPER_ADMIN | Delete admin + cascade delete their entire store (orders, products, categories, cashiers) |

---

## 6. Authentication — Exact Mechanism

**Library:** `next-auth` v4 with `CredentialsProvider`
**Strategy:** JWT (stateless — no database sessions table)

**Login flow:**
1. User submits email + password to `POST /api/auth/callback/credentials`
2. `authorize()` function: finds user by email → checks `isActive` → `bcrypt.compare(password, hash)` → returns `{ id, email, name, role }`
3. `jwt()` callback: injects `role` into the JWT token
4. `session()` callback: maps `token.sub` → `session.user.id`, maps `token.role` → `session.user.role`
5. Token stored in an encrypted `next-auth.session-token` HttpOnly cookie

**Middleware guard** (`src/middleware.ts`):
- Runs on every matched route using `getToken()` (reads JWT from cookie without a DB round-trip)
- Checks `token.role` against the route type: ADMIN routes, CASHIER routes, SUPER_ADMIN routes
- Redirects with `?callbackUrl=` on unauthorized access
- `isActive` checked at login time — `authorize` returns `null` if false, NextAuth rejects the login

**Three separate login pages:**
- `/login` — ADMIN
- `/cashier/login` — CASHIER
- `/super-admin/login` — SUPER_ADMIN

All use `signIn('credentials', { ... })` from `next-auth/react`.

**Metabase JWT** (separate from NextAuth):
Generated server-side using Node's `crypto.createHmac('sha256', METABASE_SECRET_KEY)`. The JWT payload locks `store_id` so the embedded iframe can only show that tenant's data.

---

## 7. How the POS Works

**`/pos/page.tsx`** — fully client-side React component (`'use client'`)

**Product loading:**
- On mount, fetches `GET /api/products` — returns all products for the cashier's store
- Maps response to local `Product[]` state with `id, name, price (sellPrice), stock, category, imageUrl`
- Extracts unique categories for the filter tabs

**Cart logic (pure React state):**
- `cart: CartItem[]` — array of `{ ...product, quantity }`
- `addToCart(product)`: if already in cart, increments quantity (capped at `product.stock`); otherwise appends with `quantity: 1`; blocked if `stock <= 0`
- `updateQty(id, qty)`: sets quantity — if `qty <= 0`, removes the item
- Quantity buttons in cart are capped at `item.stock`
- Subtotal: `Σ price × quantity` (computed with `useMemo`)

**Checkout flow:**
1. Cashier clicks "Validate" → opens confirmation modal
2. Confirmation modal shows item breakdown, total, customer name, payment method
3. On "Confirm" → `POST /api/orders` with `{ items, customerName, paymentMethod }`
4. API validates: session/role, products belong to store, sufficient stock per item
5. Prisma transaction: decrement stock for each product → create Order + OrderItems (with `unitPrice` and `unitCost` snapshots)
6. On success:
   - Local product stock is updated immediately (optimistic update)
   - `completedOrder = { id, total }` triggers the success modal
7. **Success modal** shows: order ID, total, and a **QR code** pointing to `NEXT_PUBLIC_APP_URL/receipt/{orderId}`
8. "New Sale" clears cart, customer name, payment method

---

## 8. Analytics / Dashboard

**Two layers:**

**Layer 1 — KPI Cards** (server component, no client JS):
`/dashboard/page.tsx` fetches directly from PostgreSQL via Prisma:
- Revenue: `Σ unitPrice × quantity` (COMPLETED orders only)
- Gross Profit: `Σ (unitPrice − unitCost) × quantity` (COMPLETED orders only)
- Order count: `prisma.order.count({ where: { status: 'COMPLETED' } })`
- Low stock count: `prisma.product.count({ where: { stock: { gt: 0, lt: 10 } } })`
- Store stats: product count, category count, cashier count (via `_count`)

**Layer 2 — Metabase Embedded Dashboard** (self-hosted BI):
Metabase runs in Docker at `localhost:4000`.

The embed flow:
1. Server component calls `metabaseEmbedUrl(store.id)`
2. Function builds HS256 JWT payload: `{ resource: { dashboard: 2 }, params: { store_id: storeId }, exp: now+3600 }`
3. Signs with `METABASE_SECRET_KEY` using `crypto.createHmac`
4. Returns `http://localhost:4000/embed/dashboard/{token}#bordered=false&titled=false`
5. The `<iframe src={embedUrl}>` is rendered — height 800px
6. Metabase verifies the JWT signature and reads the locked `store_id` parameter

**Dashboard 2 "POS Analytics" has 4 charts:**
- Revenue vs Profit by Day (line chart)
- Revenue by Product (bar chart)
- Profit by Product (bar chart)
- Orders by Cashier (bar chart)

All 4 charts use native SQL with `WHERE o.status = 'COMPLETED' AND o."storeId" = {{store_id}}`. The `store_id` template tag is locked via `embedding_params: { store_id: "locked" }` on the Metabase dashboard.

---

## 9. Payment Methods Supported

Three methods, selected in the POS cart panel:

| Value | Label | Icon |
|---|---|---|
| `CASH` | Cash | Banknote icon |
| `CARD` | Card | CreditCard icon |
| `NFC` | NFC | Smartphone icon |

These are stored as a PostgreSQL enum `PaymentMethod` and displayed as "Cash", "Credit Card", "NFC / Mobile" on receipts. **No real payment processing is integrated** — the cashier selects the method manually after physically accepting payment.

---

## 10. Receipt / Invoice Generation

**Three mechanisms:**

**A — Web Receipt Page** (`/receipt/[orderId]`):
- Public route (no authentication required)
- Server component fetches order from DB by ID
- Renders a clean card with: store name, date, order #, cashier, customer name (if any), payment method, item list with quantities and line totals, grand total
- Shows a red "REFUNDED" badge if `order.status === 'REFUNDED'`
- Has a "Download PDF" button

**B — PDF Receipt Download** (`receipt-pdf.tsx` + `download-button.tsx`):
- Uses `@react-pdf/renderer` to render a `<Document>` on A6 paper size
- Contains: store name, receipt header, all order metadata, items table, grand total, "REFUNDED" stamp if applicable
- Client component (`download-button.tsx`) calls `@react-pdf/renderer`'s `pdf()` function in the browser, creates a Blob URL, triggers `<a download>`
- Entirely client-side PDF generation — no server PDF rendering

**C — QR Code on POS**:
- After a sale completes, the POS shows a `<QRCodeSVG>` (from `qrcode.react`) pointing to the receipt URL
- Customer scans the QR code with their phone to view/download their receipt

---

## 11. System Architecture

```
Browser
  │
  ├── GET/POST fetch calls → Next.js API Routes (/api/*)
  │                               │
  │                               ├── getServerSession(authOptions) — validates JWT cookie
  │                               ├── Prisma Client → PostgreSQL (port 5433 on host)
  │                               └── Returns JSON
  │
  ├── Server Components (dashboard, receipt page) → direct Prisma calls at render time
  │
  └── <iframe src={metabaseEmbedUrl}> → Metabase (localhost:4000)
                                              │
                                              └── Metabase → PostgreSQL (port 5432 inside Docker network)
```

**Key points:**
- Next.js serves both the frontend and the backend from a single process on port 3000
- No separate API server — API routes are co-located in `src/app/api/`
- PostgreSQL runs in Docker (`pos-network`). The Next.js app connects via `localhost:5433` (mapped port). Metabase connects via `postgres:5432` (internal Docker network hostname). Adminer connects via `postgres:5432` (same Docker network)
- Communication between browser and API: standard HTTP fetch, with JWT in a `HttpOnly` cookie managed by NextAuth
- ngrok tunnels `localhost:3000` → public URL for mobile receipt scanning

---

## 12. Notable Features

**Multi-tenancy (store isolation):**
Every ADMIN owns exactly one store. Every Prisma query in the admin routes starts with `store.findFirst({ where: { adminId: session.user.id } })` and all subsequent queries use the resulting `storeId`. It is architecturally impossible for one admin to read or modify another admin's data.

**Stock management:**
- Real-time stock decrement inside a Prisma transaction when an order is placed
- Atomic: if any product has insufficient stock, the entire order is rejected (no partial orders)
- Low-stock alert on the dashboard: products with `0 < stock < 10` trigger an orange warning
- Refund restores stock: the refund endpoint increments stock for every order item in a transaction

**Refund system:**
`POST /api/orders/[id]` with ADMIN role flips `status` from `COMPLETED` to `REFUNDED` and restores all product stock atomically. The `REFUNDED` status is shown on the receipt page and PDF.

**Image uploads:**
`POST /api/upload` accepts `multipart/form-data`, saves the file to `/public/uploads/`, returns a URL. Products display images in the POS grid and inventory.

**Cashier password change:**
Cashiers can change their own password at `/pos/settings` via `POST /api/cashier/password` — requires the current password to be verified first.

**Admin account lifecycle (SUPER_ADMIN controls):**
- SUPER_ADMIN can activate/deactivate any ADMIN account (`PATCH /api/super-admin/admins/[id]` with `{ isActive: boolean }`)
- A deactivated admin's session cookie still exists but the next login attempt is blocked at the `authorize` function level (`if (!user.isActive) return null`)
- SUPER_ADMIN can permanently delete an admin, which cascades: deletes all OrderItems → Orders → Products → Categories → un-assigns Cashiers → deletes Store → deletes User

**Custom order IDs:**
Order IDs are not UUIDs — they are 7-digit random integers (`1000000–9999999`), unique per store. This makes order numbers human-readable for cashiers and receipts.

---

## 13. Project Name

The exact project name (as in `package.json`) is:

**`advanced-pos`**

The GitHub repository is `github.com/Benail30/advanced-pos`. There is no official brand/company name — it is a PFE (final year thesis project).
