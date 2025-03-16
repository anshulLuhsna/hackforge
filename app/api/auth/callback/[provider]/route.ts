import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Secret key for signing CLI JWT tokens
// In production, use a proper environment variable
const CLI_TOKEN_SECRET = process.env.CLI_TOKEN_SECRET || 'hackforge-cli-secret-key';

/**
 * This is our custom handler that intercepts OAuth callbacks
 * We redirect to a different NextAuth endpoint to handle the actual login
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Check if this is a redirect from our special handler to prevent infinite loops
    if (searchParams.get('from_special') === 'true') {
      // This is a redirect from our special handler, don't intercept
      // Let Next.js proceed to the real NextAuth handler
      return;
    }
    
    // Get the base URL from the request
    const baseUrl = request.nextUrl.origin;

    // Create a new URL for our special NextAuth handler
    const specialNextAuthUrl = new URL(
      `/api/auth/__special/nextauth/callback/${params.provider}`,
      baseUrl
    );
    
    // Copy all query parameters from the original request
    for (const [key, value] of Array.from(searchParams.entries())) {
      specialNextAuthUrl.searchParams.set(key, value);
    }
    
    // Add a flag for CLI requests if the error_uri indicates it's from our CLI
    if (searchParams.has('error_uri') && searchParams.get('error_uri')?.includes('cli')) {
      specialNextAuthUrl.searchParams.set('from_cli', 'true');
    }
    
    // Redirect to our special NextAuth handler
    return NextResponse.redirect(specialNextAuthUrl);
  } catch (error) {
    console.error('Error in OAuth callback handler:', error);
    return NextResponse.redirect(
      new URL(`/?error=callback_error`, request.nextUrl.origin)
    );
  }
}

/**
 * Exchange OAuth code for token (for CLI flow)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const data = await request.json();
    const { code } = data;
    
    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }
    
    // Here you would exchange the code for a token using the OAuth provider's API
    // This is a placeholder for the actual implementation
    
    return NextResponse.json({ token: 'placeholder_token' });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
  }
} 