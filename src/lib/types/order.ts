import { PaymentMethod } from '@/lib/db/schema/payments';
import { OrderStatus } from '@/lib/db/schema/orders';
import { PaymentStatus } from '@/lib/db/schema/payments';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderItemSummary extends OrderItem {
  name: string;
  priceAtSale: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  customerId?: string;
}

export interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

export interface OrderSummary {
  id: string;
  items: OrderItemSummary[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface OrderResponse {
  success: boolean;
  data?: OrderSummary;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    orderId: string;
    paymentId: string;
    status: PaymentStatus;
    invoiceId?: string;
  };
  error?: string;
} 