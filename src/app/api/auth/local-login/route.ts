import { NextRequest, NextResponse } from "next/server";
import * as crypto from 'crypto';
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Simple hash function matching the one in seed script
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // For development, hardcode the admin user validation
    if (email === 'admin@example.com' && password === 'admin123') {
      // Create response with success message
      const response = NextResponse.json({ success: true, message: "Login successful" });
      
      // Set cookie in the response
      response.cookies.set('local_auth', 'admin_logged_in', {
        // Cookie options
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    // If we wanted to validate against the database instead:
    // const passwordHash = hashPassword(password);
    // const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // if (user.length === 0 || user[0].passwordHash !== passwordHash) {
    //   return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    // }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
} 