# 🏪 Advanced POS System

A modern, secure Point of Sale (POS) system built with Next.js, TypeScript, and PostgreSQL. This system is designed for businesses that need both admin management capabilities and streamlined cashier operations.

## 🎯 What This System Does

This POS system helps you run your business by providing:

- **👨‍💼 Admin Dashboard**: Full control over inventory, customers, reports, and settings
- **🛒 Cashier Interface**: Simple, fast checkout system for daily sales
- **📊 Real-time Analytics**: Track sales, inventory, and customer data
- **🔐 Secure Authentication**: Role-based access with Auth0 integration
- **📱 Modern UI**: Beautiful, responsive design that works on all devices

## 🏗️ How the Project is Organized

```
advanced-pos/
├── 📁 src/                          # Main source code
│   ├── 📁 app/                      # Next.js pages and routes
│   │   ├── 📄 page.tsx              # Home page (landing/admin dashboard)
│   │   ├── 📄 layout.tsx            # Main app wrapper
│   │   ├── 📁 admin/                # Admin-only pages
│   │   ├── 📁 pos/                  # Cashier POS interface
│   │   ├── 📁 api/                  # Backend API endpoints
│   │   ├── 📁 inventory/            # Product management
│   │   ├── 📁 customers/            # Customer management
│   │   ├── 📁 reports/              # Analytics and reports
│   │   └── 📁 settings/             # System settings
│   ├── 📁 components/               # Reusable UI components
│   │   ├── 📁 ui/                   # Basic UI elements (buttons, inputs, etc.)
│   │   ├── 📁 pos/                  # POS-specific components
│   │   └── 📁 admin/                # Admin-specific components
│   ├── 📁 lib/                      # Utility functions and helpers
│   │   ├── 📄 utils.ts              # Common helper functions
│   │   ├── 📄 db.ts                 # Database connection
│   │   └── 📁 auth/                 # Authentication helpers
│   └── 📁 types/                    # TypeScript type definitions
├── 📁 public/                       # Static files (images, icons, etc.)
├── 📄 package.json                  # Project dependencies and scripts
├── 📄 tailwind.config.ts            # Styling configuration
└── 📄 drizzle.config.ts             # Database configuration
```

## 🚀 Getting Started

### Prerequisites

Before you start, make sure you have:
- **Node.js** (version 18 or higher)
- **PostgreSQL** database
- **Auth0** account (for admin authentication)

### Installation

1. **Clone the project**
   ```bash
   git clone <your-repo-url>
   cd advanced-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Go to `http://localhost:3000`

## 👥 User Types and Access

### 🔐 Admin Users
- **How they log in**: Through Auth0 (Google, email, etc.)
- **What they can do**:
  - View admin dashboard with business analytics
  - Manage inventory (add/edit/delete products)
  - Manage customers and customer data
  - View detailed sales reports
  - Configure system settings
  - Create and manage cashier accounts

### 🛒 Cashier Users
- **How they log in**: Simple email/password login
- **What they can do**:
  - Access the POS system for making sales
  - Process customer transactions
  - Handle different payment methods
  - Print receipts
  - View basic transaction history

## 🧩 Key Components Explained

### 🏠 Home Page (`src/app/page.tsx`)
This is the first page people see. It's smart and shows different content based on who's visiting:
- **Visitors**: Welcome page with login options
- **Admins**: Full dashboard with business overview
- **Cashiers**: Automatically redirected to POS system

### 🧭 Navigation (`src/components/navbar.tsx`)
The navigation bar that appears on admin pages. It includes links to:
- Inventory management
- Customer management  
- Reports and analytics
- System settings

### 🛒 POS System (`src/app/pos/`)
The cashier interface for processing sales. Features:
- Product selection and cart management
- Customer lookup and selection
- Payment processing
- Receipt generation
- Transaction history

### 🎨 Styling (`src/app/globals.css`)
All the visual styling for the app, including:
- Color themes (light and dark mode support)
- Animations and transitions
- Reusable component styles
- Custom button and form styles

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open database viewer
npm run db:push      # Push schema changes

# Code Quality
npm run lint         # Check code for issues
```

## 🗄️ Database Structure

The system uses PostgreSQL with these main tables:

- **👥 users**: Cashier accounts and user information
- **🛍️ products**: Inventory items and pricing
- **👤 customers**: Customer information and contact details
- **📦 orders**: Sales transactions and order details
- **💰 payments**: Payment records and methods
- **📄 invoices**: Generated receipts and invoices

## 🔐 Security Features

- **Role-based access**: Admins and cashiers have different permissions
- **Secure authentication**: Auth0 integration for admin users
- **Password hashing**: All passwords are securely encrypted
- **API protection**: All endpoints are protected with proper authentication
- **Input validation**: All user inputs are validated and sanitized

## 🎨 Design Philosophy

This system is built with simplicity in mind:

- **Clean, modern interface**: Easy to use for both tech-savvy and non-technical users
- **Responsive design**: Works perfectly on desktop, tablet, and mobile
- **Consistent styling**: All components follow the same design patterns
- **Accessible**: Built with accessibility best practices
- **Fast performance**: Optimized for quick loading and smooth interactions

## 🚨 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check your `.env.local` file has correct database credentials
   - Make sure PostgreSQL is running
   - Run `npm run db:migrate` to set up tables

2. **Auth0 login not working**
   - Verify Auth0 configuration in `.env.local`
   - Check Auth0 dashboard settings
   - Ensure callback URLs are correctly configured

3. **Cashier login fails**
   - Make sure you've created cashier accounts in the admin panel
   - Check the users table in your database
   - Verify password is correct

## 📚 Learning Resources

If you're new to the technologies used in this project:

- **Next.js**: [Official Next.js Tutorial](https://nextjs.org/learn)
- **React**: [React Documentation](https://react.dev/learn)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **PostgreSQL**: [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

## 🤝 Getting Help

If you need help with this system:

1. Check this README first
2. Look at the code comments - they explain what each part does
3. Check the console for error messages
4. Review the database structure in the `drizzle/` folder

## 📝 Making Changes

When you want to modify the system:

1. **Always test changes locally first**
2. **Keep the existing functionality working**
3. **Add comments to explain new code**
4. **Update this README if you add new features**

---

**Built with ❤️ for modern businesses**

This POS system is designed to grow with your business. Whether you're a small shop or a growing enterprise, the system can handle your needs while remaining simple to use and maintain.
