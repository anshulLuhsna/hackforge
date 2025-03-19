import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Secret key for signing CLI JWT tokens
// In production, use a proper environment variable
const CLI_TOKEN_SECRET = process.env.CLI_TOKEN_SECRET || 'hackforge-cli-secret-key';

/**
 * Generates a CLI token for authenticated users
 * Returns a JSON response with the token
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // For development purposes, allow a bypass parameter to generate a token without authentication
    // REMOVE THIS IN PRODUCTION!
    const bypassAuth = request.nextUrl.searchParams.get('bypass') === 'dev-only-do-not-use-in-production';
    
    // If no session, user is not authenticated
    if (!session?.user && !bypassAuth) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      );
    }
    
    // Use demo user info if bypass is enabled, otherwise use the session
    const userInfo = session?.user || {
      email: 'dev@example.com',
      name: 'Development User'
    };
    
    // Generate a CLI token for the authenticated user
    const token = jwt.sign(
      {
        userId: userInfo.email || 'unknown',
        name: userInfo.name || 'User',
        provider: bypassAuth ? 'dev-bypass' : 'session',
      },
      CLI_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return the token as JSON
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating CLI token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to generate CLI tokens for authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Generate a JWT token
    const token = jwt.sign(
      {
        email: session.user.email,
        name: session.user.name,
        isCLIToken: true  // Mark as a CLI token
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }  // 30 day expiration
    );
    
    // Return the token
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating CLI token:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 