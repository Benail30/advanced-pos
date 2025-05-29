import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = cookies().get('cashier_token');
    
    if (!token?.value) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    
    if (typeof decoded === 'object' && decoded.userId) {
      return NextResponse.json({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
    }

    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
} 