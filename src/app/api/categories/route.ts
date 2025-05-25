import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 
import { queries } from '@/lib/db/queries';

export async function GET() {
  try {
    // Fetch all categories
    const allCategories = await queries.categories.findAll();

    // Return the categories data
    return NextResponse.json(allCategories);
  } catch (error) {
    // Log the error
    console.error('Error fetching categories:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 