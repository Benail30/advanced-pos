import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Create response with success message
    const response = NextResponse.json({ success: true, message: "Logout successful" });
    
    // Remove the auth cookie
    response.cookies.delete('local_auth');

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
} 