import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/client'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const settings = await req.json()

    // Here you would typically save the settings to your database
    // For now, we'll just return a success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 