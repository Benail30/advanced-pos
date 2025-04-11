// Product related types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  description?: string;
  barcode?: string;
  cost?: number;
}

// Cart related types
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
  paymentMethod: string;
  date: string;
  customerId?: string;
  status: 'completed' | 'refunded' | 'pending';
}

// Customer related types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
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