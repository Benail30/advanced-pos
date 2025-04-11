import { NextResponse } from 'next/server';
import { Transaction } from '@/types';

// Example transactions data - in a real app would come from a database
const transactions: Transaction[] = [
  {
    id: '1',
    items: [
      { id: '1', name: 'T-Shirt', price: 19.99, quantity: 2, image: '/images/t-shirt.jpg' },
      { id: '5', name: 'Water Bottle', price: 12.99, quantity: 1, image: '/images/bottle.jpg' },
    ],
    total: 60.76,
    tax: 7.79,
    subtotal: 52.97,
    paymentMethod: 'credit_card',
    date: '2023-09-12T14:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    items: [
      { id: '3', name: 'Baseball Cap', price: 14.99, quantity: 1, image: '/images/cap.jpg' },
      { id: '4', name: 'Notebook', price: 4.99, quantity: 3, image: '/images/notebook.jpg' },
    ],
    total: 32.57,
    tax: 3.56,
    subtotal: 29.01,
    paymentMethod: 'cash',
    date: '2023-09-10T11:45:00Z',
    status: 'completed',
  },
  {
    id: '3',
    items: [
      { id: '6', name: 'Headphones', price: 89.99, quantity: 1, image: '/images/headphones.jpg' },
    ],
    total: 97.19,
    tax: 7.20,
    subtotal: 89.99,
    paymentMethod: 'credit_card',
    date: '2023-09-08T16:20:00Z',
    status: 'completed',
  },
  {
    id: '4',
    items: [
      { id: '2', name: 'Coffee Mug', price: 9.99, quantity: 2, image: '/images/mug.jpg' },
      { id: '10', name: 'Backpack', price: 39.99, quantity: 1, image: '/images/backpack.jpg' },
    ],
    total: 64.77,
    tax: 4.79,
    subtotal: 59.98,
    paymentMethod: 'credit_card',
    date: '2023-09-05T09:15:00Z',
    status: 'refunded',
  },
  {
    id: '5',
    items: [
      { id: '11', name: 'Pen', price: 1.99, quantity: 5, image: '/images/pen.jpg' },
      { id: '4', name: 'Notebook', price: 4.99, quantity: 2, image: '/images/notebook.jpg' },
    ],
    total: 22.49,
    tax: 2.57,
    subtotal: 19.92,
    paymentMethod: 'cash',
    date: '2023-09-02T13:40:00Z',
    status: 'completed',
  },
];

// GET handler to retrieve all transactions with optional filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  let filteredTransactions = [...transactions];
  
  // Filter by status if provided
  if (status) {
    filteredTransactions = filteredTransactions.filter(
      transaction => transaction.status === status
    );
  }
  
  // Filter by date range if provided
  if (startDate && endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    filteredTransactions = filteredTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date).getTime();
      return transactionDate >= start && transactionDate <= end;
    });
  }
  
  return NextResponse.json(filteredTransactions);
}

// POST handler to create a new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !body.total || !body.tax || !body.subtotal || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      items: body.items,
      total: body.total,
      tax: body.tax,
      subtotal: body.subtotal,
      paymentMethod: body.paymentMethod,
      date: new Date().toISOString(),
      customerId: body.customerId,
      status: 'completed',
    };
    
    // In a real app, this would save to a database
    transactions.push(newTransaction);
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 