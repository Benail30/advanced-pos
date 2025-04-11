import { NextResponse } from 'next/server';
import { Customer } from '@/types';

// Sample customer data - would come from a database in a real implementation
const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    totalOrders: 12,
    totalSpent: 782.45,
    lastOrder: '2023-09-10T11:45:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Somewhere, USA',
    totalOrders: 5,
    totalSpent: 320.18,
    lastOrder: '2023-09-05T09:15:00Z',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Elsewhere, USA',
    totalOrders: 8,
    totalSpent: 455.90,
    lastOrder: '2023-09-08T16:20:00Z',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 456-7890',
    totalOrders: 3,
    totalSpent: 142.75,
    lastOrder: '2023-08-28T14:10:00Z',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'rwilson@example.com',
    phone: '(555) 567-8901',
    address: '321 Cedar Rd, Nowhere, USA',
    totalOrders: 15,
    totalSpent: 1250.32,
    lastOrder: '2023-09-12T14:30:00Z',
  },
];

// GET handler to retrieve all customers or search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toLowerCase();
  
  if (!query) {
    return NextResponse.json(customers);
  }
  
  // Filter customers by search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(query) || 
    customer.email.toLowerCase().includes(query) || 
    customer.phone?.includes(query) || 
    customer.address?.toLowerCase().includes(query)
  );
  
  return NextResponse.json(filteredCustomers);
}

// POST handler to create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Create new customer with generated ID
    const newCustomer: Customer = {
      id: (customers.length + 1).toString(),
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      address: body.address || undefined,
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: undefined,
    };
    
    // In a real app, this would save to a database
    customers.push(newCustomer);
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 