import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CLILoginClient } from './client';

// Server component that handles session data
async function CLILoginServer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  const authStatus = searchParams.auth as string;
  const errorMessage = searchParams.error as string;

  // If user is authenticated and the auth=success flag is present,
  // we can generate a token for CLI use
  if (isAuthenticated && authStatus === 'success') {
    return (
      <CLILoginClient 
        userEmail={session?.user?.email || ''} 
        userName={session?.user?.name || ''} 
      />
    );
  }

  // If there's an error, or the user is not authenticated,
  // show the login options
  return (
    <CLILoginClient 
      userEmail="" 
      userName="" 
      initialError={errorMessage}
      isAuthenticated={isAuthenticated}
    />
  );
}

// Main page component with suspense boundary
export default function CLILoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <Suspense fallback={<div>Loading authentication...</div>}>
        <CLILoginServer searchParams={searchParams} />
      </Suspense>
    </div>
  );
} 