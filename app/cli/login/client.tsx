'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export interface CLILoginClientProps {
  userEmail?: string;
  userName?: string;
  initialError?: string;
  isAuthenticated?: boolean;
}

export function CLILoginClient({
  userEmail = '',
  userName = '',
  initialError,
  isAuthenticated = false
}: CLILoginClientProps) {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(initialError || '');
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);

  useEffect(() => {
    // If user is authenticated, generate a token
    if (isAuthenticated && userEmail) {
      generateToken();
    }
  }, [isAuthenticated, userEmail]);

  async function generateToken() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/cli-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
      } else {
        setError(data.error || 'Failed to generate token');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token to clipboard', err);
    }
  }

  function handleLogin(provider: string) {
    // Simply use NextAuth's signIn function with the provider
    // and let it handle the flow, with a callback to our CLI login page
    signIn(provider, { callbackUrl: '/cli/login?auth=success' });
  }

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Generating CLI Token</h2>
          <p className="text-gray-600 mb-4">Please wait while we generate your token...</p>
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Authentication Successful</h2>
          <p className="text-gray-600">
            Logged in as {userName || userEmail}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Your CLI Token
            </label>
            <div className="flex">
              <input
                id="token"
                value={token}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-md font-mono text-sm"
              />
              <button 
                onClick={copyToken}
                className={`ml-2 px-4 py-2 border border-gray-300 rounded-md ${
                  tokenCopied ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tokenCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>To use this token with the Hackforge CLI:</p>
            <pre className="mt-2 bg-gray-100 p-2 rounded">
              hackforge auth:token {token}
            </pre>
          </div>
          <p className="text-sm text-gray-500 text-center mt-6">
            This token will expire in 7 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Hackforge CLI Login</h2>
        <p className="text-gray-600">
          Sign in to get a token for the Hackforge CLI
        </p>
      </div>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <button
            className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            onClick={() => handleLogin('github')}
          >
            Continue with GitHub
          </button>
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => handleLogin('google')}
          >
            Continue with Google
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          You will be redirected to sign in with your chosen provider.
        </p>
      </div>
    </div>
  );
} 