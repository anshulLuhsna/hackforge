import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Secret key for signing CLI JWT tokens
// In production, use a proper environment variable
const CLI_TOKEN_SECRET = process.env.CLI_TOKEN_SECRET || 'hackforge-cli-secret-key';

/**
 * API route to generate CLI tokens
 * Requires authenticated user session or development mode flag
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    // Check if this is a request to generate a development token
    const requestData = await request.json();
    const isDevelopmentMode = requestData.devMode === true;
    
    // If the user is not authenticated and this is not development mode, return error
    if (!session?.user && !isDevelopmentMode) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate a token
    const tokenPayload = isDevelopmentMode
      ? {
          // Development token with mock user
          userId: 'dev-user',
          email: 'dev@example.com',
          name: 'Development User',
          isDevelopment: true,
        }
      : {
          // Production token with real user data
          userId: session?.user?.email || '', // Using email as unique identifier
          email: session?.user?.email,
          name: session?.user?.name,
        };

    const token = jwt.sign(tokenPayload, CLI_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating CLI token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 