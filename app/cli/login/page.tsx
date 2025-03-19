'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function CLILoginPage() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/cli/login';

  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cli/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Loading...</h1>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Hackforge CLI Authentication</h1>
          <p className="mb-6 text-gray-600">
            Please sign in to generate a CLI token.
          </p>
          <button
            onClick={() => signIn(undefined, { callbackUrl })}
            className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Hackforge CLI Authentication</h1>
        
        {session && (
          <div className="mb-6">
            <p className="text-green-600 font-medium mb-2">
              ✅ Signed in as {session.user?.email}
            </p>
          </div>
        )}

        {token ? (
          <div className="space-y-6">
            <div className="p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Your CLI Token</h2>
              <div className="bg-black text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
                {token}
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="font-bold text-blue-800">Next steps:</h3>
              <p className="text-blue-700 mt-1">Run this command in your terminal:</p>
              <div className="bg-gray-800 text-white p-2 rounded mt-2 font-mono">
                hackforge token {token}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              This token grants CLI access to your account. Keep it secure and don't share it.
            </p>
            
            <div className="pt-4 border-t border-gray-200">
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">
              Generate a token to use with the Hackforge CLI.
            </p>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                {error}
              </div>
            )}
            
            <button
              onClick={generateToken}
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate CLI Token'}
            </button>
            
            <div className="pt-4 border-t border-gray-200">
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 