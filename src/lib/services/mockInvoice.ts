import { v4 as uuidv4 } from 'uuid';

export interface InvoiceData {
  transaction: {
    id: string;
    transactionNumber: string;
    createdAt: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  }>;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  store: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  cashier: {
    name: string;
    email: string;
  };
  url: string;
}

export async function generateInvoice(transactionId: string): Promise<InvoiceData> {
  // Mock data for demonstration purposes
  const mockInvoiceData: InvoiceData = {
    transaction: {
      id: transactionId || uuidv4(),
      transactionNumber: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      subtotal: 150.00,
      taxAmount: 13.50,
      discountAmount: 5.00,
      totalAmount: 158.50,
      paymentMethod: 'credit_card',
      status: 'completed',
    },
    items: [
      {
        productName: 'Premium T-Shirt',
        quantity: 2,
        unitPrice: 25.00,
        subtotal: 50.00,
        taxAmount: 4.50,
        discountAmount: 0.00,
        total: 54.50,
      },
      {
        productName: 'Designer Jeans',
        quantity: 1,
        unitPrice: 75.00,
        subtotal: 75.00,
        taxAmount: 6.75,
        discountAmount: 5.00,
        total: 76.75,
      },
      {
        productName: 'Casual Socks',
        quantity: 3,
        unitPrice: 8.33,
        subtotal: 25.00,
        taxAmount: 2.25,
        discountAmount: 0.00,
        total: 27.25,
      },
    ],
    customer: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
    },
    store: {
      name: 'Fashion Outlet',
      address: '123 Main Street, Anytown, USA 12345',
      phone: '(555) 987-6543',
      email: 'info@fashionoutlet.com',
    },
    cashier: {
      name: 'Emma Wilson',
      email: 'emma.wilson@fashionoutlet.com',
    },
    url: `/api/invoices/${transactionId}/view`,
  };

  return mockInvoiceData;
} 