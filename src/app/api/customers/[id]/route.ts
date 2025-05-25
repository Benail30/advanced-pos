import { NextResponse } from 'next/server';
import { Customer } from '@/types';
import { Pool } from 'pg';

// Sample customer data - would come from a database in a real implementation
const customers: Customer[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    loyalty_points: 100,
    date_of_birth: '1985-06-15',
    notes: 'Frequent customer',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-09-10T11:45:00Z',
    total_transactions: 12,
    total_spent: 782.45,
    last_purchase_date: '2023-09-10T11:45:00Z',
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Somewhere, USA',
    loyalty_points: 75,
    date_of_birth: '1990-03-22',
    notes: '',
    created_at: '2023-02-10T14:15:00Z',
    updated_at: '2023-09-05T09:15:00Z',
    total_transactions: 5,
    total_spent: 320.18,
    last_purchase_date: '2023-09-05T09:15:00Z',
  },
  {
    id: '3',
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'mbrown@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Elsewhere, USA',
    loyalty_points: 50,
    date_of_birth: '1988-11-08',
    notes: 'Prefers evening deliveries',
    created_at: '2023-03-05T09:45:00Z',
    updated_at: '2023-09-08T16:20:00Z',
    total_transactions: 8,
    total_spent: 455.90,
    last_purchase_date: '2023-09-08T16:20:00Z',
  },
  {
    id: '4',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 456-7890',
    address: '',
    loyalty_points: 25,
    date_of_birth: '1992-07-30',
    notes: 'New customer',
    created_at: '2023-08-01T11:20:00Z',
    updated_at: '2023-08-28T14:10:00Z',
    total_transactions: 3,
    total_spent: 142.75,
    last_purchase_date: '2023-08-28T14:10:00Z',
  },
  {
    id: '5',
    first_name: 'Robert',
    last_name: 'Wilson',
    email: 'rwilson@example.com',
    phone: '(555) 567-8901',
    address: '321 Cedar Rd, Nowhere, USA',
    loyalty_points: 150,
    date_of_birth: '1975-04-18',
    notes: 'VIP customer',
    created_at: '2023-01-05T08:30:00Z',
    updated_at: '2023-09-12T14:30:00Z',
    total_transactions: 15,
    total_spent: 1250.32,
    last_purchase_date: '2023-09-12T14:30:00Z',
  },
];

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db'
});

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

// DELETE handler to delete a customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if the customer has any transactions
    const transactionsCheck = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE customer_id = $1',
      [params.id]
    );

    if (parseInt(transactionsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing transactions' },
        { status: 400 }
      );
    }

    // If no transactions exist, delete the customer
    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 