import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateInvoice } from '@/lib/services/invoice';
import { z } from 'zod';

// Validation schema for invoice generation
const generateInvoiceSchema = z.object({
  transactionId: z.string().uuid(),
});

// GET handler to retrieve invoices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const invoiceNumber = searchParams.get('invoiceNumber');

    if (!transactionId && !invoiceNumber) {
      return NextResponse.json(
        { error: 'Either transactionId or invoiceNumber is required' },
        { status: 400 }
      );
    }

    // Create an array to collect conditions
    const conditions = [];

    if (transactionId) {
      conditions.push(eq(invoices.transactionId, transactionId));
    }

    if (invoiceNumber) {
      conditions.push(eq(invoices.invoiceNumber, invoiceNumber));
    }

    // Use the proper query pattern with the conditions
    const result = await db.select().from(invoices)
      .where(conditions.length > 1 
        ? conditions.reduce((acc, condition) => condition && acc) 
        : conditions[0]);

    if (!result.length) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// POST handler to generate a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId } = generateInvoiceSchema.parse(body);

    // Check if invoice already exists for this transaction
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.transactionId, transactionId));

    if (existingInvoice.length > 0) {
      return NextResponse.json(
        { error: 'Invoice already exists for this transaction' },
        { status: 400 }
      );
    }

    // Generate invoice
    const invoice = await generateInvoice(transactionId);

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate invoice' },
      { status: 500 }
    );
  }
} 