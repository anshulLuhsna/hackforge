import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Secret key for signing CLI JWT tokens
const CLI_TOKEN_SECRET = process.env.CLI_TOKEN_SECRET || 'hackforge-cli-secret-key';

/**
 * Special route that handles NextAuth callback without being intercepted by our custom handler
 * This allows proper authentication completion while still supporting CLI flow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    // This route should be hit by our custom handler with the original OAuth params
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const fromCli = searchParams.get('from_cli') === 'true';
    
    // Remove our custom parameter before passing to NextAuth
    searchParams.delete('from_cli');
    
    // Get the correct base URL from the request
    const baseUrl = request.nextUrl.origin;
    
    // We need to redirect to the standard NextAuth callback URL
    // BUT we need to set the callbackUrl to our CLI login page if this is from the CLI
    let callbackUrlToUse = fromCli ? `${baseUrl}/cli/login?auth=success` : baseUrl;
    
    // Create a new URL object for the NextAuth standard callback
    const nextAuthCallbackUrl = new URL(`/api/auth/callback/${params.provider}`, baseUrl);
    
    // Add all the original query parameters from the OAuth provider
    for (const [key, value] of Array.from(searchParams.entries())) {
      nextAuthCallbackUrl.searchParams.set(key, value);
    }
    
    // Explicitly set the callbackUrl parameter for NextAuth to use after successful auth
    nextAuthCallbackUrl.searchParams.set('callbackUrl', callbackUrlToUse);
    
    // Add a special flag to prevent redirection loops
    nextAuthCallbackUrl.searchParams.set('from_special', 'true');
    
    // Redirect to the standard NextAuth callback with all parameters
    return NextResponse.redirect(nextAuthCallbackUrl);
  } catch (error) {
    console.error('Error in Special NextAuth callback:', error);
    
    // Redirect to login page with error
    return NextResponse.redirect(
      new URL(`/cli/login?error=special_callback_error`, request.nextUrl.origin)
    );
  }
} 