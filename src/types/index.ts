// Shared types for the application

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  loyalty_points: number;
  date_of_birth: string;
  notes: string;
  created_at: string;
  updated_at: string;
  total_transactions: number;
  total_spent: number;
  last_purchase_date: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  location: string;
  lastUpdated: string;
  price?: number;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  reference?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
}

// Dashboard related types
export interface SalesData {
  date: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
} 