import { NextRequest, NextResponse } from 'next/server';
import { getProviders, signIn } from 'next-auth/react';

/**
 * API route to handle CLI sign-in process
 * Redirects to OAuth provider and specifies callback URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;
    const baseUrl = request.nextUrl.origin;
    
    // Create the sign-in URL for the provider
    const signInUrl = new URL(`${baseUrl}/api/auth/callback/${provider}`);
    
    // Set the callback URL to redirect to the CLI login page after authentication
    const callbackUrl = `${baseUrl}/cli/login?auth=success`;
    signInUrl.searchParams.set('callbackUrl', callbackUrl);
    
    // Add a flag to identify this as a CLI request
    signInUrl.searchParams.set('error_uri', 'cli');
    
    // Redirect to the provider's sign-in page
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Error initiating CLI sign-in:', error);
    
    // Redirect to CLI login page with error
    return NextResponse.redirect(
      new URL(`/cli/login?error=signin_error`, request.nextUrl.origin)
    );
  }
} 