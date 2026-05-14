# 📁 Project Structure Guide

This document explains how the Advanced POS System is organized, like a map of where everything is located.

## 🏠 Main Folders

### `src/` - The Heart of the App
This is where all the important code lives. Think of it as the main building of your POS system.

#### `src/app/` - The Pages
Each folder here becomes a page on your website:

- **`page.tsx`** - The home page (what people see first)
- **`layout.tsx`** - The wrapper that goes around every page
- **`admin/`** - Pages only admins can see
- **`pos/`** - The cashier checkout system
- **`api/`** - The "behind the scenes" code that handles data
- **`inventory/`** - Product management pages
- **`customers/`** - Customer management pages
- **`reports/`** - Sales reports and analytics
- **`settings/`** - System configuration pages

#### `src/components/` - Reusable Pieces
These are like LEGO blocks - pieces you can use over and over:

- **`ui/`** - Basic building blocks (buttons, forms, etc.)
- **`pos/`** - Special pieces just for the cashier system
- **`admin/`** - Special pieces just for admin pages

#### `src/lib/` - Helper Tools
These are like a toolbox with useful functions:

- **`utils.ts`** - Common helper functions
- **`db.ts`** - Database connection
- **`auth/`** - Login and security helpers

### `public/` - Static Files
Images, icons, and other files that don't change.

## 🔄 How Data Flows

```
1. User visits a page (like /inventory)
2. Page loads from src/app/inventory/
3. Page uses components from src/components/
4. Components use helpers from src/lib/
5. If data is needed, API routes in src/app/api/ are called
6. API routes connect to the database
7. Data flows back to display on the page
```

## 🎯 Key Files Explained

### `src/app/page.tsx` - The Front Door
- This is what people see when they visit your website
- Shows different things based on who's logged in
- Admins see a dashboard, visitors see a welcome page

### `src/app/layout.tsx` - The Frame
- Wraps around every page like a picture frame
- Includes the navigation bar and user authentication
- Makes sure every page has the same basic structure

### `src/components/navbar.tsx` - The Menu
- The navigation bar at the top of admin pages
- Links to inventory, customers, reports, and settings
- Highlights the current page you're on

### `src/app/globals.css` - The Style Guide
- All the colors, fonts, and visual styling
- Makes everything look consistent and professional
- Includes animations and special effects

### `package.json` - The Recipe Book
- Lists all the tools and libraries the app needs
- Contains commands you can run (like `npm run dev`)
- Think of it as the ingredients list for your app

## 🗂️ File Naming Patterns

- **`page.tsx`** - Main page files (what users see)
- **`layout.tsx`** - Wrapper files (frames around pages)
- **`route.ts`** - API endpoints (backend functionality)
- **`loading.tsx`** - Loading screens
- **`error.tsx`** - Error pages
- **`not-found.tsx`** - 404 pages

## 🔍 Finding Things

### Looking for a specific page?
Check `src/app/[page-name]/page.tsx`

### Looking for a reusable component?
Check `src/components/[component-name].tsx`

### Looking for styling?
Check `src/app/globals.css`

### Looking for API functionality?
Check `src/app/api/[endpoint]/route.ts`

### Looking for helper functions?
Check `src/lib/utils.ts`

## 🚀 Adding New Features

### To add a new page:
1. Create a new folder in `src/app/`
2. Add a `page.tsx` file inside it
3. The folder name becomes the URL

### To add a new component:
1. Create a new file in `src/components/`
2. Export your component
3. Import it where you want to use it

### To add new styling:
1. Add CSS classes to `src/app/globals.css`
2. Use Tailwind classes in your components
3. Follow the existing patterns

## 🎨 Styling System

The app uses **Tailwind CSS** for styling:
- `bg-blue-500` = blue background
- `text-white` = white text
- `p-4` = padding
- `m-2` = margin
- `rounded` = rounded corners

## 🔐 Security Structure

- **Public pages**: Anyone can see (landing page)
- **Admin pages**: Only admins can access (dashboard, settings)
- **Cashier pages**: Only cashiers can access (POS system)
- **API routes**: Protected with authentication

## 📱 Responsive Design

The app works on all devices:
- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Simplified layout optimized for touch

---

**Remember**: This structure is designed to be logical and easy to navigate. Each folder has a specific purpose, and files are named consistently to make finding things simple! 