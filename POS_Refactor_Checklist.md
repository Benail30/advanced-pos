# ✅ POS System Refactor Checklist (2 Roles: Admin & Cashier)

## 1. Role Logic
- [ ] Remove all references to the old `manager` role (in UI, backend, and DB).
- [ ] Ensure only two roles are defined: `admin` and `cashier`.
- [ ] Centralize role constants/enums (e.g., `ROLES = { ADMIN, CASHIER }`).

## 2. Authentication & Authorization
- [ ] Ensure authentication uses Supabase Auth (or Auth0) properly.
- [ ] Add middleware or route guards for:
  - [ ] Admin-only routes (product/user management, dashboards).
  - [ ] Cashier-only views (POS screen, sales history).
- [ ] Prevent users from accessing components/pages outside their role.

## 3. Frontend UI (Next.js / React)
- [ ] Conditionally render components based on `user.role`.
```tsx
{user.role === 'admin' && <AdminDashboard />}
{user.role === 'cashier' && <CashierPOS />}
```
- [ ] Hide links or pages not accessible to a user’s role in navigation menus.
- [ ] Update protected routes in `/app/` or `/pages/` to check roles.

## 4. Pages & Routing
- [ ] Confirm only two main page flows:
  - `/pos` for cashiers
  - `/admin` or `/dashboard` for admins
- [ ] Refactor or delete any `manager`-specific pages/components
- [ ] Ensure dynamic routing (e.g., `/invoice/[id]`) respects role checks

## 5. API Endpoints (Backend)
- [ ] Add middleware or guards to protect backend endpoints based on role
  - `/api/products` – admin only
  - `/api/sales` – cashier can POST; admin can GET all
  - `/api/users` – admin only
- [ ] Clean up or rename endpoints that referenced managers

## 6. Database (PostgreSQL / Firebase)
- [ ] Confirm user roles are stored as `"admin"` or `"cashier"` in the users table.
- [ ] Ensure queries filter based on role when needed:
  - E.g., a cashier sees only their own transactions.
- [ ] Remove any outdated role values (like `"manager"`).

## 7. Power BI Integration
- [ ] Ensure Power BI dashboards are shown only to admins.
- [ ] Check that embedded dashboards are securely loaded based on role.

## 8. Invoice + Stock Update Logic
- [ ] Ensure that:
  - A new sale triggers a stock update for the involved products.
  - An invoice is generated with a QR code.
  - Cashier can view/download invoice after sale.
- [ ] No admin override of cashier invoice pages unless explicitly needed.

## 🧠 Optional Improvements
- [ ] Create a shared `useRole()` hook for role-based logic.
- [ ] Use layout guards (like `AdminLayout`, `CashierLayout`) to manage structure.
