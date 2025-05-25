import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Fetch the category by ID
    const category = await queries.categories.findById(id);
    
    // If the category doesn't exist, return 404
    if (!category || category.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Return the category data
    return NextResponse.json(category[0]);
  } catch (error) {
    // Log the error
    console.error(`Error fetching category ${params.id}:`, error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
} 