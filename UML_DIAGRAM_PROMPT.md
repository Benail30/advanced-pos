# UML Diagram Generation Prompt — Advanced POS System (PFE Report)

> Copy everything below this line and paste it into claude.ai.

---

I need you to generate PlantUML source code for three UML diagrams (Use Case, Class, and Sequence) for my PFE (thesis) project: a multi-tenant Point-of-Sale web application. I will describe the full system below. Please produce one PlantUML block per diagram.

---

## 1. System Overview

**Name:** Advanced POS System  
**Stack:** Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL, NextAuth v4 (JWT), Tailwind CSS, Metabase (self-hosted BI)  
**Deployment model:** Single server, multi-tenant by store — each ADMIN owns exactly one store; all data is scoped to `storeId`.

---

## 2. Actors / Roles

### SUPER_ADMIN
- Created directly in the database (no self-registration)
- Manages all stores and all admin accounts across the platform
- Can activate/deactivate admin accounts (`isActive` flag)
- Can create new stores and assign them to admins
- Has a dedicated login page: `/super-admin/login`
- Lands on `/super-admin/dashboard` after login

### ADMIN
- Registers at `/register` (email + password + store name)
- Has exactly one store (created automatically on registration)
- Manages their store's inventory (products + categories)
- Manages cashier accounts for their store
- Views orders placed by their cashiers
- Views analytics via embedded Metabase dashboard
- Has a dedicated login page: `/login`
- Lands on `/dashboard` after login

### CASHIER
- Account created by ADMIN (not self-service)
- Belongs to exactly one store
- Operates the POS terminal at `/pos`
- Processes sales: selects products, sets quantities, picks payment method, submits order
- Views their own order history
- Has a dedicated login page: `/cashier/login`
- Lands on `/pos` after login

---

## 3. Data Models (Prisma Schema)

### User
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| email | String | unique |
| password | String | bcrypt hashed |
| role | Enum | SUPER_ADMIN, ADMIN, CASHIER |
| isActive | Boolean | default true; SUPER_ADMIN can set false |
| storeId | String? | FK → Store (null for ADMIN and SUPER_ADMIN) |
| createdAt | DateTime | |

### Store
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| adminId | String | FK → User (ADMIN who owns this store) |
| createdAt | DateTime | |

Relations: Store has many Products, Categories, Orders, and Cashiers (Users with storeId).

### Product
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| description | String? | |
| buyPrice | Decimal | cost price |
| sellPrice | Decimal | selling price |
| stock | Int | current stock level |
| imageUrl | String? | |
| storeId | String | FK → Store |
| categoryId | String? | FK → Category |
| createdAt | DateTime | |

### Category
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| storeId | String | FK → Store |

### Order
| Field | Type | Notes |
|---|---|---|
| id | String | 7-digit custom ID (unique per store) |
| storeId | String | FK → Store |
| cashierId | String | FK → User (CASHIER) |
| customerName | String? | |
| paymentMethod | Enum | CASH, CARD, NFC |
| status | Enum | COMPLETED (only status currently used) |
| total | Decimal | sum of unitPrice × quantity |
| createdAt | DateTime | |

### OrderItem
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| orderId | String | FK → Order |
| productId | String | FK → Product |
| quantity | Int | |
| unitPrice | Decimal | snapshot of sellPrice at time of sale |
| unitCost | Decimal | snapshot of buyPrice at time of sale |

> **Important:** `unitPrice` and `unitCost` are locked at the time of the transaction and never change even if the product price is later updated.

---

## 4. API Routes

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /api/auth/[...nextauth] | Public | NextAuth login/session |
| POST | /api/register | Public | Admin self-registration + store creation |
| GET | /api/products | ADMIN, CASHIER | List products for the store |
| POST | /api/products | ADMIN | Create product |
| PUT | /api/products/[id] | ADMIN | Update product |
| DELETE | /api/products/[id] | ADMIN | Delete product |
| GET | /api/categories | ADMIN, CASHIER | List categories for the store |
| POST | /api/categories | ADMIN | Create category |
| PUT | /api/categories/[id] | ADMIN | Update category |
| DELETE | /api/categories/[id] | ADMIN | Delete category |
| GET | /api/orders | ADMIN, CASHIER | List orders (ADMIN: all store orders; CASHIER: own orders only) |
| POST | /api/orders | CASHIER | Create order, decrement stock |
| GET | /api/users | ADMIN | List cashiers in the store |
| POST | /api/users | ADMIN | Create cashier account |
| PUT | /api/users/[id] | ADMIN | Update cashier |
| DELETE | /api/users/[id] | ADMIN | Delete cashier |
| GET | /api/super-admin/stores | SUPER_ADMIN | List all stores |
| GET | /api/super-admin/admins | SUPER_ADMIN | List all admins |
| PATCH | /api/super-admin/admins/[id] | SUPER_ADMIN | Toggle admin isActive |
| POST | /api/super-admin/stores | SUPER_ADMIN | Create store + admin account |

---

## 5. Page / Navigation Structure

```
/ (home)                     — public landing page
├── /login                   — ADMIN login
├── /register                — ADMIN self-registration
├── /cashier/login           — CASHIER login
├── /super-admin/login       — SUPER_ADMIN login
│
├── /dashboard               — ADMIN: KPI cards + embedded Metabase analytics
├── /inventory               — ADMIN: product & category management
├── /orders                  — ADMIN: order history with filters
├── /users                   — ADMIN: cashier management
├── /stores                  — ADMIN: store info / settings
├── /settings                — ADMIN: account settings
│
├── /pos                     — CASHIER: POS terminal (product grid + cart)
├── /pos/orders              — CASHIER: own order history
│
├── /super-admin/dashboard   — SUPER_ADMIN: overview of all stores
├── /super-admin/stores      — SUPER_ADMIN: store list + create store
└── /super-admin/admins      — SUPER_ADMIN: admin list + activate/deactivate
```

---

## 6. Middleware / Security Rules

- All `/dashboard/**`, `/inventory/**`, `/orders/**`, `/users/**`, `/stores/**`, `/settings/**` routes require role = ADMIN and `isActive = true`. Unauthenticated or wrong-role requests are redirected to `/login?callbackUrl=<original-path>`.
- All `/pos/**` routes require role = CASHIER and `isActive = true`. Redirects to `/cashier/login?callbackUrl=<original-path>`.
- All `/super-admin/**` routes require role = SUPER_ADMIN. Redirects to `/super-admin/login`.
- After login, each role is redirected to its own home (SUPER_ADMIN → `/super-admin/dashboard`, CASHIER → `/pos`, ADMIN → `callbackUrl` or `/dashboard`).
- The Metabase embed URL is generated **server-side only** using a signed HS256 JWT. The `store_id` parameter is locked in the JWT payload so the embedded iframe can never show another tenant's data.

---

## 7. Key Business Logic

- **Stock decrement:** When a CASHIER submits an order, stock for each product is decremented inside a Prisma transaction. If any product has insufficient stock, the entire order is rejected.
- **Revenue:** `Σ (unitPrice × quantity)` for COMPLETED orders.
- **Gross Profit:** `Σ ((unitPrice − unitCost) × quantity)` for COMPLETED orders.
- **Low stock alert:** Products with `0 < stock < 10` trigger a warning on the admin dashboard.
- **Tenant isolation:** Every query in the ADMIN role starts with `store.findFirst({ where: { adminId: session.user.id } })` and all subsequent queries use the resulting `storeId`. No cross-tenant data access is possible.

---

## 8. What I Need From You

Please generate **three separate PlantUML diagrams**:

### Diagram 1 — Use Case Diagram
Include all three actors (SUPER_ADMIN, ADMIN, CASHIER) and all their use cases derived from the API routes and page structure above. Group use cases by actor. Show any `<<include>>` or `<<extend>>` relationships that apply (e.g., "Process Sale" includes "Decrement Stock"; "View Analytics" includes "Generate Signed Embed URL").

### Diagram 2 — Class Diagram
Include all 6 entities (User, Store, Product, Category, Order, OrderItem) with:
- All attributes and their types
- Visibility markers (all fields are `+`)
- Multiplicity on all associations (e.g., Store `1` — `*` Product)
- The `role` and `paymentMethod` enums shown as separate `<<enumeration>>` blocks

### Diagram 3 — Sequence Diagrams (produce one per flow)

**Flow A — Admin Login with callbackUrl**  
Actors/participants: Browser, Next.js Middleware, `/login` Page, NextAuth, PostgreSQL  
Steps: Browser hits `/dashboard` → middleware checks session → redirects to `/login?callbackUrl=/dashboard` → admin submits credentials → NextAuth queries DB, verifies password, creates JWT → redirect to `callbackUrl` (`/dashboard`) → page renders with session.

**Flow B — Cashier Processes a Sale**  
Actors/participants: Cashier (Browser), `/pos` Page, `POST /api/orders`, Prisma, PostgreSQL  
Steps: Cashier adds products to cart → submits order with paymentMethod → API validates session + role → fetches products from DB, checks stock → runs Prisma transaction (decrement stock for each item, create Order + OrderItems) → returns 201 with order details → UI shows receipt.

**Flow C — SuperAdmin Deactivates an Admin**  
Actors/participants: SuperAdmin (Browser), `/super-admin/admins` Page, `PATCH /api/super-admin/admins/[id]`, Prisma, PostgreSQL  
Steps: SuperAdmin views admin list → clicks "Deactivate" → PATCH request → API checks session role = SUPER_ADMIN → updates `user.isActive = false` → next time deactivated admin tries to access `/dashboard`, middleware's `isActive` check fails → redirect to `/login`.

**Flow D — Admin Views Embedded Metabase Dashboard**  
Actors/participants: Browser, `/dashboard` Server Component, `metabaseEmbedUrl()`, Metabase Server  
Steps: Page renders server-side → calls `metabaseEmbedUrl(store.id)` → function reads env vars, builds JWT payload with `{ store_id: store.id, exp: now+3600 }`, signs with HMAC-SHA256 → returns full iframe URL → HTML sent to browser with `<iframe src="...">` → browser loads Metabase embed → Metabase verifies JWT signature and reads locked `store_id` → executes all 4 SQL queries filtered by `storeId` → renders charts inside iframe.

---

Please output each diagram as a fenced PlantUML code block (` ```plantuml `). After each block, add 2–3 sentences explaining any non-obvious design decisions you made.
