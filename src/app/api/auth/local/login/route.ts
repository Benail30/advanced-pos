import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // IMPORTANT: Only allow cashiers to login locally
    // Admins must use Auth0
    if (user.role === 'admin' || user.role === 'manager') {
      return NextResponse.json(
        { success: false, error: 'Admin users must login through Auth0' },
        { status: 403 }
      );
    }

    // Only allow cashiers
    if (user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only cashiers can login here.' },
        { status: 403 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      console.error('User has no password set:', user.email);
      return NextResponse.json(
        { success: false, error: 'Account not properly configured. Contact administrator.' },
        { status: 500 }
      );
    }

    // Check password with better error handling
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return NextResponse.json(
        { success: false, error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || user.email.split('@')[0], // Use email prefix as name if name is null
        email: user.email,
        role: user.role
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 