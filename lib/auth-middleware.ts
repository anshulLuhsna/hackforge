import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import jwt from 'jsonwebtoken';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Interface for authenticated user
export interface AuthenticatedUser {
  email: string;
  name?: string | null;
  source: 'session' | 'token';
}

/**
 * Middleware to handle authentication for API routes
 * Checks for both NextAuth session and JWT token authentication
 * 
 * @param request The NextRequest object
 * @returns User information if authenticated, null otherwise
 */
export async function getUserFromAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  // First try to get the user from the session (browser)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return {
      email: session.user.email,
      name: session.user.name,
      source: 'session'
    };
  }
  
  // If no session, check for JWT token in the Authorization header (CLI)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check that the decoded token is an object with an email
      if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
        return {
          email: decoded.email as string,
          name: (decoded as any).name,
          source: 'token'
        };
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }
  
  // No valid authentication found
  return null;
}

/**
 * Middleware to require authentication for API routes
 * 
 * @param handler The API route handler
 * @returns A wrapped handler that checks for authentication
 */
export function withAuth<Params = unknown>(
  handler: (req: NextRequest, user: AuthenticatedUser, params: Params) => Promise<NextResponse>
) {
  return async (req: NextRequest, params: Params): Promise<NextResponse> => {
    // Get user from authentication
    const user = await getUserFromAuth(req);
    
    // If not authenticated, return 401
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please authenticate first' },
        { status: 401 }
      );
    }
    
    // Call the handler with the authenticated user
    return handler(req, user, params);
  };
} 