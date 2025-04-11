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

// GET handler to retrieve a single customer by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const customer = customers.find(customer => customer.id === id);
  
  if (!customer) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(customer);
}

// PATCH handler to update a customer
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const customerIndex = customers.findIndex(customer => customer.id === id);
    
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const updatedCustomer = {
      ...customers[customerIndex],
      ...body,
    };
    
    // In a real app, this would update a database record
    customers[customerIndex] = updatedCustomer;
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const customerIndex = customers.findIndex(customer => customer.id === id);
  
  if (customerIndex === -1) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }
  
  // In a real app, this would delete from a database
  const deletedCustomer = customers.splice(customerIndex, 1)[0];
  
  return NextResponse.json(deletedCustomer);
} 