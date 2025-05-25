import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' }, 
        { status: 400 }
      );
    }

    // Simple validation
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' }, 
        { status: 400 }
      );
    }

    // Create user data - in a real app, this would be stored in a database
    const userData = {
      id: 'user_' + Date.now(),
      name,
      email,
      isLoggedIn: true
    };

    // Return success with user data
    return NextResponse.json({ 
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' }, 
      { status: 500 }
    );
  }
} 