import { NextResponse } from 'next/server';
import { db, executeQuery, isUniqueConstraintError } from '@/lib/db';
import { customers, transactions } from '@/lib/db/schema';
import { eq, desc, asc, sql, count, sum, max, ilike, and, or } from 'drizzle-orm';
import { z } from 'zod';
import { getTableColumns } from 'drizzle-orm';
import { getServerSession } from 'next-auth';

// Customer validation schema
const customerSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  notes: z.string().optional().nullable(),
  loyalty_points: z.number().int().default(0),
  store_id: z.string().uuid().optional()
});

// GET handler to fetch all customers
export async function GET(request: Request) {
  try {
    // Get session for store_id
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortField = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';
    
    // Execute query using raw SQL for complex aggregation
    const [result, error] = await executeQuery(async () => {
      // Build the SQL query directly using tagged templates
      const query = sql`
        SELECT 
          c.*,
          COUNT(t.id) AS total_transactions,
          COALESCE(SUM(t.total_amount), 0) AS total_spent,
          MAX(t.created_at) AS last_purchase_date
        FROM customers c
        LEFT JOIN transactions t ON c.id = t.customer_id
        WHERE c.store_id = ${session.user.storeId}
        ${search ? sql`AND (c.first_name ILIKE ${`%${search}%`} 
          OR c.last_name ILIKE ${`%${search}%`} 
          OR c.email ILIKE ${`%${search}%`} 
          OR c.phone ILIKE ${`%${search}%`})` : sql``}
        GROUP BY c.id
        ${sortField === 'total_transactions' 
          ? sortOrder === 'desc' ? sql`ORDER BY total_transactions DESC` : sql`ORDER BY total_transactions ASC`
          : sortField === 'total_spent'
            ? sortOrder === 'desc' ? sql`ORDER BY total_spent DESC` : sql`ORDER BY total_spent ASC`
            : sortField === 'last_name'
              ? sortOrder === 'desc' ? sql`ORDER BY c.last_name DESC` : sql`ORDER BY c.last_name ASC`
              : sortOrder === 'desc' ? sql`ORDER BY c.created_at DESC` : sql`ORDER BY c.created_at ASC`}
      `;
      
      // Execute the raw SQL query
      const queryResult = await db.execute(query);
      return queryResult;
    });
    
    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }

    // Access the result correctly - cast to any because Drizzle types are challenging
    const customers = result ? (result as any) : [];
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST handler to create a new customer
export async function POST(request: Request) {
  try {
    // Get session for store_id
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = customerSchema.parse(body);
    
    // Check if email already exists for this store
    if (validatedData.email) {
      const existingCustomer = await db.query.customers.findFirst({
        where: and(
          eq(customers.email, validatedData.email),
          eq(customers.store_id, session.user.storeId)
        )
      });
      
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Insert the new customer
    const [newCustomer] = await db.insert(customers)
      .values({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        date_of_birth: validatedData.date_of_birth,
        notes: validatedData.notes,
        loyalty_points: validatedData.loyalty_points,
        store_id: session.user.storeId
      })
      .returning();
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// PUT handler to update a customer
export async function PUT(request: Request) {
  try {
    // Get session for store_id
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = customerSchema.parse(body);
    
    if (!validatedData.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    // Check if customer exists and belongs to the store
    const existingCustomer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, validatedData.id),
        eq(customers.store_id, session.user.storeId)
      )
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Check if email is unique if it changed
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const duplicateEmail = await db.query.customers.findFirst({
        where: and(
          eq(customers.email, validatedData.email),
          eq(customers.store_id, session.user.storeId)
        )
      });
      
      if (duplicateEmail && duplicateEmail.id !== validatedData.id) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the customer
    const [updatedCustomer] = await db.update(customers)
      .set({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        date_of_birth: validatedData.date_of_birth,
        notes: validatedData.notes,
        loyalty_points: validatedData.loyalty_points
      })
      .where(and(
        eq(customers.id, validatedData.id),
        eq(customers.store_id, session.user.storeId)
      ))
      .returning();
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a customer
export async function DELETE(request: Request) {
  try {
    // Get session for store_id
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if customer exists and belongs to the store
    const existingCustomer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, id),
        eq(customers.store_id, session.user.storeId)
      )
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if customer has transactions
    const hasTransactions = await db.query.transactions.findFirst({
      where: eq(transactions.customer_id, id)
    });

    if (hasTransactions) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with transaction history',
          suggestion: 'Consider marking the customer as inactive instead'
        },
        { status: 409 }
      );
    }

    // Delete the customer
    await db.delete(customers)
      .where(and(
        eq(customers.id, id),
        eq(customers.store_id, session.user.storeId)
      ));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 