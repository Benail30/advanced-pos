# Advanced Cash Register System with Power BI Integration

## Project Overview
**Student:** Ghassen Ben Ali  
**Academic Year:** 2024/2025

## Summary
This project aims to develop an advanced Point of Sale (POS) system that incorporates a web application for sales management and integrates with Power BI to provide analytical dashboards.

## Project Objectives
- Develop a sales management web application with an intuitive interface
- Integrate a stock and transaction management system
- Implement user roles with different access levels (cashier, manager, administrator)
- Design interactive dashboards via Power BI for sales and performance analysis
- Ensure data security and system scalability

## Technical Specifications

### Web Application POS Features
#### User Management
- Secure login with authentication (JWT, OAuth)
- Role-based access control

#### Product Management
- Add, modify, delete, and categorize products
- Product image management
- Price and inventory tracking

#### Stock Management
- Real-time stock updates
- Low stock alerts
- Inventory tracking

#### Cash Register System
- Multi-mode transaction support
  - Cash
  - Credit card
  - E-wallet
- Digital invoice generation with QR Code

### Power BI Integration
#### Sales Analytics
- Revenue tracking and analysis
- Sales evolution monitoring
- Product and store performance metrics

#### Customer Insights
- Average basket value analysis
- Customer loyalty metrics
- Purchase pattern analysis

#### Inventory Analytics
- Stock level monitoring
- Restocking trend analysis
- Out-of-stock alerts

#### Employee Performance
- Cashier performance metrics
- Transaction error tracking
- Discount application analysis

#### Predictive Analytics
- Sales forecasting
- Trend prediction
- Seasonal analysis

## Technical Architecture

### System Architecture
The system follows a modern web architecture with:
- Web application frontend
- Relational database backend
- Power BI integration for data visualization

### Technology Stack
#### Frontend
- Next.js (React + TypeScript)
- Modern UI components
- Responsive design
- ShadCN UI, Tailwind CSS

#### Backend
- Node.js (Express/NestJS)
- RESTful API architecture
- Microservices support

#### Database
- PostgreSQL (Primary database)
- Drizzle ORM

#### Authentication & Security
- Auth0 

#### Storage
- UploadThing for product image management
- Cloud storage integration

#### Business Intelligence
- Power BI Embedded
- Interactive dashboards
- Real-time data visualization

## Expected Deliverables
1. Functional web-based POS system
2. Integrated Power BI dashboards
3. Scalable and secure platform
4. Comprehensive technical documentation
   - Architecture decisions
   - Technology choices
   - Implementation details
   - User guides
   - API documentation

## Complete Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
    store_id UUID REFERENCES stores(id),
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    category_id UUID REFERENCES categories(id),
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 5,
    image_url VARCHAR(255),
    weight DECIMAL(10,3),
    dimensions VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Product_Store_Inventory Table
```sql
CREATE TABLE product_store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    store_id UUID REFERENCES stores(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, store_id)
);
```

### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    date_of_birth DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    store_id UUID REFERENCES stores(id),
    user_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'e_wallet', 'bank_transfer')),
    payment_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'refunded', 'voided')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Transaction_Items Table
```sql
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stock_History Table
```sql
CREATE TABLE stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    product_id UUID REFERENCES products(id),
    quantity_change INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer')),
    reference_id UUID,
    notes TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stock_Transfers Table
```sql
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    source_store_id UUID REFERENCES stores(id),
    destination_store_id UUID REFERENCES stores(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'pending', 'completed', 'canceled')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stock_Transfer_Items Table
```sql
CREATE TABLE stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL
);
```

### Discounts Table
```sql
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    applies_to VARCHAR(50) CHECK (applies_to IN ('all', 'category', 'product')),
    target_id UUID,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Suppliers Table
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Purchase_Orders Table
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    store_id UUID REFERENCES stores(id),
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'pending', 'received', 'canceled')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    expected_delivery_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Purchase_Order_Items Table
```sql
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL
);
```

### Audit_Log Table
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, key)
);
```

## Optimized Project Structure

```
advanced-pos/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml              # Continuous Integration workflow
│       └── deploy.yml          # Deployment workflow
│
├── src/                        # Next.js application
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Register page
│   │   │   └── layout.tsx      # Auth layout
│   │   │
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── products/       # Products management
│   │   │   ├── inventory/      # Inventory management
│   │   │   ├── customers/      # Customer management
│   │   │   ├── sales/          # Sales reports
│   │   │   ├── settings/       # System settings
│   │   │   └── layout.tsx      # Dashboard layout
│   │   │
│   │   ├── (pos)/              # POS system routes
│   │   │   ├── page.tsx        # POS home/register
│   │   │   ├── transactions/   # Transaction history
│   │   │   ├── reports/        # POS reports
│   │   │   └── layout.tsx      # POS layout
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Auth API endpoints
│   │   │   ├── products/       # Products API
│   │   │   ├── transactions/   # Transactions API
│   │   │   ├── customers/      # Customers API
│   │   │   ├── inventory/      # Inventory API
│   │   │   └── reporting/      # Reporting API
│   │   │
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components (ShadCN)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── forms/              # Form components
│   │   │   ├── product-form.tsx
│   │   │   ├── customer-form.tsx
│   │   │   ├── transaction-form.tsx
│   │   │   └── ...
│   │   │
│   │   ├── pos/                # POS specific components
│   │   │   ├── cart.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── checkout.tsx
│   │   │   ├── payment-methods.tsx
│   │   │   └── receipt.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   ├── recent-sales.tsx
│   │   │   ├── inventory-alerts.tsx
│   │   │   └── sales-chart.tsx
│   │   │
│   │   └── layouts/            # Layout components
│   │       ├── dashboard-layout.tsx
│   │       ├── pos-layout.tsx
│   │       ├── sidebar.tsx
│   │       └── header.tsx
│   │
│   ├── lib/                    # Utility functions and shared logic
│   │   ├── auth/               # Authentication utils
│   │   │   ├── auth.ts
│   │   │   └── session.ts
│   │   │
│   │   ├── db/                 # Database utilities
│   │   │   ├── schema/         # Drizzle schema
│   │   │   │   ├── products.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── transactions.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── seed/           # Seed data
│   │   │   └── index.ts        # DB client
│   │   │
│   │   ├── api/                # API utilities
│   │   │   ├── client.ts       # API client
│   │   │   └── endpoints.ts    # API endpoints
│   │   │
│   │   ├── powerbi/            # Power BI integration
│   │   │   ├── client.ts
│   │   │   └── embed.ts
│   │   │
│   │   └── utils/              # General utilities
│   │       ├── formatting.ts   # Date/number formatting
│   │       ├── validation.ts   # Validation helpers
│   │       └── calculations.ts # Business calculations
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-cart.ts         # Shopping cart hook
│   │   ├── use-auth.ts         # Authentication hook
│   │   ├── use-products.ts     # Products data hook
│   │   └── use-transactions.ts # Transactions hook
│   │
│   └── types/                  # TypeScript type definitions
│       ├── product.ts
│       ├── user.ts
│       ├── transaction.ts
│       ├── customer.ts
│       └── api.ts
│
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── scripts/                    # Build and deployment scripts
│   ├── seed-db.ts              # Database seeding
│   ├── generate-types.ts       # Type generation
│   └── deploy.sh               # Deployment script
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture diagrams
│   └── guides/                 # User guides
│
├── .env.example                # Environment variables template
├── .env.local                  # Local environment variables
├── .eslintrc.js                # ESLint configuration
├── .gitignore                  # Git ignore file
├── docker-compose.yml          # Docker compose configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Entity Relationship Diagram (ERD)

```
Users 1 --- * Transactions
Stores 1 --- * Users
Stores 1 --- * Transactions
Customers 0..1 --- * Transactions
Products 1 --- * Transaction_Items
Transactions 1 --- * Transaction_Items
Products 1 --- * Stock_History
Categories 1 --- * Products
Categories 0..1 --- * Categories (self-reference for hierarchical categories)
Stores 1 --- * Product_Store_Inventory
Products 1 --- * Product_Store_Inventory
Suppliers 1 --- * Purchase_Orders
Purchase_Orders 1 --- * Purchase_Order_Items
Products 1 --- * Purchase_Order_Items
Users 1 --- * Purchase_Orders (created_by)
Users 1 --- * Stock_History
Stores 1 --- * Stock_History
Stores 1 --- * Stock_Transfers (source)
Stores 1 --- * Stock_Transfers (destination)
Stock_Transfers 1 --- * Stock_Transfer_Items
Products 1 --- * Stock_Transfer_Items
Users 1 --- * Stock_Transfers (created_by)
Stores 1 --- * Settings
```

## Implementation Strategy

1. **Phase 1: Setup and Authentication**
   - Project setup with Next.js, TypeScript, and Tailwind CSS
   - Auth0 integration for authentication
   - User management and permissions

2. **Phase 2: Core POS Features**
   - Product and category management
   - Basic inventory tracking
   - Shopping cart implementation
   - Transaction processing
   - Basic reporting

3. **Phase 3: Advanced Features**
   - Customer management
   - Discounts and promotions
   - Advanced inventory features
   - Multiple payment methods
   - Receipt generation

4. **Phase 4: Power BI Integration**
   - Data export and integration
   - Interactive dashboards
   - Custom reports
   - Real-time analytics

5. **Phase 5: Polish and Optimization**
   - UI/UX improvements
   - Performance optimization
   - Comprehensive testing
   - Documentation
