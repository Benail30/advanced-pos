import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { invoices, transactions, transactionItems, products, customers, users, stores } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { format } from 'date-fns';

export interface InvoiceData {
  transaction: {
    id: string;
    transactionNumber: string;
    createdAt: string;
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
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
  // Fetch basic transaction details
  const transaction = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .then(res => res[0]);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Fetch transaction items with product details
  const items = await db
    .select({
      id: transactionItems.id,
      quantity: transactionItems.quantity,
      unit_price: transactionItems.unit_price,
      subtotal: transactionItems.subtotal,
      total: transactionItems.total,
      product_id: transactionItems.product_id
    })
    .from(transactionItems)
    .where(eq(transactionItems.transaction_id, transactionId));

  // Fetch product details for each item
  const productIds = items.map(item => item.product_id);
  const productsDetails = await db
    .select()
    .from(products)
    .where(
      productIds.length > 0 
        ? inArray(products.id, productIds) 
        : eq(products.id, '00000000-0000-0000-0000-000000000000') // Impossible condition if no products
    );

  // Map products to items
  const productsMap = productsDetails.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {} as Record<string, typeof productsDetails[number]>);

  // Get customer details if available
  let customerData = undefined;
  if (transaction.customer_id) {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, transaction.customer_id))
      .then(res => res[0]);
    
    if (customer) {
      customerData = {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email || '',
        phone: customer.phone || ''
      };
    }
  }

  // Get store details
  let storeData = {
    name: 'Store',
    address: '',
    phone: '',
    email: ''
  };
  
  if (transaction.store_id) {
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.id, transaction.store_id))
      .then(res => res[0]);
    
    if (store) {
      storeData = {
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        email: store.email || ''
      };
    }
  }

  // Get cashier details
  let cashierData = {
    name: 'Cashier',
    email: ''
  };
  
  if (transaction.user_id) {
    const cashier = await db
      .select()
      .from(users)
      .where(eq(users.id, transaction.user_id))
      .then(res => res[0]);
    
    if (cashier) {
      cashierData = {
        name: `${cashier.firstName} ${cashier.lastName}`,
        email: cashier.email
      };
    }
  }

  // Generate invoice data
  const invoiceData: InvoiceData = {
    transaction: {
      id: transaction.id,
      transactionNumber: transaction.transaction_number,
      createdAt: transaction.created_at?.toISOString() || new Date().toISOString(),
      subtotal: Number(transaction.subtotal),
      tax: 0, // Set a default value for tax
      discount: 0, // Set a default value for discount
      totalAmount: Number(transaction.total_amount),
      paymentMethod: transaction.payment_method,
      status: transaction.status,
    },
    items: items.map(item => ({
      productName: productsMap[item.product_id]?.name || 'Unknown Product',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      total: Number(item.total),
    })),
    customer: customerData,
    store: storeData,
    cashier: cashierData,
    url: `/api/invoices/${transactionId}/view`,
  };

  return invoiceData;
} 